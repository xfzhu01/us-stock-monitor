# 美股大事件监控系统 (US Stock Monitor)

面向美股投资者的大事件监控与趋势分析系统。每日自动采集财经新闻及顶级基金持仓变动，经 AI 验证后生成趋势判断报告，通过 Web UI 供用户按日期检索浏览。

## 技术栈

| 层次 | 技术选型 |
|------|----------|
| 后端框架 | Java 21 + Spring Boot 3.4 |
| 构建工具 | Gradle 8.x (Kotlin DSL) |
| ORM | Spring Data JPA + Hibernate (ddl-auto: update) |
| 数据库 | MySQL 8.0 |
| AI 接口 | Claude / ChatGPT / Gemini（可配置切换） |
| 行情数据 | Finnhub API（免费版，ETF 代理） |
| 前端框架 | Next.js 14 + TypeScript |
| 样式 | TailwindCSS v3 |
| 图表 | Recharts |
| 部署 | Docker + Nginx 反向代理 |

## 快速开始（Docker）

```bash
# 1. 复制环境变量文件
cp .env.example .env

# 2. 编辑 .env，填入 MySQL 密码、AI Provider 及对应 API Key
vi .env

# 3. 启动所有服务
docker compose up -d

# 4. 访问
# Web UI:  http://localhost
# API:     http://localhost/api/v1
# Swagger: http://localhost:8080/swagger-ui.html
```

> **端口说明**：MySQL 映射为 `3366:3306`，避免与本地 MySQL 冲突。前端通过 Nginx 反向代理 `/api/` 到后端，浏览器访问 `http://localhost` 即可。

## 功能模块

### 数据采集
- **新闻事件抓取**：从 CNBC、Reuters、MarketWatch 等 RSS 源自动抓取财经新闻
- **基金持仓变动**：采集顶级基金（Berkshire Hathaway、ARK Invest、Bridgewater、Soros 等）的 13F 持仓变动数据
- **市场行情快照**：通过 Finnhub API 实时获取，使用 ETF 代理（SPY→S&P 500、QQQ→纳斯达克 100、VIXY→VIX、TLT→美国 10Y 国债、UUP→美元指数），每 60 秒自动刷新

### AI 分析
- 自动对抓取的事件进行可信度评分、影响力评分和情绪标注
- 生成每日趋势分析报告，包含看涨概率、主要风险、利好因素和完整 Markdown 报告

### 前端页面
| 页面 | 路径 | 功能 |
|------|------|------|
| 仪表盘 | `/dashboard` | 市场概览、信号指标、概率趋势图、今日事件 |
| 事件监控 | `/events` | 按日期/类别/情绪筛选事件，支持分页 |
| 趋势分析 | `/analysis` | 查看每日 AI 分析报告、概率走势、风险/利好列表 |
| 基金动向 | `/funds` | 查看基金持仓变动，支持排序和筛选 |
| 控制面板 | `/control` | 手动触发事件抓取、基金持仓抓取、AI 分析生成 |

### 手动触发 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/crawl/news` | POST | 触发新闻事件抓取 |
| `/api/v1/crawl/funds` | POST | 触发基金持仓抓取 |
| `/api/v1/crawl/market` | POST | 触发市场行情采集 |
| `/api/v1/crawl/analysis` | POST | 触发 AI 分析报告生成 |
| `/api/v1/crawl/all` | POST | 按顺序执行完整流程 |

也可在前端**控制面板**页面通过 UI 按钮触发。

## 本地开发

### 后端

```bash
cd us-stock-monitor-backend

# 确保 MySQL 已运行且存在 us_monitor 数据库（端口 3366）
# 表结构由 Hibernate 自动创建和管理

# 设置环境变量
export DB_USERNAME=root
export DB_PASSWORD=your_password
export AI_PROVIDER=gemini           # claude / openai / gemini
export GEMINI_API_KEY=your_key      # 根据 provider 设置对应 key

# 启动
./gradlew bootRun
```

