<div align="center">

# 🌐 GDUF Web Frontend

### ✨ 广东金融学院成绩管理系统前端界面 ✨

<br>

![Vue](https://img.shields.io/badge/Vue_3-4.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant_Design_Vue-4.2-0170FE?style=for-the-badge&logo=ant-design&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

<br>

📊 **成绩管理看板** · 🏫 **班级数据管理** · 📥 **批量导出工具** · 📈 **数据可视化**

---

⚠️ **免责声明：本项目仅供个人学习交流使用，严禁用于商业用途！** ⚠️

使用本项目产生的一切后果由使用者自行承担，与开发者无关。

---

</div>

## 功能特性

- **成绩管理**：按班级/专业查看成绩，支持分页、搜索、筛选
- **批量成绩导出**：异步批量导出成绩 Excel，支持任务进度追踪与失败重试
- **班级专业维护**：班级信息展示和管理，按年级排序
- **GPA 计算**：上传成绩 Excel 文件，自动计算 GPA 与排名
- **成绩报表**：可视化展示成绩分布与统计数据
- **灵活配置**：学期选择、课程属性过滤、缓存优化

## 技术栈

### 核心框架
- **Vue 3** - 前端框架（Composition API）
- **TypeScript** - 类型安全
- **Vite 5.2** - 构建工具
- **Pinia** - 状态管理

### UI 组件
- **Ant Design Vue 4.2.5** - UI 组件库
- **@wangeditor-next** - 富文本编辑器
- **Less** - CSS 预处理器

### 网络请求
- **Axios** 1.6.8 - HTTP 客户端
- **Vite Proxy** - 开发环境代理转发

### 工具库
- **Day.js** - 日期处理
- **CryptoJS** - 加密工具
- **Decimal.js** - 高精度计算
- **Clipboard** - 剪贴板
- **Diff** 5.2.0 - 文本差异对比

## 项目结构

```
gduf-web/
├── src/
│   ├── main.ts                      # 应用入口
│   ├── App.vue                      # 根组件
│   ├── api/                         # API 接口层
│   ├── components/                  # 公共组件
│   │   ├── business/                # 业务组件
│   │   │   ├── category-tree-select # 分类树选择
│   │   │   └── oa/                  # OA 业务组件
│   │   ├── framework/               # 框架组件
│   │   │   ├── smart-enum-select    # 枚举选择器
│   │   │   ├── smart-enum-checkbox  # 枚举复选框
│   │   │   └── wangeditor           # 富文本编辑器
│   │   └── support/                 # 支持组件
│   │       ├── file-upload          # 文件上传
│   │       └── dict-select          # 字典选择器
│   ├── composables/                 # 组合式函数
│   │   └── useDropdownCache.ts      # 下拉框缓存
│   ├── config/                      # 应用配置
│   ├── constants/                   # 常量定义
│   ├── directives/                  # 自定义指令
│   ├── i18n/                        # 国际化
│   ├── layout/                      # 布局组件
│   │   ├── side-layout.vue          # 侧边栏布局
│   │   ├── top-layout.vue           # 顶部布局
│   │   └── components/              # 布局子组件
│   ├── lib/                         # 工具库
│   │   ├── axios.ts                 # HTTP 客户端（主后端）
│   │   ├── grade-axios.ts           # HTTP 客户端（成绩服务）
│   │   └── encrypt.ts              # 加密工具
│   ├── plugins/                     # Vue 插件
│   ├── router/                      # 路由配置
│   │   ├── index.ts                 # 路由初始化（Hash 模式）
│   │   ├── routers.ts               # 路由表
│   │   └── system/                  # 系统模块路由
│   ├── store/                       # Pinia 状态管理
│   ├── theme/                       # 主题样式
│   ├── types/                       # TypeScript 类型定义
│   ├── utils/                       # 通用工具
│   └── views/                       # 页面视图
│       ├── business/
│       │   └── grade/               # ✅ 成绩管理页面（GDUF 定制）
│       │       ├── grade-export.vue      # 成绩导出页面
│       │       ├── grade-gpa.vue         # GPA 计算页面
│       │       ├── major-list.vue        # 班级列表页面
│       │       ├── major-form.vue        # 班级表单
│       │       ├── score-list.vue        # 成绩记录页面
│       │       ├── score-form.vue        # 成绩表单
│       │       ├── score-batch-form.vue  # 批量成绩表单
│       │       └── score-export-modal.vue # 成绩导出弹窗
│       ├── system/                  # 系统管理页面
│       │   ├── home/                # 首页仪表盘
│       │   ├── login/               # 登录页
│       │   ├── employee/            # 员工管理
│       │   ├── role/                # 角色管理
│       │   └── menu/                # 菜单管理
│       └── support/                 # 系统支持页面
├── public/                          # 静态资源
├── index.html                       # HTML 模板
├── vite.config.ts                   # Vite 配置
├── tsconfig.json                    # TypeScript 配置
└── package.json                     # 项目配置
```

## 安装部署

### 环境要求

- Node.js >= 18.x
- npm >= 9.x

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd gduf-web

# 2. 安装依赖
npm install

# 3. 配置环境变量
# 编辑 .env.localhost（开发环境）或 .env.production（生产环境）
# - VITE_APP_API_URL: 主后端 API 路径
# - VITE_APP_GRADE_API_URL: 成绩服务 API 路径
```

### 运行命令

```bash
# 开发模式（本地开发，推荐）
npm run localhost

# 开发模式（默认）
npm run dev

# 构建测试环境
npm run build:test

# 构建预发布环境
npm run build:pre

# 构建生产环境
npm run build:prod
```

## API 代理

### 双后端架构

前端通过 Vite 代理转发 API 请求到两个后端服务：

```
前端请求                    Vite 代理                     后端服务
─────────                 ──────────                    ────────
/smart-admin-api/login  →  转发 →   http://localhost:1024/login   Spring Boot（主后端）
/grade-service/getExcel →  转发 →   http://localhost:5000/getExcel Node.js（成绩爬虫）
```

### 环境配置

| 变量名 | 说明 | 开发环境 | 生产环境 |
|--------|------|---------|---------|
| `VITE_APP_API_URL` | 主后端 API 前缀 | `/smart-admin-api` | `/smart-admin-api` |
| `VITE_APP_GRADE_API_URL` | 成绩服务 API 前缀 | `/grade-service` | `/grade-service` |

生产环境通过 Nginx 反向代理实现相同路径映射。

## 页面功能

### 成绩模块

| 页面 | 路由 | 说明 |
|------|------|------|
| 班级列表 | `/grade/major-list` | 查看所有班级，按年级排序 |
| 成绩列表 | `/grade/score-list` | 分页查看成绩数据 |
| 成绩导出 | `/grade/grade-export` | 批量导出成绩 Excel，支持进度追踪 |
| GPA 计算 | `/grade/grade-gpa` | 上传成绩 Excel 计算 GPA |
| 班级表单 | `/grade/major-form` | 新增/编辑班级信息 |
| 成绩表单 | `/grade/score-form` | 新增/编辑成绩记录 |
| 批量成绩 | `/grade/score-batch-form` | 批量录入成绩 |

### 导出功能特点

- **懒加载缓存**：下拉框数据首次加载后缓存到 localStorage（30 分钟有效）
- **独立缓存 Key**：单班级和多班级模式使用独立缓存键
- **批量进度跟踪**：实时显示导出进度（已完成/总数）
- **失败重试**：导出失败自动重试，并显示失败原因
- **课程属性筛选**：动态获取课程属性，默认排除通识选修

## 配置说明

### Vite 配置

核心配置（`vite.config.ts`）：

| 配置项 | 说明 | 值 |
|--------|------|-----|
| `server.port` | 开发服务器端口 | 8081 |
| `server.host` | 监听地址 | 0.0.0.0 |
| `build.outDir` | 构建输出目录 | dist |
| `build.assetsDir` | 静态资源目录 | assets |
| `build.minify` | 压缩方式 | terser |

### 代理配置

```typescript
proxy: {
  '/smart-admin-api': {
    target: 'http://localhost:1024',   // Spring Boot
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/smart-admin-api/, ''),
  },
  '/grade-service': {
    target: 'http://localhost:5000',    // Node.js 爬虫
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/grade-service/, ''),
  },
}
```

## 架构设计

### 路由设计

采用 **Hash 模式**路由（`createWebHashHistory`）：

```
/#/login                          → 登录页
/#/system/home                    → 首页仪表盘
/#/grade/major-list               → 班级列表
/#/grade/score-list               → 成绩列表
/#/grade/grade-export             → 成绩导出
/#/grade/grade-gpa                → GPA 计算
/#/system/employee                → 员工管理
/#/system/role                    → 角色管理
```

### 网络请求架构

```
页面组件 → API 模块 → Axios 实例 → Vite 代理 → 后端服务
                          ↕
                    拦截器（请求/响应）
