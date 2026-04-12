# Supabase 接入方案

## 目标

- 用 Supabase 承接“用户维度的主页状态”同步。
- 保留本地存储兜底，不阻塞现有体验。
- 当前阶段先接匿名用户，后续可平滑升级到邮箱/微信等正式登录。

## 数据模型

当前使用单表 `home_profiles`：

- `user_id`：关联 `auth.users.id`，一人一行
- `interaction_done`、`growth_value`、`streak_days`、`pet_bubble`
- `favorite_pet_ids`：收藏灵宠 ID 数组
- `city_name`：天气查询城市
- `last_interact_date`
- `record_entries`：互动与里程碑记录（JSON）
- `updated_at`

详见 `supabase/schema.sql`。

## 鉴权策略

- 前端启动时调用 `signInAnonymously`（若已有 session 则复用）。
- 所有数据读写都带 `auth.uid()`。
- 通过 RLS 限制“只能读写自己的行”。

## 前端同步策略

### 启动阶段（hydrate）

1. 先读本地存储，保证首屏秒开。
2. 若配置了 Supabase 环境变量：
   - 获取匿名用户 ID；
   - 读取云端 profile；
   - 云端存在：覆盖到本地并回写 localStorage；
   - 云端不存在：把当前本地数据 upsert 到云端初始化。

### 运行阶段（persist）

- 所有本地状态变更先写本地；
- 再异步 upsert 到 Supabase；
- 云端失败只告警不打断交互。

## 需要配置的环境变量

在本地 `.env.local` 中添加：

```bash
VITE_SUPABASE_URL=你的项目URL
VITE_SUPABASE_ANON_KEY=你的anon key
```

未配置时自动退回“纯本地模式”。
