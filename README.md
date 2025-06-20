

# Contents

- [任务分级](#任务分级)
- [任务整理](#任务整理)
- [信息全景分析数据系统 (Edu-Data-Analysis-System)](#信息全景分析数据系统-edu-data-analysis-system)
  - [技术架构 (System Architecture)](#技术架构-system-architecture)
  - [技术栈 (Technology Stack)](#技术栈-technology-stack)
  - [项目结构 (Project Structure)](#项目结构-project-structure)
- [已实现功能 (Features)](#已实现功能-features)
- [安装与配置 (Setup & Configuration)](#安装与配置-setup--configuration)
  - [1. 先决条件](#1-先决条件)
  - [2. 数据库设置](#2-数据库设置)
  - [3. 后端服务安装](#3-后端服务安装)
  - [4. 前端安装](#4-前端安装)
- [运行项目 (Running the Project)](#运行项目-running-the-project)
- [开发者 (Author)](#开发者-author)
- [BUG待解决](#bug待解决)
- [nodejs下载功能](#nodejs下载功能)
- [Bug 提交 (Bug Report)](#bug-提交-bug-report)

---



# 任务分级

做一个b/s程序，做一个信息全景分析数据系统，面向教育管理系统的数据处理与可视化平台，前后端分离，Vue.js或者react，Angular作为前端，nodejs作为后端，针对海量数据进行整理和分析，对数据进行可视化

需要完成的任务：

1. 有用户登录界面，需要有管理员后台和用户登录验证，使用Mysql进行本地存储用户的账号和密码，对应存储这个用户的账号数据，然后管理员的账号为admin ， 密码为adminadmin
2. 能进行一个excle数据表格的导入和键盘输入创建数据的功能，并使用本地的mysql进行存储，并且支持表格的导出
3. 对数据进行综合分析统计，学生成绩分布走势，学生画像自动生成，数据报表管理，允许采用折线图，热力图，模型图进行可视化导出，并且我需要能支持png格式的导出，
4. 做一个代办事项的功能页面，然后我需要 支持一个 markdown的输入和CSS的渲染，然后支持导出markdown



------

## 任务整理@

### 任务分析 (Project Analysis)

核心是构建一个**面向教育数据的处理与可视化平台**。关键点在于将后端的数据处理能力与前端的交互可视化能力结合起来。

- **技术选型建议**:
  - **前端**: **Vue 3** + **Vite** + **Element Plus** / **Ant Design Vue**。Vue 3 的组合式 API (Composition API) 能更好地组织复杂逻辑，Vite 提供极速的开发体验，UI 库则能快速构建美观的界面。
  - **后端**: **Node.js** + **Express** / **Koa**。Express 是一个成熟、稳定且社区庞大的框架，非常适合快速开发 RESTful API。
  - **数据库**: **MySQL**。使用 ORM (对象关系映射) 工具如 **Sequelize** 或 **Prisma** 来操作数据库，可以提高开发效率并减少 SQL 注入风险。
  - **可视化库**: **ECharts**。百度出品的图表库，功能强大，文档丰富，特别适合处理教育数据中常见的图表类型，并且原生支持图片导出。
  - **认证方案**: **JWT (JSON Web Tokens)**。无状态的认证机制，非常适合前后端分离的应用。
- **系统流程**:
  1. **用户** 在前端登录页面输入账号密码。
  2. **前端** 将登录信息发送到 **后端** API。
  3. **后端** 查询 MySQL 数据库，验证用户信息。
  4. 验证通过后，后端生成一个 **JWT** 返回给前端。
  5. **前端** 保存 JWT，并在后续所有请求的请求头 (Header) 中携带它。
  6. 用户在前端进行数据导入、分析、可视化等操作，前端调用相应后端 API。
  7. **后端** API 接收请求，通过中间件验证 JWT，然后执行数据库操作、数据分析等业务逻辑，并将结果返回给前端。
  8. **前端** 接收数据，使用 ECharts 等库进行渲染和展示。

------



# 信息全景分析数据系统 (Edu-Data-Analysis-System)

这是一个前后端分离的现代化B/S架构数据处理与可视化平台，旨在为教育管理领域提供一个高性能、高可扩展性的解决方案。系统采用了**微服务**思想，将不同职责的后端逻辑解耦，以应对多样化的业务需求。



## 技术架构 (System Architecture)

系统采用混合后端架构，充分发挥不同技术的优势。前端作为统一入口，通过Node.js主后端与各个微服务进行智能交互。

```
                  ┌───────────────────────┐
                  │ Python 分析服务 (5000)│
                  └───────────▲───────────┘
                              │
┌──────────────┐      ┌───────┴────────┐      ┌───────────────────────┐
│ 前端 Vue 应用 ├─────►│ Node.js 主后端 ├─────►│ Rust 优化服务 (8080) │
└──────────────┘      └────────┬───────┘      └───────────────────────┘
                              │
                  ┌───────────▼──────────┐
                  │   MySQL 数据库       │
                  └──────────────────────┘
```

- **Node.js 主后端**: 作为系统的**API网关**和**业务处理中心**。
- **Python 分析服务**: 作为**数据科学计算核心**，处理复杂的统计分析任务。
- **Rust 待办事项服务**: 作为**高性能微服务**，专门处理高并发、低延迟的业务场景。

## 技术栈 (Technology Stack)

- **前端**: Vue 3, Vite, TypeScript, Element Plus, ECharts, Pinia, Axios
- **Node.js 后端**: Express, Sequelize, JWT, Puppeteer
- **Python 后端**: Flask, Pandas, NumPy, Scikit-learn
- **Rust 后端**: Axum, Tokio, SQLx
- **数据库**: MySQL
- **开发工具**: uv (Python包管理), Cargo (Rust包管理), Node.js

## 项目结构 (Project Structure)

```
edu-data-analysis-system/
├── .venv/                  # Python 虚拟环境 (由uv管理)
├── client/               # 前端 Vue.js 项目
│   ├── public/             # 存放静态资源，如 index.html, favicon.ico
│   └── src/                	# 前端核心源码目录
│       ├── api/            		# 封装所有对后端的API请求
│       ├── assets/         		# 存放CSS, 图片, 字体等静态资源
│       ├── components/     		# 可复用的Vue组件 (如KPI卡片, 图标)
│       ├── layouts/        		# 页面布局组件 (如主框架 MainLayout.vue)
│       ├── router/         		# Vue Router 路由配置
│       ├── store/          		# Pinia 全局状态管理
│       ├── types/          		# TypeScript 类型定义文件
│       └── views/         			# 页面级组件 (如登录页, 数据管理页，关于页...)
├── node_modules/           # (自动生成) Node.js 依赖
├── python-analysis/        # Python Flask 数据分析服务
│   ├── app.py              	# Flask 应用主文件和API路由
|   ├── sh/                     # 模拟数据的生成脚本 ，修改自己的MySQL密码
│   └── requirements.txt    	# Python 依赖
├── rust-optimizer/         # Rust Axum 待办事项服务
│   ├── Cargo.toml          	# Rust 项目配置文件和依赖列表
│   └── src/                # Rust 核心源码目录
│       ├── handlers.rs     	# API请求处理器 (业务逻辑)
│       ├── main.rs         	# Rust 应用主入口和路由定义
│       └── models.rs       	# 数据库实体结构体定义
├── server/                 # Node.js Express 主后端 (API网关)
│   ├── controllers/        	# 控制器 (处理具体请求逻辑)
│   ├── middleware/         	# 中间件 (如JWT认证)
│   ├── models/             	# Sequelize 数据库模型定义
│   ├── routes/             	# API路由定义
│   └── app.js              	# Express 应用主入口
├── .gitignore              # Git 忽略文件配置      	
└── README.md               # 项目说明文档

```

## 已实现功能 (Features)

- **响应式与可交互布局:** 整个系统框架支持用户通过拖拽自由调整侧边栏宽度，并能根据屏幕尺寸自动适配。
- **用户认证:** 包含登录、登出、路由守卫、Token持久化等完整的认证流程。
- **数据管理:** 实现了对学生数据的增、删、改、查(CRUD)功能，支持实时搜索、分页，以及通过Excel进行批量导入和导出。
- **可视化分析:** 构建了可定制的图表仪表盘，支持折线图、热力图、模型图等多种图表类型和服务器端图片导出。
- **日历待办事项:** 实现了与高性能Rust后端直连的待办事项管理模块，支持日历视图、优先级设置、Markdown笔记的实时预览、导入和导出。

## 安装与配置 (Setup & Configuration)

**1. 先决条件**

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.9+) & `uv`
- [Rust](https://www.rust-lang.org/) & `cargo`
- [MySQL](https://www.mysql.com/)

**2. 数据库设置**

- 创建一个名为 `edu_analysis_db` 的MySQL数据库。
- 分别在 `server/`, `python-analysis/`, `rust-optimizer/` 目录下创建 `.env` 文件，并根据各自的 `.env.example` 填入正确的数据库连接信息。

**3. 后端服务安装**

- **Node.js 主后端:**

  ```
  cd server
  npm install
  ```

- **Python 分析服务:**

  ```
  # 在项目根目录激活虚拟环境
  source .venv/bin/activate  # (Linux/macOS)
  # 或者 .\.venv\Scripts\activate (Windows)
  
  # 安装依赖
  cd python-analysis
  uv pip install -r requirements.txt
  ```

- **Rust 待办事项服务:**

  ```
  cd rust-optimizer
  cargo build
  ```

**4. 前端安装**

```
cd client
npm install
```

## 运行项目 (Running the Project)

你需要**同时运行**所有四个服务。建议为每个服务打开一个独立的终端。

1. **启动 Node.js 主后端:**

   ```
   cd server
   npm run dev
   ```

2. **启动 Python 分析服务:**

   ```
   # 确保虚拟环境已激活
   cd python-analysis
   python app.py
   ```

3. **启动 Rust 待办事项服务:**

   ```
   cd rust-optimizer
   cargo run
   ```

4. **启动前端开发服务器:**

   ```
   cd client
   npm run dev
   ```

全部启动后，在浏览器中访问: **`http://localhost:5173`**

## 开发者 (Author)

- **topmkter (cjx)**
- **GitHub**: <https://github.com/topmkter>
- **个人博客**: <https://smlyfm.github.io/>



## BUG待解决

### 页面不刷新bug

发现了一个典型的单页应用(SPA)中常见的“重大Bug”。

问题：**从“数据管理/待办事项”页导航到其他任何页面时，内容区变为空白，需要刷新才能显示。**

**问题根源分析**

这个问题的根源在于Vue路由器的组件复用策略。当您从一个页面切换到另一个页面时，为了性能，Vue会尝试“复用”和“修补”组件，而不是完全销毁旧的、再创建新的。

然而，当一个页面（如此处的“数据管理”页）包含了复杂的内部状态、布局计算和生命周期钩子时，这种“修补”行为可能会失败，导致新页面无法正确渲染（即出现您看到的“啥也没有”的情况）。

**解决方案**

为了彻底解决这个bug，更新Canvas中的代码，对 `MainLayout.vue` 文件做一个小而关键的修改。

我会在渲染页面的核心位置 `<router-view>` 中，为每个页面组件添加一个**唯一的`key`**。这个`key`会与页面的路径绑定。这样做等于在明确地告诉Vue：“当页面路径改变时，不要尝试修补旧组件，请**彻底销毁它，并创建一个全新的组件**。”

这个改动能确保每次页面切换时，所有组件都能经历一个完整的、干净的生命周期，从而保证渲染的正确性。



这个问题的根源在于 Vue 路由器的组件复用策略。当您从一个页面（如“数据管理”）切换到另一个页面时，Vue 为了性能会尝试“复用”和“修补”组件，而不是完全销毁旧的、再创建新的。

然而，当页面（如此处的“数据管理”页）包含了需要精确创建和销毁的复杂内部逻辑（例如图表实例、窗口大小监听等）时，这种“复用”行为可能会导致新页面无法被正确渲染，从而出现您看到的“啥也没有”的空白情况。



在渲染页面的核心位置 `<router-view>` 中，为每个页面组件添加一个**唯一的 `key`**，并将它与当前页面的路径绑定。这样做等于在明确地告诉 Vue：“当页面路径改变时，不要尝试修补旧组件，请**彻底销毁它，并创建一个全新的组件**。”

### nodejs下载功能

在数据分析的nodejs的下载模块下载失效，能下载但不是对应的图片信息，感觉是Python后端没给下载的功能。

### Bug 提交 (Bug Report)

如果您在使用过程中遇到任何问题或 bug，欢迎通过以下方式提交：

* **GitHub Issues**: 在本项目的 GitHub Issues 页面新建一个 issue。
* **个人博客**: [smlyfm.github.io](https.smlyfm.github.io)
* **GitHub 主页**: [![GitHub](https://img.shields.io/badge/GitHub-KS--MATH-blue?style=social&logo=github)](https://github.com/KS-MATH)
* **邮件**: 发送邮件至 sudocjx@gmail.com。

提交时，请尽可能详细地描述问题，包括复现步骤、错误截图和您的运行环境，这将有助于我更快地定位和解决问题。

