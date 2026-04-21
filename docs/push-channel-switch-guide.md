# 推送通道切换指南（Bark / Server酱 / Custom Webhook）

本文档用于维护 `reminder-push` / `reminder-scheduler` 的推送通道切换。

项目：`bkxivnvduiwkklaumrvy`

## 当前状态

- 当前通道：`serverchan`
- 已配置：
  - `BARK_DEVICE_URL`
  - `SERVERCHAN_SENDKEY`
  - `SCHEDULER_TOKEN`
  - `REMINDER_PUSH_TOKEN`

## 一、切换原则

- 只需要改一个 secret：`PUSH_CHANNEL`
- 其他 secret 保留即可，不影响切换
- 可选值：
  - `bark`
  - `serverchan`
  - `custom-webhook`

## 二、切换命令

下面命令在项目根目录执行：

```powershell
& 'D:\ctsi\practice\seasonal-spirit-pets\.npm-cache\_npx\aa8e5c70f9d8d161\node_modules\supabase\bin\supabase.exe' secrets set PUSH_CHANNEL=bark --project-ref bkxivnvduiwkklaumrvy
```

```powershell
& 'D:\ctsi\practice\seasonal-spirit-pets\.npm-cache\_npx\aa8e5c70f9d8d161\node_modules\supabase\bin\supabase.exe' secrets set PUSH_CHANNEL=serverchan --project-ref bkxivnvduiwkklaumrvy
```

```powershell
& 'D:\ctsi\practice\seasonal-spirit-pets\.npm-cache\_npx\aa8e5c70f9d8d161\node_modules\supabase\bin\supabase.exe' secrets set PUSH_CHANNEL=custom-webhook --project-ref bkxivnvduiwkklaumrvy
```

## 三、各通道必备 Secret

### 1) Bark

```powershell
... supabase.exe secrets set BARK_DEVICE_URL=https://api.day.app/<device_key> --project-ref bkxivnvduiwkklaumrvy
```

### 2) Server酱

```powershell
... supabase.exe secrets set SERVERCHAN_SENDKEY=<sendkey> --project-ref bkxivnvduiwkklaumrvy
```

### 3) Custom Webhook

```powershell
... supabase.exe secrets set CUSTOM_PUSH_WEBHOOK_URL=https://your-domain/push --project-ref bkxivnvduiwkklaumrvy
```

## 四、验证方式

### 方式 A：页面测试（推荐）

- 进入“提醒设置”
- 点击“发送测试提醒”

### 方式 B：直接验证 Server酱通道

```powershell
$body = '{"title":"通道测试","desp":"维护脚本触发测试"}'
Invoke-RestMethod -Method Post -Uri 'https://sctapi.ftqq.com/<sendkey>.send' -ContentType 'application/json' -Body $body
```

返回 `code: 0` 表示可用。

## 五、排错清单

- 没收到消息：
  - 检查 `PUSH_CHANNEL` 是否为目标通道
  - 检查通道对应 secret 是否正确
  - 查看 Edge Function 日志（`reminder-push` / `reminder-scheduler`）
- 定时不触发：
  - 检查 `schedule-reminder.sql` 是否已创建 cron job
  - 检查 `SCHEDULER_TOKEN` 与 SQL 里请求头是否一致

## 六、建议

- 平时用 `bark` 进行开发调试（反馈快）
- 正式运行时按你的主要通知入口切换到 `serverchan`
- 不建议把 key 写死在代码里，统一放在 Supabase secrets 管理
