# 美股大事件监控系统 (US Stock Monitor)

面向美股投资者的大事件监控与趋势分析系统。每日自动采集财经新闻及顶级基金持仓变动，经 AI 验证后生成趋势判断报告，通过 Web UI 供用户按日期检索浏览。

## 技术栈

| 层次 | 技术选型 |
|------|----------|
| 后端框架 | Java 21 + Spring Boot 3.4 |
| ORM | Spring Data JPA + Hibernate |
| 数据库 | MySQL 8.0 |
| AI 接口 | Anthropic Claude API |
| 前端框架 | Next.js 14 + TypeScript |
| 样式 | TailwindCSS v3 |
| 图表 | Recharts |
| 部署 | Docker + Nginx |

## 快速开始（Docker）

```bash
# 1. 复制环境变量文件
cp .env.example .env

# 2. 编辑 .env，填入 MySQL 密码和 Claude API Key
vi .env

# 3. 启动所有服务
docker compose up -d

# 4. 访问
# Web UI: http://localhost
# API:    http://localhost:8080/api/v1
# Swagger: http://localhost:8080/swagger-ui.html
```

## 本地开发

### 后端

```bash
cd us-stock-monitor-backend

# 确保 MySQL 已运行且存在 us_monitor 数据库
# 可用 sql/init.sql 初始化表结构

# 设置环境变量
export DB_USERNAME=root
export DB_PASSWORD=your_password
export CLAUDE_API_KEY=your_key

# 启动
mvn spring-boot:run
```

### 前端

```bash
cd us-stock-monitor-frontend

npm install
npm run dev
# 访问 http://localhost:3000
```

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DB_PASSWORD` | MySQL 密码 | 是 |
| `CLAUDE_API_KEY` | Anthropic API Key | 是 |
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址 | 是 |
| `SPRING_PROFILES_ACTIVE` | 环境标识（dev/prod） | 是 |

## 项目结构

```
us-stock-monitor/
├── us-stock-monitor-backend/    # Spring Boot 后端
│   ├── src/main/java/com/usmonitor/
│   │   ├── config/              # 配置类（CORS、WebClient、定时任务）
│   │   ├── controller/          # REST API 控制器
│   │   ├── service/             # 业务逻辑层
│   │   ├── crawler/             # 新闻爬虫、行情采集
│   │   ├── scheduler/           # 定时任务
│   │   ├── repository/          # JPA 数据仓库
│   │   ├── domain/              # JPA 实体
│   │   ├── dto/                 # 请求/响应数据对象
│   │   ├── ai/                  # Claude AI 集成
│   │   └── exception/           # 全局异常处理
│   └── src/main/resources/      # 配置文件
├── us-stock-monitor-frontend/   # Next.js 前端
│   └── src/
│       ├── app/                 # 页面路由
│       ├── components/          # UI 组件
│       ├── hooks/               # SWR 数据钩子
│       ├── lib/                 # 工具函数、API 客户端
│       ├── store/               # Zustand 状态管理
│       └── types/               # TypeScript 类型定义
├── sql/                         # 数据库初始化脚本
├── docker/                      # Nginx 配置
└── docker-compose.yml           # Docker 编排
```
