# Supabase Edge Function：提醒推送

本文档用于把前端的 `VITE_REMINDER_PUSH_WEBHOOK` 接到 Supabase Edge Function，实现真实推送。

```bash
YOUR_PROJECT_REF=bkxivnvduiwkklaumrvy
SCHEDULER_TOKEN=lba5TAgxEU6D4isc8XnBqrQP0KGmkh7joIWRYuVvLdJ1SNZw
```

## 1. 部署函数

在项目根目录执行：

```bash
supabase functions deploy reminder-push --project-ref <YOUR_PROJECT_REF>
supabase functions deploy reminder-scheduler --project-ref <YOUR_PROJECT_REF>
```

函数入口：

- `supabase/functions/reminder-push/index.ts`
- `supabase/functions/reminder-scheduler/index.ts`

## 2. 配置函数 Secrets

至少建议配置以下密钥：

```bash
supabase secrets set REMINDER_PUSH_TOKEN=<YOUR_STRONG_TOKEN> --project-ref <YOUR_PROJECT_REF>
supabase secrets set SCHEDULER_TOKEN=<YOUR_SCHEDULER_TOKEN> --project-ref <YOUR_PROJECT_REF>
supabase secrets set PUSH_CHANNEL=bark --project-ref <YOUR_PROJECT_REF>
```

### 可选渠道 A：Bark（iOS 推送）
674ca3e108e77abb6cf8c8edbdb0bd8f007b4d23095eb17b261d7f886e4af1d3

```bash
supabase secrets set BARK_DEVICE_URL=<YOUR_BARK_DEVICE_URL> --project-ref <YOUR_PROJECT_REF>
```

说明：

- `BARK_DEVICE_URL` 通常类似 `https://api.day.app/<device_key>`。
- `PUSH_CHANNEL=bark` 时函数会调用 Bark 发送通知。

### 可选渠道 B：Server酱（微信推送）
SCT340663TnGPIeaXqohDtvxeunlX3N3CH

```bash
supabase secrets set PUSH_CHANNEL=serverchan --project-ref <YOUR_PROJECT_REF>
supabase secrets set SERVERCHAN_SENDKEY=<YOUR_SENDKEY> --project-ref <YOUR_PROJECT_REF>
```

### 可选渠道 C：自定义 Webhook

```bash
supabase secrets set PUSH_CHANNEL=custom-webhook --project-ref <YOUR_PROJECT_REF>
supabase secrets set CUSTOM_PUSH_WEBHOOK_URL=<YOUR_WEBHOOK_URL> --project-ref <YOUR_PROJECT_REF>
```

## 3. 前端环境变量

在前端 `.env.local` 中配置：

```bash
VITE_REMINDER_PUSH_WEBHOOK=https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/reminder-push
VITE_REMINDER_PUSH_TOKEN=<YOUR_STRONG_TOKEN>
```

前端请求头会自动带上 `x-reminder-token`。

## 4. 启用自动定时推送

在 Supabase SQL Editor 执行：

- `supabase/schedule-reminder.sql`

替换其中的：

- `<YOUR_PROJECT_REF>`
- `<YOUR_SCHEDULER_TOKEN>`

说明：

- 任务会每分钟触发一次 `reminder-scheduler`。
- 实际是否发送由函数内部控制：仅对命中当前分钟、且已授权订阅的用户发送。
- `reminder_dispatch_logs` 表会记录发送结果，并按 `(user_id, dispatch_date, reminder_kind)` 去重，避免重复发送。

## 5. 本地验证

在“提醒设置”页面点击“发送测试提醒”，看到以下任一结果即为成功：

- 页面提示“测试推送已发送，请留意消息通知”
- Edge Function 日志返回 `ok: true`

自动调度验证：

- 在提醒设置页把提醒时间设为“当前时间 + 1 分钟”
- 等待 1-2 分钟后检查：
  - 推送是否到达
  - `public.reminder_dispatch_logs` 是否新增记录（`status=sent`）

## 6. 常见错误

- `401 invalid_token`：前端 `VITE_REMINDER_PUSH_TOKEN` 与 `REMINDER_PUSH_TOKEN` 不一致。
- `401 invalid_scheduler_token`：定时任务 SQL 里的 token 与 `SCHEDULER_TOKEN` 不一致。
- `500 missing_bark_device_url`：选择了 `bark` 渠道但没配置 `BARK_DEVICE_URL`。
- `500 missing_serverchan_sendkey`：选择了 `serverchan` 渠道但没配置 `SERVERCHAN_SENDKEY`。
- `500 push_failed`：第三方推送服务返回错误，查看 Edge Function 日志中的 `message` 字段。
