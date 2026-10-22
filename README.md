# KIKI · 实时三维个人日志

日志主体由 Three.js 实时渲染。原平面 SVG 场景已经移除；纸层、封面、夹子、票据和立体图形均为场景中的网格，不以整张图片冒充三维画面。

## 运行与构建

Node.js 22.12+，已使用 24.19.0 验证。

```sh
npm ci --cache /workspace/.npm-cache
npm run dev -- --port 5174 --strictPort
npm run build
```

`dist/` 是可部署的静态网站，无数据库、后端或密钥依赖。需要浏览器支持 WebGL 2。网站有阴影映射、SSAO 环境遮挡、环境光以及粗糙度/凹凸纤维纹理；会按设备能力限制分辨率。软件 WebGL 渲染会比真实 GPU 慢；CPU 渲染使用原工具生成的网格与纹理搭配粗糙物理材质，GPU 保留原生着色器。

## 场景与交互

- 主色与强调色：`#08fff9`。默认中央区域只有三维物件，没有说明、提示或名称叠字。
- 点击纸张时，使用 GSAP timeline 将真实模型移到中心并转正；点击空白或 Escape 恢复。聚焦后可通过下方按钮阅读内部内容。
- 目录、项目与联系信息仍保存在日志内部，默认隐藏。当前履历文案是演示资料。
- 左侧 `left-sticker-group` 是独立 Three.js Group，保持在左侧，不参与物品聚焦。
- 根据用户最新要求，工牌去掉原标识和文字；`@Jsy_1to4` 是独立的 Sticker Forge 文字网格，贴在空白工牌上。工牌和文字均为静态贴附，不触发点击、拖拽、卷曲、激光入场或声音。
- 首次场景开场粒子采样自真实网格顶点；减少动态模式直接显示场景并关闭大位移过渡。

## 文件

- `src/journal-scene.js`：Three.js 物件、材质、灯光、阴影、SSAO、射线检测、聚焦和恢复。
- `src/main.js`：隐藏内容阅读器与键盘入口。
- `src/content.js`：个人资料和演示案例。
- `public/textures/badge-cutout.png`：根据用户参考图编辑的透明空白工牌纹理，不是整个日志的静态背景。
- `vendor/sticker-forge/`：来自 CatsJuice/sticker-forge 的 MIT 源码和本项目集成适配说明。原始源码下载包仍在 `downloads/`。
- `.agents/skills/`：之前安装的 GSAP 技能与工具打包技能。

## 部署

`npm run build` 后将 `dist/` 中的内容打包，保证 `index.html` 位于压缩包根目录。仓库中的 `kiki-website-deploy.zip` 为构建成品。手动上传的 Netlify 网站需重新上传新版文件后才会更新，GitHub 源码更新本身不代表网站已重新部署。
