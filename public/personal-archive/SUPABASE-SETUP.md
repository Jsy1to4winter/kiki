# Supabase 接入（当前未启用）

当前 `supabase-config.json` 的 enabled 为 false：直接打开编辑页，资料和图片保存在当前浏览器。密码入口暂不启用。

## 建立项目

1. 创建 Supabase 项目，在 SQL Editor 中运行项目根目录 `supabase/migrations/202611020001_archive.sql`。
2. 在 Authentication > Users 中创建管理员邮箱和密码。可关闭公开注册。复制这个用户的 UUID，再执行：

   ```sql
   insert into public.archive_admins(user_id) values ('替换为管理员的用户UUID');
   ```

3. 从项目的 Connect / API Keys 取得 Project URL 与 Publishable key（旧版 anon key 也可）。修改本目录 `supabase-config.json`：

   ```json
   {"enabled": true, "url": "https://你的项目.supabase.co", "publishableKey": "你的公开API密钥"}
   ```

   不要使用 service_role 或 secret key。不要把管理员密码写入代码。

4. 发布静态网站。Supabase 提供数据库、Auth 和 Storage，网页仍由 GitHub Pages 或其他静态托管发布；不需要把网页文件放进数据库。
5. 点击编辑按钮，输入管理员邮箱和密码。通过 Supabase Auth 和管理员检查后，保存会同步到数据库，所有访客都能读取。相册上传写入 Storage，前三张按上传顺序作为封面。每张图片上限 20MB。

只有列入 archive_admins 的账号可以写入资料、图片记录和图片存储。权限由数据库 RLS 和 Storage 策略执行。管理员登录令牌只保存在当前页面内存，刷新后重新登录，不保存明文密码。

## 首次同步已有本机资料

连接前先从编辑页导出 site-profile.json。连接后登录，导入该文件并保存到云端。本机相册图片不会自动公开；请重新上传想公开的图片。导出文件可能包含头像，请自行保管。

未创建项目时，网站继续使用 JSON 默认内容与本机草稿。配置为 enabled=true 后，网页使用云端资料；断网或配置不正确会报告错误，不会假装已同步。

## 验证

用管理员账号保存文字和上传四张以上图片，再用无痕窗口打开网站，检查文字、前三张封面和完整相册。普通访客与未列入 archive_admins 的账号应无法写入。

本次已完成模拟 Supabase API 的前端检查；尚未连接真实项目，SQL 和真实云端权限须在建好项目后执行并验证。
