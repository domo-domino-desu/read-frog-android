# Firefox Android 分支移植说明

本文记录当前分支相对 `Eric-Song-Nop/read-frog:firefox-android` 原分支所做的适配。

## 保留的原分支能力

- 新增 `build:firefox-android`、`dev:firefox-android` 和 `zip:firefox-android` 命令，以 Firefox MV3 和 `WXT_FIREFOX_ANDROID=true` 构建 Android 版本。
- Android manifest 声明 `browser_specific_settings.gecko_android`，并移除 Android Firefox 不支持的 `contextMenus` 和 `identity` 权限。
- Android 构建中隐藏右键菜单、Google Drive 同步及对应搜索入口；Google Drive API 在不支持的平台返回可识别错误。
- 页面翻译启停请求串行化，避免悬浮按钮、快捷键、后台消息和触摸手势同时切换时产生竞态。
- 悬浮按钮在粗指针/触摸设备上点击后显示辅助操作，并在 3 秒后自动收起；未完成的重复翻译请求会被合并。

## 相对原分支的主线适配

- 保留当前主线的环境校验、Vite YAML/i18n、CodeMirror 去重、桌面端 `sidePanel` 权限和 Firefox 数据收集声明，只把 Android 差异提取到 `wxt.manifest.ts`，没有用旧版 `wxt.config.ts` 覆盖这些能力。
- 后台脚本仍按主线要求同步注册 MV3 监听器，但 Android 构建不注册右键菜单；桌面端菜单初始化继续等待后台 i18n 完成，避免菜单语言冻结错误。
- 设置页继续使用主线的懒加载路由并保留新增的站点规则页面；仅按平台过滤 Android 不支持的路由，同时为无效地址增加回退。
- Google Drive OAuth 保留主线的类型化环境变量读取，并改成使用时才访问 `browser.identity`，避免 Android 在模块加载阶段因 API 缺失而崩溃。
- 翻译竞态修复落到主线重构后的 `host.content/runtime.ts`，同时保留站点 CSS、页面标题翻译、重翻译预算、缓存清理和同源导航重启逻辑。
- 悬浮按钮保留主线较新的左右停靠、锁定、长按/移动拖拽和 Firefox 侧栏提示；原分支的移动端辅助操作展开逻辑被合并到该实现，而不是退回旧版单侧布局。
- Android zip 使用独立的 `*-firefox-android.zip` 文件名，避免 `zip:all` 覆盖桌面 Firefox 包；发布工作流也会上传该文件。
- 将上游 Firefox 扩展 ID 替换为本分支独立的 `read-frog-android@domo-domino-desu.github.io`，避免与官方 Read Frog 的 AMO 身份和更新渠道冲突。

## 每次提交的 Nightly Release

新增 `.github/workflows/build-every-push.yml`。任意分支的每次 `push` 都会打包 Chrome、Edge、桌面 Firefox 和 Firefox Android，然后创建一个独立的 `Nightly <UTC 时间> (<短 SHA>)` prerelease。对应 tag 使用唯一的 `nightly-<UTC 时间>-<短 SHA>`，不会移动或覆盖已有 tag/release。工作流不上传 Actions artifact；手动触发同样可用。

## Firefox Android 自动签名

新增 `.github/workflows/sign-firefox-android.yml`。推送与 `package.json` 版本一致的 `v*` tag 时会自动构建 Android 包，并通过 Mozilla `unlisted` 渠道申请自分发签名；也可以手动指定尚未提交到 AMO 的已有 `v*` tag。Mozilla 返回的已签名 XPI 会附加到该 tag 对应的 GitHub Release。AMO JWT 只从仓库的 `MOZILLA_JWT_ISSUER` 和 `MOZILLA_JWT_SECRET` Actions Secrets 读取，不写入源码、构建包或 Actions artifact。
