# 股市快讯 (Stock News App)

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 2.7](https://img.shields.io/badge/Vue-2.7-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://stock-new-sand.vercel.app/)

一个现代化的实时股市资讯应用，提供最新的股票新闻和市场动态。

</div>

---

## 📱 功能特性

✨ **核心功能**
- 📰 **实时新闻资讯** - 获取最新的股市资讯和市场动态
- 📅 **事件日历** - 查看重要的财经事件和日程
- 🎨 **亮暗双主题** - 支持自适应系统主题或手动切换
- 💾 **主题持久化** - 记住用户主题偏好设置
- 🚀 **快速响应** - 基于 Vue 2 的高性能应用
- 📱 **响应式设计** - 完美适配桌面和移动设备

---

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue** | ^2.7.10 | 前端框架 |
| **Vue Router** | ^3.6.5 | 路由管理 |
| **Axios** | ^0.21.4 | HTTP 请求 |
| **Vue CLI** | ~5.0.8 | 项目脚手架 |
| **ESLint** | ^8.57.1 | 代码规范 |
| **Font Awesome** | ^6.4.0 | 图标库 |

---

## 📦 项目结构

```
stock-news-app/
├── public/                    # 静态资源
│   └── index.html            # 主 HTML 文件
├── src/
│   ├── assets/               # 资源文件
│   │   └── css/
│   │       └── variables.css # CSS 变量定义
│   ├── components/           # Vue 组件
│   │   └── ThemeBackground.vue
│   ├── views/                # 页面视图
│   │   ├── HomeView.vue      # 新闻资讯页面
│   │   └── EventsView.vue    # 事件日历页面
│   ├── App.vue               # 根组件
│   └── main.js               # 应用入口
├── package.json              # 依赖配置
├── vue.config.js             # Vue CLI 配置
├── .eslintrc.js              # ESLint 配置
└── .gitignore               # Git 忽略配置
```

---

## 🚀 快速开始

### 前置要求

- Node.js >= 12.x
- npm >= 6.x 或 yarn >= 1.x

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

启动本地开发服务器（端口 3000）：

```bash
npm run serve
# 或
yarn serve
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

生成的产物在 `dist/` 目录中

### 代码规范检查

```bash
npm run lint
# 或
yarn lint
```

---

## 📖 使用指南

### 主要页面

**1. 新闻资讯页面** (`/`)
- 展示最新的股市资讯
- 实时更新市场动态
- 点击新闻查看详细内容

**2. 事件日历页面** (`/events`)
- 查看财经日历和重要事件
- 规划投资策略
- 关注重要公告

### 主题切换

点击右上角的太阳/月亮图标切换亮暗模式：
- 🌙 **夜间模式** - 深蓝色主题，适合夜间使用
- ☀️ **日间模式** - 明亮主题，适合日间使用

主题偏好自动保存到本地存储，重新打开应用时自动应用。

---

## 🎨 设计特点

### 主题系统

应用采用 CSS 变量系统来管理颜色和样式：
- 定义在 `src/assets/css/variables.css`
- 支持平滑的亮暗模式过渡
- 自动适应系统主题偏好

### UI 组件

- **响应式布局** - 使用 Flexbox 实现
- **平滑动画** - CSS 过渡效果
- **现代图标** - Font Awesome 6.4.0
- **中英文支持** - 思源黑体和 Roboto 字体

---

## 🌐 部署

### Vercel（推荐）

本项目已部署到 Vercel，访问地址：
🔗 [https://stock-new-sand.vercel.app/](https://stock-new-sand.vercel.app/)

**一键部署到 Vercel：**
1. 将项目 fork 到你的 GitHub 账户
2. 登录 Vercel 并连接 GitHub
3. 选择此仓库进行部署
4. 自动构建和发布

### 其他部署方式

**GitHub Pages：**
```bash
npm run build
# 将 dist/ 目录内容推送到 gh-pages 分支
```

**Docker：**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "serve"]
```

---

## 🔧 配置说明

### Vue CLI 配置

项目通过 `vue.config.js` 进行配置。查看[Vue CLI 文档](https://cli.vuejs.org/config/)了解更多。

### ESLint 规则

ESLint 规则定义在 `.eslintrc.js` 中，基于推荐配置进行自定义。

---

## 📝 脚本命令

| 命令 | 描述 |
|------|------|
| `npm run serve` | 启动开发服务器（端口 3000） |
| `npm run build` | 构建生产版本 |
| `npm run lint` | 检查代码规范并自动修复 |

---

## 🤝 贡献指南

欢迎贡献！请按以下步骤参与：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 **MIT License** 许可证。详见 [LICENSE](LICENSE) 文件。

---

## 👨‍💻 作者

**@xiang0818** - [GitHub 主页](https://github.com/xiang0818)

---

## 📮 反馈和支持

- 🐛 发现 Bug？提交 [Issue](https://github.com/xiang0818/stock-news-app/issues)
- 💡 有想法或建议？欢迎讨论
- ⭐ 如果觉得不错，请给个 Star！

---

## 🔗 相关链接

- 📱 [Live Demo](https://stock-new-sand.vercel.app/)
- 💻 [GitHub 仓库](https://github.com/xiang0818/stock-news-app)
- 📚 [Vue.js 文档](https://vuejs.org/)
- 🎨 [Font Awesome 文档](https://fontawesome.com/)

---

<div align="center">

**Made with ❤️ by xiang0818**

</div>