### 前端

```bash
cd us-stock-monitor-frontend

npm install

# 创建 .env.local 配置 Finnhub API Key
echo 'FINNHUB_API_KEY=your_finnhub_api_key' > .env.local

# 本地开发需指向后端地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 npm run dev
# 访问 http://localhost:3000
```

> Finnhub API Key 可在 [finnhub.io](https://finnhub.io/) 免费注册获取。

> Docker 部署时前端默认使用相对路径，通过 Nginx 反向代理访问后端，无需配置 `NEXT_PUBLIC_API_BASE_URL`。

## AI 模型切换

系统支持三种 AI 模型，通过环境变量 `AI_PROVIDER` 或配置文件 `app.ai.provider` 切换：

| Provider | 环境变量 | 默认模型 | API Key 变量 |
|----------|----------|----------|-------------|
| Claude | `AI_PROVIDER=claude` | claude-sonnet-4-20250514 | `CLAUDE_API_KEY` |
| ChatGPT | `AI_PROVIDER=openai` | gpt-4o | `OPENAI_API_KEY` |
| Gemini | `AI_PROVIDER=gemini` | gemini-2.5-flash | `GEMINI_API_KEY` |

只需设置对应 provider 的 API Key，无需配置其他 provider 的密钥。

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DB_PASSWORD` | MySQL 密码 | 是 |
| `FINNHUB_API_KEY` | Finnhub 行情 API Key（[免费注册](https://finnhub.io/)） | 是 |
| `AI_PROVIDER` | AI 模型提供商（claude/openai/gemini） | 否（默认 claude） |
| `CLAUDE_API_KEY` | Anthropic API Key | 使用 Claude 时必填 |
| `OPENAI_API_KEY` | OpenAI API Key | 使用 ChatGPT 时必填 |
| `GEMINI_API_KEY` | Google AI API Key | 使用 Gemini 时必填 |

## 定时任务

| 任务 | Cron 表达式 | 时区 | 说明 |
|------|-------------|------|------|
| 新闻抓取 | `0 0 18 * * MON-FRI` | Asia/Shanghai | 每周一至五 18:00 |
| 市场数据 | `0 0 6 * * TUE-SAT` | Asia/Shanghai | 每周二至六 06:00 |
| AI 分析 | `0 0 20 * * MON-FRI` | Asia/Shanghai | 每周一至五 20:00 |

## 项目结构

```
us-stock-monitor/
├── us-stock-monitor-backend/       # Spring Boot 后端
│   ├── build.gradle.kts            # Gradle 构建配置
│   ├── src/main/java/com/usmonitor/
│   │   ├── config/                 # 配置类（CORS、AI 工厂、请求日志、定时任务）
│   │   ├── controller/             # REST API 控制器（含手动触发）
│   │   ├── service/                # 业务逻辑层
│   │   ├── crawler/                # 新闻爬虫、基金持仓、行情采集
│   │   ├── scheduler/              # 定时任务
│   │   ├── repository/             # JPA 数据仓库
│   │   ├── domain/                 # JPA 实体
│   │   ├── dto/                    # 请求/响应数据对象
│   │   ├── ai/                     # AI 多模型集成（Claude/OpenAI/Gemini）
│   │   └── exception/              # 全局异常处理
│   └── src/main/resources/         # 配置文件
├── us-stock-monitor-frontend/      # Next.js 前端
│   └── src/
│       ├── app/                    # 页面路由（dashboard/events/analysis/funds/control）
│       ├── components/             # UI 组件
│       ├── hooks/                  # SWR 数据钩子
│       ├── lib/                    # 工具函数、API 客户端
│       ├── store/                  # Zustand 状态管理
│       └── types/                  # TypeScript 类型定义
├── sql/                            # 数据库初始化脚本（仅创建数据库）
├── docker/                         # Nginx 反向代理配置
└── docker-compose.yml              # Docker 编排（MySQL 3366、后端 8080、前端 3000、Nginx 80）
```
