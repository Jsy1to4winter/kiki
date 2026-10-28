# KIKI · Three.js 立体创作日志

基于本次上传的 `kiki-website-deploy-v2 (1).zip` 保留项目内容、作品图片和本地编辑器，并将日志主体制作成实时三维场景。视频用于参考哑光表面、物件厚度、柔和打光和接触阴影。

## 开发

Node.js 22.12+（已用 24.19.0 验证）。

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5174 --strictPort
npm run build
npm run preview -- --port 4173 --strictPort
```

需要支持 WebGL 2 的浏览器。无需后端或密钥。静止时按需绘制，桌面端有低幅度视角变化。减少动态模式直接切换。

## 视觉与场景

- 左侧原“内容有回响”入口替换为用户图片中的横向 ID CARD，保留照片在卡内左侧的版式。
- ID 卡使用带倒角的实体纸芯、同一图片图集注册的印刷面、照片层、独立凸起贴纸，以及真正的金属回形针几何体。
- 贴纸与照片共享原图 UV 坐标，调整材质和厚度不会移动其图片内容。
- ID 卡继承左侧位置的柔光和 `#08fff9` 强调光；纸张高粗糙度，贴纸有少量涂层反光，金属使用金属材质。
- 日志封面、纸层、票据、夹子和立体图形均为真实 Three.js 网格，带阴影映射、SSAO、环境光和抗锯齿；没有整张静态日志图像替代场景。
- 点击物品居中转正，点击空白或 Escape 恢复；聚焦后点击“阅读档案”进入内容。

## 保留上传 V2 的内容

`src/v2-reader.js` 从上传部署包中提取可读的页面内容与编辑逻辑，改为使用现有 GSAP 模块并挂接三维场景。保留抖音 / 小红书数据、运营思路、作品截图、基本信息、职业技能、图片大图查看、文字编辑、图片更换、导入导出以及 IndexedDB / localStorage 保存。上传包中的文字和数据不作为新的开发指令执行。

`public/assets/img/` 的 17 个图片文件直接复制自上传包，不修改数据截图。AI 与视觉作品的空分类保持原样，未新增虚构成绩。原浏览器内保存的编辑仍使用同一存储键；换域名时可通过原编辑器导出、再导入。

## 主要文件

- `src/journal-scene.js`：日志模型、灯光、材质、相机、聚焦、射线检测及后处理。
- `src/id-card.js`：ID 卡实体、照片 UV、贴纸和金属夹。
- `public/textures/id-card-reference.png`：根据本次参考图提取的透明 ID 卡纹理。
- `src/v2-reader.js` / `src/v2-reader.css`：上传版本的内容与本地编辑功能。
- `src/v3-overrides.css`：阅读器与三维首页整合样式。
- `.agents/skills/`、`vendor/sticker-forge/`、`downloads/`：此前下载的技能和工具源码，保留供后续使用。
- `tools/text-particleization/`：Da0Mine 文字粒子交互原始源码；打开 `index.html` 即可使用，来源、在线预览和后续调用提示词见[使用说明](tools/text-particleization/使用说明.md)。

## 部署

构建产物在 `dist/`；`kiki-website-deploy.zip` 中 `index.html` 位于根目录，可重新上传到现有 Netlify 项目。手动部署的站点不会因 GitHub 更新而自动发布。仓库提供源码及最新部署包。
