# 胡英杰 · 个人网站

一个**纯静态**的个人主页：没有后端、没有数据库、没有构建工具，也没有任何第三方依赖。
双击 `static/index.html` 就能看，扔到任何静态托管上就能上线。

---

## 一、目录结构

```
personalWebsite/
├── README.md               本文件
└── static/
    ├── index.html          首页（Hero / 个人经历 / 作品集 / 联系方式）
    ├── email.html          留言页
    ├── css/
    │   └── index.css       全部样式（含设计令牌，两个页面共用）
    ├── js/
    │   ├── data.js         ★ 站点内容数据源 —— 改内容只需要改这个文件
    │   ├── index.js        首页逻辑：读取 data.js 并渲染 + 页面交互
    │   └── email.js        留言页逻辑：表单校验 + mailto 提交 + 复制邮箱
    └── src/
        ├── index.jpg       全屏背景图
        └── profilePhoto.jpg 头像
```

---

## 二、怎么改网站内容

**所有内容都在 `static/js/data.js` 里。** 改完刷新页面即可（若没变化按 `Ctrl+F5` 强刷）。

| 想改什么 | 改 `data.js` 里的哪一段 |
| --- | --- |
| 姓名、简介、头像、打字机角色 | `owner` |
| 收留言的邮箱 | `owner.contactEmail` |
| 联系方式卡片（GitHub / 邮箱 / QQ…） | `owner.contacts` |
| 个人经历时间轴 | `experiences` |
| 作品集 | `projects` |

### ⚠️ 一个必须知道的坑

首页 `index.html` 的 Hero 区（姓名、简介、角色、头像）**同时存在于 HTML 和数据文件两处**，
而且 **`data.js` 会覆盖 HTML**。

所以：**改 Hero 内容请改 `data.js`，改 HTML 是无效的。**
（HTML 里保留一份静态内容，只是为了「JS 没加载时也有东西可看」和 SEO。）

### 各字段说明

**`owner.contacts[].icon`** 可选值：`github` `mail` `chat` `link`
传未知值会自动回退成通用链接图标，不会报错。

**`experiences`** 里 `end` 填 `"至今"` 表示进行中；时间格式 `YYYY-MM`，
前端会自动显示成「2025 年 1 月」。

**`projects[].category`** 会自动生成顶部的分类筛选按钮；
只有一类时筛选栏会自动隐藏。`link` 留空则该卡片不显示「查看详情」。

---

## 三、本地预览

直接双击 `static/index.html` 即可。

但建议起个本地服务（`file://` 协议下部分浏览器 API 会受限，比如一键复制）：

```bash
cd static
python -m http.server 8000
# 然后访问 http://127.0.0.1:8000
```

---

## 四、部署

纯静态文件，任何静态托管都能直接放：

- **GitHub Pages**：把 `static/` 里的内容推到仓库根目录，在 Settings → Pages 开启
- **Vercel / Netlify / Cloudflare Pages**：拖拽 `static/` 文件夹即可
- **自己的服务器**：把 `static/` 里的文件丢进 Nginx 的站点目录

没有构建步骤，不需要 Node，不需要 `npm install`。

---

## 五、留言功能是怎么工作的

**没有后端，留言靠 `mailto:` 协议。**

访客在留言页填完表单点「发送」，浏览器会唤起**访客自己电脑上的邮件客户端**
（Outlook / 邮件 / Foxmail 等），收件人、主题、正文都已经自动填好，
访客只需点一下「发送」，邮件就发到 `data.js` 里配置的 `contactEmail`。

优点：零成本、零注册、零第三方依赖、访客邮箱地址不会经过任何中间服务器。

局限：

1. 访客设备上必须配置了邮件客户端，否则点了没反应。
   → 页面底部已提供「复制邮箱」按钮作为兜底。
2. 访客的浏览器会短暂提示「此网站试图打开外部应用」。
3. 没有留言记录留存，收没收到全看你邮箱。

### 如果想升级成"真正的"表单提交

不想依赖访客的邮件客户端，可以接第三方表单服务（都免费、无需自建后端）：

| 服务 | 特点 |
| --- | --- |
| [Formspree](https://formspree.io) | 免费额度每月 50 条，直接 POST 到它给的 URL |
| [Web3Forms](https://web3forms.com) | 免费额度更高，只需一个 access key |
| [Getform](https://getform.io) | 支持文件上传 |

接入方式：把 `js/email.js` 里 `initForm()` 的提交分支从「拼 mailto」改成
「`fetch` POST 到第三方服务地址」，表单校验逻辑可以完全复用。
（本项目 v1 版本实现过完整的 `fetch` 提交 + 优雅降级，需要时可以从 git 历史里翻。）

---

## 六、已实现的交互功能

**首页**
- 打字机效果轮播角色
- 导航条滚动加重 + 当前区块自动高亮
- 移动端汉堡菜单
- 内容滚动进场动画（含 IntersectionObserver 失灵时的兜底）
- 作品集按分类筛选
- 联系方式卡片一键复制
- 返回顶部按钮

**留言页**
- 四字段实时校验（失焦校验、输入即清错）
- 留言字数实时统计（超 450 字变橙提醒）
- mailto 提交 + 复制邮箱兜底
- 全局 Toast 提示

---

## 七、设计规范

改样式时建议沿用这套令牌（都定义在 `css/index.css` 的 `:root` 里）：

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `--c-primary` | `#1677ff` | 主色（海洋蓝，取自背景图） |
| `--c-accent` | `#18c39b` | 点缀色（青绿，取自背景植被） |
| `--glass-strong` | `rgba(255,255,255,.82)` | 内容卡片底色 |
| `--radius` / `--radius-lg` | `16px` / `24px` | 圆角 |
| `--ease` / `--dur` | `cubic-bezier(.22,.61,.36,1)` / `.32s` | 动效节奏 |

视觉风格是 **Glassmorphism（玻璃拟态）**：半透明白 + `backdrop-filter: blur()` +
1px 半透明描边 + 圆角，内容浮在全屏背景图之上。

**命名约定**（沿用项目原有习惯）：
- 类名用小驼峰，如 `navigationBar`、`portfolioParentDiv`
- 元素 id 用「模块-序号-字段」，如 `portfolio-1-Title`、`portfolio-1-OverView`

---

## 八、浏览器兼容

使用了 `backdrop-filter`（毛玻璃）、`IntersectionObserver`、`Clipboard API`。

- Chrome / Edge / Safari 现代版本：完整效果
- Firefox：毛玻璃效果在较新版本才支持，旧版本会退化为半透明白底（不影响可读性）
- 复制功能在 `file://` 或非 HTTPS 环境下会自动降级为 `execCommand` 兜底

---

## 九、待办 / 可优化点

- [ ] `data.js` 里 `experiences` 的「某大学」「某互联网公司」是占位内容，需换成真实信息
- [ ] 作品集的 `link` 目前都指向同一个 GitHub 主页，可换成各项目的实际地址
- [ ] 如需上线，建议给 `css`/`js` 加版本号或哈希，避免浏览器缓存旧文件
- [ ] 可考虑加一个「微信二维码」联系方式（`owner.contacts` 里加一项即可）
