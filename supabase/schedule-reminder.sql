-- 1) 启用扩展（只需执行一次）
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) 每分钟触发一次 reminder-scheduler
-- scheduler 会在函数内部按 Asia/Shanghai 与用户 reminder_time 做筛选，
-- 只有命中时间的用户才会发送提醒。
select
  cron.schedule(
    'reminder-scheduler-every-minute',
    '* * * * *',
    $$
    select
      net.http_post(
        url := 'https://bkxivnvduiwkklaumrvy.supabase.co/functions/v1/reminder-scheduler',
        headers := '{"Content-Type":"application/json","x-scheduler-token":"lba5TAgxEU6D4isc8XnBqrQP0KGmkh7joIWRYuVvLdJ1SNZw"}'::jsonb,
        body := '{}'::jsonb
      ) as request_id;
    $$
  );

-- 3) 查看当前定时任务
select jobid, jobname, schedule, active from cron.job order by jobid desc;

-- 4) 如需停用任务
-- select cron.unschedule('reminder-scheduler-every-minute');