```

- **主后端请求**：通过 `lib/axios.ts`，前缀 `/smart-admin-api`
- **成绩服务请求**：通过 `lib/grade-axios.ts`，前缀 `/grade-service`
- **请求拦截**：自动注入 Authorization Token
- **响应拦截**：统一错误处理

### 状态管理

- **Pinia** 全局状态管理
- **localStorage 缓存**：下拉框数据、用户偏好
- **路由参数**：页面间传递查询条件

## 开发指南

### 新增页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/routers.ts` 注册路由
3. 在 `src/api/` 下添加 API 模块
4. 在菜单管理中配置菜单权限

### 添加代理接口

编辑 `vite.config.ts` 中的 `server.proxy` 配置，新增路径映射规则。

### 修改主题

编辑 `src/theme/custom-variables.js` 和 `src/theme/index.less` 自定义样式变量。

## 常见问题

### Q: 开发环境接口请求 404？

A: 检查以下配置：
1. 后端服务是否已启动（Spring Boot 在 1024 端口）
2. 后端服务是否已启动（Node.js 在 5000 端口）
3. `vite.config.ts` 中的代理配置是否正确

### Q: 生产环境接口请求 404？

A: 检查 Nginx 配置：
1. `location /smart-admin-api/` 的 `proxy_pass` 尾部是否有 `/`
2. 后端服务是否正常运行

### Q: 成绩导出进度卡住不动？

A: 可能原因：
1. 教务系统登录会话已过期
2. Node.js 爬虫服务异常
3. Redis 连接失败导致任务状态无法保存

### Q: 下拉框数据不更新？

A: 下拉框数据默认缓存 30 分钟，如需刷新：
1. 等待缓存过期自动刷新
2. 清除 localStorage 中对应的缓存项

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请通过以下方式联系：
- 提交 GitHub Issue
- 邮件联系：[your-email@example.com]
