# P0 launch design for Seasonal Spirit Pets

## Overview
This design upgrades the current MVP into a minimum launch-ready version without introducing a full account system. The scope is intentionally limited to closing the most visible product gaps in the existing app: settings access, city management, reminder preferences, in-app feedback submission, legal pages, and basic error handling.

## Goals
- Turn the current "我的" page into a functional settings hub.
- Allow users to control the city used for weather display.
- Add reminder preferences now, even though true reminder delivery is deferred.
- Add a real in-app feedback submission path backed by Supabase.
- Add privacy policy and terms pages required for launch review.
- Improve resilience for the highest-risk failure states.

## Out of scope
- Full login/account system
- Real push notifications or subscription messaging
- Feedback history, attachments, or customer support chat
- CMS or remote legal content management
- Large-scale refactor of store architecture

## Product scope

### 1. Settings hub
The "我的" page will expose all launch-relevant entries as active navigation items:
- 我的收藏
- 连续陪伴记录
- 城市设置
- 提醒设置
- 意见反馈
- 隐私政策
- 用户协议
- 关于节气灵宠

The current implementation in `src/pages/mine/index.vue` should stop routing by item index and instead route by explicit target path. This avoids brittle behavior when item order changes.

### 2. City settings
A new city settings page will support two user paths:
- Use current location to resolve the city
- Manually enter and save a city name

Behavior rules:
- On page load, show the currently saved city.
- "Use current location" triggers location lookup and updates the saved city.
- Manual city input can override the saved city.
- Saving the city should persist immediately, then attempt to refresh weather.
- If weather refresh fails, the city still remains saved and the user gets a non-blocking message.
- Empty city names cannot be saved.

This keeps the city model intentionally simple: one display city string, no search suggestions, no city ID persistence in this phase.

### 3. Reminder settings
A new reminder settings page will establish a stable preference model without promising actual delivery yet.

Stored preferences:
- reminderEnabled
- dailyReminderEnabled
- solarTermReminderEnabled
- reminderTime

Behavior rules:
- The page explicitly states that the current version only saves preferences.
- If the master switch is off, child reminder switches are disabled.
- Default reminder time is a fixed value such as `20:30`.
- Preferences persist locally and sync through the existing home profile path when Supabase is available.

This avoids rework later when real reminder delivery is added.

### 4. Feedback submission
A new in-app feedback page will submit user feedback to Supabase.

Form fields:
- category (产品建议 / Bug 反馈 / 体验问题 / 其他)
- content (required)
- contact (optional)

Submission metadata:
- anonymous Supabase user id
- current city name
- current solar term
- created_at timestamp

Behavior rules:
- Empty content cannot be submitted.
- Submission shows a loading state and prevents duplicate clicks.
- On success, show success feedback and clear the form.
- On failure, preserve the current form contents and allow retry.
- If Supabase is unavailable or not configured, the page clearly tells the user feedback cannot be submitted right now.

This is intentionally one-way submission only.

### 5. Legal pages
Two local static pages will be added:
- Privacy policy
- Terms of service

Behavior rules:
- Both pages are always viewable without network access.
- Both are reachable from the settings hub.
- Content is stored locally in the app for this phase.

## Architecture and module design

### New pages
- `src/pages/settings/city.vue`
- `src/pages/settings/reminder.vue`
- `src/pages/feedback/index.vue`
- `src/pages/legal/privacy.vue`
- `src/pages/legal/terms.vue`

### Routing
Update route constants to include the new pages. The mine page should navigate by route key or route string, not by list index.

### Store changes
Extend `src/store/home.ts` to include the reminder preference fields in the persisted state. Reuse the existing local persistence and Supabase synchronization flow for:
- cityName
- reminderEnabled
- dailyReminderEnabled
- solarTermReminderEnabled
- reminderTime

Feedback form state should not be persisted in the home store. It should remain local to the feedback page.

### Services
Keep responsibilities narrow:
- `src/services/weather.ts`: weather lookup only
- `src/services/home-profile.ts`: sync home/profile-style state only
- `src/services/feedback.ts`: new service for feedback submission only

This preserves a clean boundary between durable user settings and one-off feedback writes.

## Supabase design

### Home profile
If the profile storage model is column-based, add fields for:
- `reminder_enabled`
- `daily_reminder_enabled`
- `solar_term_reminder_enabled`
- `reminder_time`

If the profile payload is already JSON-shaped, extend that payload accordingly.

### Feedback table
Add a new table: `feedback_entries`

Recommended fields:
- `id`
- `user_id`
- `category`
- `content`
- `contact`
- `city_name`
- `solar_term`
- `created_at`

The `user_id` reuses the existing anonymous Supabase identity.

## Error handling

### City settings
- Location denied or failed: tell the user to enter a city manually.
- Weather refresh failed: keep the saved city and show a lightweight error message.

### Reminder settings
- No backend dependency is required for local save.
- If Supabase sync fails, keep the local preference and do not block the user.

### Feedback
- Validation failure: block submit and explain the missing required content.
- Submission failure: keep typed content intact.
- Supabase unavailable: show that feedback cannot be submitted at the moment.

### Legal pages
- No network dependency.
- No runtime fetch.

## Verification plan
At minimum, verify:
- All settings entries open correctly from the mine page.
- City settings can show current city, save manual city, and retry current location.
- Reminder settings persist and render correctly after reload.
- Feedback submits successfully to Supabase.
- Failed feedback submission preserves form content.
- Privacy policy and terms pages open correctly.
- Weather failure does not crash the home flow.
- Supabase-disabled mode still allows local settings flows except remote feedback submission.

## Recommended implementation order
1. Add routes and update the mine page navigation model.
2. Implement city settings.
3. Implement reminder settings.
4. Add privacy policy and terms pages.
5. Add Supabase feedback table, feedback service, and feedback page.
6. Patch high-priority loading, empty, and error states.
7. Run end-to-end verification across the new settings flow.
