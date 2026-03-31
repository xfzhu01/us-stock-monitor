# 美股大事件监控系统 — 需求分析 · 设计文档 · 项目架构

> 版本：v1.0　作者：系统设计　日期：2026-03-31

---

## 目录

1. [项目概述](#1-项目概述)
2. [需求分析](#2-需求分析)
3. [数据源设计](#3-数据源设计)
4. [数据库设计](#4-数据库设计)
5. [后端架构设计（Spring Boot 3.4 · Java 21）](#5-后端架构设计)
6. [前端架构设计（Next.js 14 · TailwindCSS · Recharts）](#6-前端架构设计)
7. [AI 分析模块设计](#7-ai-分析模块设计)
8. [定时任务设计](#8-定时任务设计)
9. [API 接口规范](#9-api-接口规范)
10. [部署方案](#10-部署方案)
11. [里程碑计划](#11-里程碑计划)

---

## 1. 项目概述

### 1.1 背景与目标

构建一套面向美股投资者的大事件监控与趋势分析系统。系统每日自动采集可能影响美股市场的国际要闻及顶级基金持仓变动，经 AI 真实性验证后入库存储，并由 AI 综合分析生成每日趋势判断报告，最终通过 Web UI 供用户按日期检索浏览。

### 1.2 核心价值

- 每日自动聚合分散的财经信息，节省人工筛选时间
- AI 辅助过滤低质量/虚假信息，提升信息密度
- 量化输出短期（7日）和中期（30日）趋势概率，辅助投资决策
- 追踪顶级基金大神操作，捕捉聪明钱动向

### 1.3 目标用户

个人投资者、量化研究员、基金从业人员。

### 1.4 技术栈总览

| 层次 | 技术选型 |
|------|----------|
| 后端框架 | Java 21 + Spring Boot 3.4 |
| ORM | Spring Data JPA + Hibernate |
| 数据库 | MySQL 8.0 |
| HTTP 客户端 | Spring WebFlux（WebClient） |
| 爬虫 | Jsoup + OkHttp |
| 定时任务 | Spring @Scheduled |
| AI 接口 | Anthropic Claude API |
| 前端框架 | Next.js 14（App Router）+ TypeScript |
| 样式 | TailwindCSS v3 |
| 图表 | Recharts |
| UI 组件 | shadcn/ui |
| 状态管理 | Zustand |
| 数据请求 | SWR + axios |
| 部署 | Docker + Nginx（单机 VPS） |

---

## 2. 需求分析

### 2.1 功能需求

#### F1 — 事件采集与存储

- 系统每日定时（北京时间 18:00，对应美东 06:00 AM）自动抓取多路财经新闻数据源
- 对采集到的原始事件做去重处理（基于标题相似度）
- 调用 Claude API 对每条事件进行真实性评分（0-100）和影响力评分（0-100）
- 可信度评分 ≥ 60 的事件标记为已验证，进入后续分析流程
- 所有事件（含未通过验证）均存入 `events` 表，打标区分

#### F2 — 基金持仓变动采集

- 每季度（SEC 13F 披露后 48 小时内）自动采集以下顶级基金持仓变动：
  - Warren Buffett（Berkshire Hathaway）
  - Ray Dalio（Bridgewater Associates）
  - Bill Ackman（Pershing Square）
  - Stanley Druckenmiller（Duquesne Family Office）
  - David Tepper（Appaloosa Management）
  - Michael Burry（Scion Asset Management）
  - 机构研报：Goldman Sachs、JPMorgan、BlackRock
- 采集字段：基金名、标的股票、操作类型（加仓/减仓/新建/清仓）、变动股数、披露季度

#### F3 — AI 趋势分析报告

- 每日北京时间 20:00（美东 08:00 AM）自动生成当日趋势分析报告
- 报告覆盖标普 500（SPX）和纳斯达克 100（NDX）
- 输出内容：
  - 7 日看涨概率（0-100）
  - 30 日看涨概率（0-100）
  - 综合信号：`strong_bull / bull / neutral / bear / strong_bear`
  - 主要风险列表（3-5 条）
  - 主要利好列表（3-5 条）
  - AI 全文分析报告（Markdown 格式，1500-3000 字）

#### F4 — Web UI 展示

- 首页仪表盘：显示今日趋势概率、信号灯、关键事件摘要
- 事件列表页：按日期检索事件，支持按类别、情绪筛选
- 分析报告页：按日期浏览历史报告，支持 Markdown 渲染
- 基金动向页：按基金、股票、时间段筛选持仓变动

### 2.2 非功能需求

| 指标 | 要求 |
|------|------|
| 接口响应时间 | P95 < 500ms |
| 每日采集事件量 | 30-100 条 |
| AI 分析生成时间 | < 60 秒 |
| 系统可用性 | 99%（允许每日维护窗口） |
| 数据保留周期 | 事件 3 年，分析报告永久 |
| 前端首屏加载 | < 2 秒 |

### 2.3 事件分类与权重

| 类别 | 枚举值 | 影响权重 | 典型事件 |
|------|--------|----------|----------|
| 货币政策·美联储 | `FED` | ★★★★★ | FOMC 决议、鲍威尔讲话、点阵图 |
| 宏观经济数据 | `MACRO` | ★★★★☆ | CPI、PCE、非农、GDP |
| 财政·地缘政治 | `GEOPOLITICAL` | ★★★★☆ | 关税、制裁、战争冲突 |
| 龙头股财报 | `EARNINGS` | ★★★☆☆ | 七巨头季报、标普权重股 |
| 基金持仓变动 | `FUND` | ★★★☆☆ | 大佬大幅加仓/清仓 |
| 科技·产业政策 | `TECH_POLICY` | ★★☆☆☆ | AI 监管、芯片禁令、反垄断 |
| 全球央行联动 | `OTHER` | ★★☆☆☆ | 欧央行、日央行、人民币汇率 |

---

## 3. 数据源设计

### 3.1 新闻数据源

| 数据源 | 接入方式 | 数据类型 | 频率 |
|--------|----------|----------|------|
| Reuters RSS | RSS Feed 解析 | 财经要闻 | 实时 |
| Associated Press | RSS Feed | 国际新闻 | 实时 |
| MarketWatch | Jsoup 爬虫 | 市场新闻 | 每小时 |
| CNBC Markets | RSS Feed | 美股新闻 | 每小时 |
| 美联储官网 (federalreserve.gov) | HTTP 爬虫 | 政策声明 | 按需 |
| 美国劳工局 BLS (bls.gov) | HTTP 爬虫 | 经济数据 | 按月 |
| SEC EDGAR | REST API | 财报披露 | 实时 |
| Earnings Whispers | Jsoup 爬虫 | 财报日历 | 每日 |
| CME FedWatch | HTTP 爬虫 | 加息预期 | 每日 |

### 3.2 基金持仓数据源

| 数据源 | 接入方式 | 说明 |
|--------|----------|------|
| SEC EDGAR 13F | REST API | 官方持仓披露，季度更新，45 天滞后 |
| WhaleWisdom | Jsoup 爬虫 | 13F 数据聚合，界面更友好 |
| Dataroma | Jsoup 爬虫 | 超级投资者持仓汇总 |
| 基金官方公告 | HTTP 爬虫 | 实时补充（如 Ackman 在 X 发言） |

### 3.3 行情数据源

| 数据源 | 接入方式 | 数据内容 |
|--------|----------|----------|
| Yahoo Finance API | HTTP REST | SPX、NDX、VIX 日收盘 |
| FRED (St. Louis Fed) | REST API | 10 年期美债收益率、DXY |
| Polygon.io | REST API（备选） | 实时及历史行情 |

---

## 4. 数据库设计

### 4.1 总体说明

数据库：MySQL 8.0，字符集 `utf8mb4`，排序规则 `utf8mb4_unicode_ci`。

### 4.2 表结构

#### 4.2.1 `events` — 事件主表

```sql
CREATE TABLE events (
    id              BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    event_date      DATE            NOT NULL                COMMENT '事件日期',
    category        VARCHAR(20)     NOT NULL                COMMENT '类别: FED/MACRO/GEOPOLITICAL/EARNINGS/FUND/TECH_POLICY/OTHER',
    title           VARCHAR(300)    NOT NULL                COMMENT '事件标题',
    summary         TEXT                                    COMMENT 'AI摘要/原文摘要',
    source_url      VARCHAR(500)                            COMMENT '原文链接',
    source_name     VARCHAR(100)                            COMMENT '数据来源名称',
    credibility_score TINYINT UNSIGNED DEFAULT 0            COMMENT 'AI可信度评分 0-100',
    impact_score    TINYINT UNSIGNED DEFAULT 0              COMMENT 'AI影响力评分 0-100',
    sentiment       VARCHAR(10)                             COMMENT '情绪: BULLISH/BEARISH/NEUTRAL',
    is_verified     TINYINT(1)      DEFAULT 0               COMMENT '是否通过验证',
    raw_content     MEDIUMTEXT                              COMMENT '原始抓取内容',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_event_date (event_date),
    INDEX idx_category (category),
    INDEX idx_sentiment (sentiment),
    INDEX idx_is_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='事件主表';
```

#### 4.2.2 `fund_positions` — 基金持仓变动表

```sql
CREATE TABLE fund_positions (
    id              BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    fund_name       VARCHAR(100)    NOT NULL                COMMENT '基金名称',
    manager_name    VARCHAR(100)                            COMMENT '基金经理',
    ticker          VARCHAR(10)     NOT NULL                COMMENT '股票代码',
    company_name    VARCHAR(200)                            COMMENT '公司名称',
    action          VARCHAR(10)     NOT NULL                COMMENT '操作: ADD/REDUCE/NEW/CLOSE',
    shares_change   BIGINT                                  COMMENT '变动股数（负数为减仓）',
    shares_total    BIGINT                                  COMMENT '持仓总股数',
    value_usd       BIGINT                                  COMMENT '持仓市值（美元）',
    portfolio_pct   DECIMAL(5,2)                            COMMENT '占投资组合比例',
    quarter         CHAR(6)         NOT NULL                COMMENT '季度 例: 2025Q1',
    filing_date     DATE                                    COMMENT '13F提交日期',
    source_url      VARCHAR(500)                            COMMENT '原始披露链接',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_fund_quarter (fund_name, quarter),
    INDEX idx_ticker (ticker),
    INDEX idx_filing_date (filing_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='基金持仓变动表';
```

#### 4.2.3 `daily_analysis` — 每日 AI 分析报告表

```sql
CREATE TABLE daily_analysis (
    id                  BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    analysis_date       DATE            NOT NULL UNIQUE         COMMENT '分析日期',
    spx_bull_prob_7d    TINYINT UNSIGNED                        COMMENT 'SPX 7日看涨概率 0-100',
    spx_bull_prob_30d   TINYINT UNSIGNED                        COMMENT 'SPX 30日看涨概率 0-100',
    ndx_bull_prob_7d    TINYINT UNSIGNED                        COMMENT 'NDX 7日看涨概率 0-100',
    ndx_bull_prob_30d   TINYINT UNSIGNED                        COMMENT 'NDX 30日看涨概率 0-100',
    signal              VARCHAR(15)                             COMMENT '综合信号: strong_bull/bull/neutral/bear/strong_bear',
    key_risks           JSON                                    COMMENT '主要风险列表 ["risk1","risk2"]',
    key_tailwinds       JSON                                    COMMENT '主要利好列表',
    event_ids_used      JSON                                    COMMENT '参与分析的事件ID列表',
    report_markdown     MEDIUMTEXT                              COMMENT 'AI生成的完整分析报告(Markdown)',
    model_version       VARCHAR(50)                             COMMENT '使用的AI模型版本',
    token_count         INT                                     COMMENT '消耗token数',
    generated_at        DATETIME                                COMMENT 'AI生成时间',
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_analysis_date (analysis_date),
    INDEX idx_signal (signal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日AI趋势分析报告';
```

#### 4.2.4 `market_data` — 行情快照表

```sql
CREATE TABLE market_data (
    id              BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    trade_date      DATE            NOT NULL UNIQUE         COMMENT '交易日',
    spx_open        DECIMAL(10,2)                           COMMENT 'SPX 开盘',
    spx_close       DECIMAL(10,2)                           COMMENT 'SPX 收盘',
    spx_change_pct  DECIMAL(6,3)                            COMMENT 'SPX 涨跌幅%',
    ndx_open        DECIMAL(10,2)                           COMMENT 'NDX 开盘',
    ndx_close       DECIMAL(10,2)                           COMMENT 'NDX 收盘',
    ndx_change_pct  DECIMAL(6,3)                            COMMENT 'NDX 涨跌幅%',
    vix_close       DECIMAL(6,2)                            COMMENT 'VIX 恐慌指数',
    us10y_yield     DECIMAL(5,3)                            COMMENT '10年期美债收益率%',
    dxy             DECIMAL(7,3)                            COMMENT '美元指数',
    fed_funds_rate  DECIMAL(5,3)                            COMMENT '联邦基金利率%',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_trade_date (trade_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='市场行情快照';
```

#### 4.2.5 `crawl_logs` — 采集日志表

```sql
CREATE TABLE crawl_logs (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    task_name       VARCHAR(100)    NOT NULL                COMMENT '任务名称',
    source_name     VARCHAR(100)                            COMMENT '数据源名称',
    status          VARCHAR(10)     NOT NULL                COMMENT 'SUCCESS/FAILED/PARTIAL',
    total_fetched   INT             DEFAULT 0               COMMENT '抓取总数',
    total_saved     INT             DEFAULT 0               COMMENT '入库数量',
    total_duplicate INT             DEFAULT 0               COMMENT '重复过滤数',
    error_msg       TEXT                                    COMMENT '错误信息',
    duration_ms     INT                                     COMMENT '耗时毫秒',
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_task_date (task_name, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采集任务日志';
```

---

## 5. 后端架构设计

### 5.1 项目结构

```
us-stock-monitor-backend/
├── src/main/java/com/usmonitor/
│   ├── UsMontiorApplication.java          # 启动类
│   ├── config/
│   │   ├── WebConfig.java                 # CORS 配置
│   │   ├── WebClientConfig.java           # WebClient Bean
│   │   └── SchedulingConfig.java          # 定时任务开关
│   ├── controller/
│   │   ├── EventController.java           # 事件 CRUD API
│   │   ├── AnalysisController.java        # 分析报告 API
│   │   ├── FundController.java            # 基金持仓 API
│   │   └── MarketController.java          # 行情数据 API
│   ├── service/
│   │   ├── EventService.java              # 事件业务逻辑
│   │   ├── AnalysisService.java           # 报告业务逻辑
│   │   ├── FundPositionService.java       # 持仓业务逻辑
│   │   ├── MarketDataService.java         # 行情采集服务
│   │   └── AiAnalysisService.java         # Claude AI 调用封装
│   ├── crawler/
│   │   ├── NewsCrawlerService.java        # 新闻爬虫主调度
│   │   ├── RssFeedCrawler.java            # RSS 解析
│   │   ├── SecEdgarCrawler.java           # SEC 13F 解析
│   │   └── MarketDataCrawler.java         # 行情数据采集
│   ├── scheduler/
│   │   ├── DailyCrawlScheduler.java       # 每日采集任务
│   │   ├── DailyAnalysisScheduler.java    # 每日分析任务
│   │   └── MarketDataScheduler.java       # 行情数据同步任务
│   ├── repository/
│   │   ├── EventRepository.java           # JPA 仓库
│   │   ├── DailyAnalysisRepository.java
│   │   ├── FundPositionRepository.java
│   │   └── MarketDataRepository.java
│   ├── domain/
│   │   ├── Event.java                     # 事件实体
│   │   ├── DailyAnalysis.java             # 分析报告实体
│   │   ├── FundPosition.java              # 持仓实体
│   │   └── MarketData.java                # 行情实体
│   ├── dto/
│   │   ├── request/
│   │   │   ├── EventQueryRequest.java     # 事件查询参数
│   │   │   └── AnalysisQueryRequest.java
│   │   └── response/
│   │       ├── EventVO.java               # 事件视图对象
│   │       ├── AnalysisVO.java            # 分析报告视图对象
│   │       ├── DashboardVO.java           # 首页汇总数据
│   │       └── ApiResult.java             # 统一响应包装
│   ├── ai/
│   │   ├── ClaudeClient.java              # Claude API 客户端
│   │   ├── PromptBuilder.java             # Prompt 构建器
│   │   └── dto/
│   │       ├── ClaudeRequest.java
│   │       ├── ClaudeResponse.java
│   │       └── AnalysisResult.java        # AI 分析结果 POJO
│   └── exception/
│       ├── GlobalExceptionHandler.java    # 全局异常处理
│       └── BusinessException.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
└── pom.xml
```

### 5.2 核心依赖（pom.xml）

```xml
<!-- Spring Boot 3.4 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.4.0</version>
</parent>

<!-- 核心依赖 -->
spring-boot-starter-web          <!-- REST API -->
spring-boot-starter-data-jpa     <!-- ORM -->
spring-boot-starter-webflux      <!-- WebClient (Claude API 调用) -->
spring-boot-starter-validation   <!-- 参数校验 -->
spring-boot-starter-actuator     <!-- 健康检查 -->
mysql-connector-j                <!-- MySQL 驱动 -->
lombok                           <!-- 代码简化 -->
jsoup:1.17.2                     <!-- HTML 爬虫 -->
rome:1.18.0                      <!-- RSS 解析 -->
jackson-databind                 <!-- JSON 序列化 -->
springdoc-openapi-starter:2.x    <!-- Swagger 文档 -->
```

### 5.3 关键配置（application.yml）

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/us_monitor?useSSL=false&serverTimezone=UTC&characterEncoding=utf8mb4
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
  jpa:
    hibernate:
      ddl-auto: validate          # 生产环境用 validate，禁止 update
    show-sql: false
    open-in-view: false           # 关闭 OSIV，避免性能问题

app:
  claude:
    api-key: ${CLAUDE_API_KEY}
    api-url: https://api.anthropic.com/v1/messages
    model: claude-sonnet-4-20250514
    max-tokens: 4096
    timeout-seconds: 120
  cors:
    allowed-origins:
      - http://localhost:3000
      - https://yourdomain.com
  crawler:
    user-agent: "Mozilla/5.0 (compatible; USMonitor/1.0)"
    timeout-ms: 10000
    retry-times: 3

logging:
  level:
    com.usmonitor: INFO
    org.hibernate.SQL: WARN
```

### 5.4 统一响应格式

所有 API 接口统一返回以下结构：

```json
{
  "code": 200,
  "message": "success",
  "data": { },
  "timestamp": 1743408000000
}
```

错误响应示例：

```json
{
  "code": 400,
  "message": "参数错误：event_date 格式不正确",
  "data": null,
  "timestamp": 1743408000000
}
```

### 5.5 关键业务流程

#### 5.5.1 每日新闻采集流程

```
DailyCrawlScheduler.run()
  → NewsCrawlerService.crawlAll()
    → RssFeedCrawler.fetch(sources)          // 并行抓取多路 RSS
    → EventService.deduplication(rawItems)   // 标题 SimHash 去重
    → AiAnalysisService.batchVerify(items)   // Claude 批量验证真实性
    → EventService.batchSave(verifiedItems)  // 入库，打 is_verified 标记
  → CrawlLogService.saveLog(result)          // 记录采集日志
```

#### 5.5.2 每日 AI 趋势分析流程

```
DailyAnalysisScheduler.run()
  → EventService.getTodayVerifiedEvents()    // 取今日已验证事件
  → FundPositionService.getRecentChanges()  // 取近期持仓变动
  → MarketDataService.getLatestSnapshot()   // 取最新行情数据
  → PromptBuilder.buildAnalysisPrompt(...)  // 组装 Prompt
  → ClaudeClient.chat(prompt)               // 调用 Claude API
  → AnalysisResult = JSON.parse(response)   // 解析结构化结果
  → AnalysisService.save(result)            // 存入 daily_analysis
```

---

## 6. 前端架构设计

### 6.1 项目结构

```
us-stock-monitor-frontend/
├── app/
│   ├── layout.tsx                         # 全局布局（侧边栏+顶部导航）
│   ├── page.tsx                           # 首页 → 重定向到 /dashboard
│   ├── dashboard/
│   │   └── page.tsx                       # 仪表盘首页
│   ├── events/
│   │   ├── page.tsx                       # 事件列表页
│   │   └── [id]/page.tsx                  # 事件详情页
│   ├── analysis/
│   │   ├── page.tsx                       # 分析报告列表
│   │   └── [date]/page.tsx               # 指定日期报告详情
│   └── funds/
│       └── page.tsx                       # 基金持仓动向页
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx                    # 左侧导航栏
│   │   └── TopBar.tsx                     # 顶部栏（日期选择器）
│   ├── dashboard/
│   │   ├── TrendGauge.tsx                 # 趋势概率仪表盘（Recharts）
│   │   ├── SignalBadge.tsx                # 信号灯组件
│   │   ├── MarketSnapshot.tsx             # 行情快照卡片
│   │   └── EventSummaryList.tsx           # 今日要闻摘要
│   ├── events/
│   │   ├── EventCard.tsx                  # 事件卡片
│   │   ├── EventFilter.tsx                # 筛选栏（类别、情绪、日期）
│   │   └── EventTable.tsx                 # 事件列表表格
│   ├── analysis/
│   │   ├── ProbabilityChart.tsx           # 概率趋势折线图（Recharts）
│   │   ├── AnalysisReport.tsx             # Markdown 报告渲染
│   │   └── RiskTailwindList.tsx           # 风险/利好列表
│   ├── funds/
│   │   ├── FundPositionTable.tsx          # 持仓变动表格
│   │   └── FundSelector.tsx               # 基金筛选器
│   └── ui/                                # shadcn/ui 组件（按需引入）
│       ├── badge.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── select.tsx
│       └── table.tsx
├── hooks/
│   ├── useEvents.ts                       # 事件数据 SWR Hook
│   ├── useAnalysis.ts                     # 分析报告 SWR Hook
│   ├── useDashboard.ts                    # 首页数据 Hook
│   └── useFundPositions.ts               # 持仓数据 Hook
├── lib/
│   ├── api.ts                             # axios 实例 + 拦截器
│   ├── utils.ts                           # 工具函数（日期格式化等）
│   └── constants.ts                       # 常量（类别映射、颜色等）
├── store/
│   └── useAppStore.ts                     # Zustand 全局状态（当前日期等）
├── types/
│   ├── event.ts                           # Event 类型定义
│   ├── analysis.ts                        # Analysis 类型定义
│   └── fund.ts                            # FundPosition 类型定义
├── public/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

### 6.2 核心依赖（package.json）

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "recharts": "2.x",
    "swr": "2.x",
    "axios": "1.x",
    "zustand": "4.x",
    "react-markdown": "9.x",
    "remark-gfm": "4.x",
    "date-fns": "3.x",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-calendar": "latest",
    "clsx": "2.x",
    "lucide-react": "latest"
  }
}
```

### 6.3 页面功能说明

#### 6.3.1 仪表盘（/dashboard）

- 今日日期 + 市场状态（交易日/非交易日）
- SPX 和 NDX 趋势仪表盘（半圆形 Gauge，显示 7d/30d 概率）
- 综合信号灯（5色：深绿/浅绿/灰/浅红/深红）
- 今日市场行情快照（SPX、NDX、VIX、10Y、DXY）
- 今日重要事件列表（按 impact_score 降序，最多显示 10 条）
- 近期分析报告入口

#### 6.3.2 事件列表（/events）

- 顶部：日期范围选择器（DateRangePicker）
- 筛选栏：类别（多选）+ 情绪（全部/看涨/看跌/中性）+ 是否已验证
- 事件卡片：类别标签、情绪颜色、可信度评分、影响力评分、标题、摘要、来源链接
- 分页：每页 20 条

#### 6.3.3 分析报告（/analysis）

- 左侧日期历史列表（按月分组）
- 右侧报告内容：
  - 概率卡片（4 个：SPX 7d、SPX 30d、NDX 7d、NDX 30d）
  - 概率历史趋势折线图（Recharts LineChart，最近 30 天）
  - AI 全文报告（react-markdown 渲染）
  - 参考事件列表（折叠展示）

#### 6.3.4 基金动向（/funds）

- 基金选择器（多选）
- 股票代码搜索
- 季度筛选
- 持仓变动表格：基金、股票代码、操作类型、变动量、市值、披露日期
- 操作类型颜色区分：新建（绿）、加仓（浅绿）、减仓（浅红）、清仓（红）

### 6.4 Recharts 图表规范

```typescript
// 趋势概率折线图示例配置
const chartConfig = {
  spx7d:  { color: '#378ADD', label: 'SPX 7日' },
  spx30d: { color: '#1D9E75', label: 'SPX 30日' },
  ndx7d:  { color: '#BA7517', label: 'NDX 7日' },
  ndx30d: { color: '#D85A30', label: 'NDX 30日' },
};

// 参考线：50% 中轴线（中性分界）
<ReferenceLine y={50} stroke="#888" strokeDasharray="4 2" label="中性" />
```

---

## 7. AI 分析模块设计

### 7.1 Claude API 调用配置

- 模型：`claude-sonnet-4-20250514`
- 最大 Token：4096
- Temperature：0（分析类任务要求确定性输出）
- 超时：120 秒

### 7.2 事件验证 Prompt

```
你是专业的财经新闻核实员。请对以下新闻事件进行评估：

事件标题：{title}
事件摘要：{summary}
来源：{source}
发布时间：{date}

请从以下维度打分并输出 JSON（不要输出其他任何内容）：
{
  "credibility_score": 85,          // 可信度 0-100，主流媒体+可交叉验证得高分
  "impact_score": 70,               // 对美股指数的潜在影响力 0-100
  "sentiment": "BEARISH",           // BULLISH/BEARISH/NEUTRAL
  "category": "FED",                // 事件类别
  "reason": "路透社报道，可信度高；美联储加息超预期，直接负面冲击"
}
```

### 7.3 每日趋势分析 Prompt

```
你是一位专注美股市场的资深策略分析师，擅长综合宏观、政策、资金面信息给出前瞻性判断。

# 当日重要事件（已验证，按影响力排序）
{verified_events_json}

# 近期顶级基金持仓变动（最近一个季度）
{fund_positions_json}

# 当前市场数据
- SPX: {spx_close}（{spx_change_pct}%）
- NDX: {ndx_close}（{ndx_change_pct}%）
- VIX: {vix}
- 10Y 美债: {us10y}%
- 美元指数: {dxy}

# 任务
请综合以上信息，输出今日（{date}）美股趋势分析。严格按以下 JSON 格式输出，不要包含任何其他内容：

{
  "spx_bull_prob_7d": 65,
  "spx_bull_prob_30d": 58,
  "ndx_bull_prob_7d": 70,
  "ndx_bull_prob_30d": 62,
  "signal": "bull",
  "key_risks": [
    "美联储鹰派表态超预期，市场加息预期重新升温",
    "地缘局势升级导致避险情绪蔓延"
  ],
  "key_tailwinds": [
    "科技龙头财报超预期，提振纳指情绪",
    "就业数据走弱支持降息预期"
  ],
  "report": "## 今日市场综合分析\n\n### 宏观环境\n...(完整 Markdown 报告，1500-3000 字)"
}
```

### 7.4 概率校准说明

| 概率区间 | 信号 | 含义 |
|----------|------|------|
| 70-100 | strong_bull | 多重利好共振，强烈看涨 |
| 55-69 | bull | 偏多，但存在一定不确定性 |
| 45-54 | neutral | 多空均衡，方向不明 |
| 30-44 | bear | 偏空，风险事件主导 |
| 0-29 | strong_bear | 系统性风险或重大黑天鹅 |

---

## 8. 定时任务设计

### 8.1 任务时间表

| 任务名称 | Cron 表达式 | 北京时间 | 美东时间 | 说明 |
|----------|-------------|----------|----------|------|
| 新闻采集 | `0 0 18 * * MON-FRI` | 18:00 | 06:00 AM | 美股开盘前采集当日要闻 |
| 行情数据同步 | `0 0 6 * * TUE-SAT` | 06:00 | 18:00 前日 | 抓取前一日收盘数据 |
| AI 趋势分析 | `0 0 20 * * MON-FRI` | 20:00 | 08:00 AM | 开盘前生成分析报告 |
| 13F 持仓同步 | `0 0 10 15 2,5,8,11 *` | 季度 15 日 | — | 每季度 45 天后披露 |
| 爬虫健康检查 | `0 0 9 * * *` | 09:00 | — | 检测数据源可用性 |

### 8.2 任务幂等性保证

- 每日分析任务：执行前检查 `daily_analysis.analysis_date` 是否已存在，存在则跳过
- 事件采集任务：基于 `source_url` MD5 做唯一性校验，避免重复入库
- 行情数据：基于 `trade_date` 唯一索引保证幂等

### 8.3 失败重试策略

- 新闻爬虫单源失败：重试 3 次（间隔 5s），失败后记录日志，不影响其他数据源
- Claude API 调用超时：重试 2 次，最终失败记录错误，不阻断采集流程
- 任务整体失败：写入 `crawl_logs`，并通过邮件或 Webhook 告警

---

## 9. API 接口规范

所有接口前缀：`/api/v1`，返回格式：`ApiResult<T>`

### 9.1 事件接口

```
GET  /api/v1/events
     参数: date(yyyy-MM-dd), startDate, endDate, category, sentiment, verified, page, size
     返回: PageResult<EventVO>

GET  /api/v1/events/{id}
     返回: EventVO

GET  /api/v1/events/today/summary
     返回: List<EventVO>（今日 top10 重要事件，供首页使用）
```

### 9.2 分析报告接口

```
GET  /api/v1/analysis/latest
     返回: AnalysisVO（最新一份报告）

GET  /api/v1/analysis/{date}
     参数: date(yyyy-MM-dd)
     返回: AnalysisVO

GET  /api/v1/analysis/history
     参数: days=30（最近N天）
     返回: List<AnalysisVO>（概率数据，不含全文，供图表使用）

GET  /api/v1/analysis/dates
     返回: List<String>（有报告的日期列表，供日历组件使用）
```

### 9.3 基金持仓接口

```
GET  /api/v1/funds/positions
     参数: fundName, ticker, quarter, action, page, size
     返回: PageResult<FundPositionVO>

GET  /api/v1/funds/list
     返回: List<String>（基金名称列表）

GET  /api/v1/funds/quarters
     返回: List<String>（已有数据的季度列表）
```

### 9.4 行情数据接口

```
GET  /api/v1/market/latest
     返回: MarketDataVO（最新行情）

GET  /api/v1/market/history
     参数: days=30
     返回: List<MarketDataVO>
```

### 9.5 仪表盘汇总接口

```
GET  /api/v1/dashboard
     返回: DashboardVO {
       latestAnalysis: AnalysisVO,
       latestMarket: MarketDataVO,
       todayTopEvents: List<EventVO>,
       recentProbTrend: List<ProbSnapshotVO>  // 30天概率趋势
     }
```

---

## 10. 部署方案

### 10.1 最小化部署（单台 VPS）

推荐配置：2 核 4G 内存，40G SSD，Ubuntu 22.04

```
VPS
├── Nginx (80/443)          → 反向代理
├── Docker
│   ├── us-monitor-backend  → Spring Boot 8080
│   ├── us-monitor-frontend → Next.js 3000
│   └── mysql:8.0           → 3306
└── Certbot                 → SSL 证书
```

### 10.2 docker-compose.yml 结构

```yaml
version: '3.9'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: us_monitor
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    environment:
      DB_USERNAME: root
      DB_PASSWORD: ${DB_PASSWORD}
      CLAUDE_API_KEY: ${CLAUDE_API_KEY}
    ports:
      - "8080:8080"
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_BASE_URL: https://yourdomain.com/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### 10.3 环境变量清单

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DB_PASSWORD` | MySQL 密码 | 是 |
| `CLAUDE_API_KEY` | Anthropic API Key | 是 |
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址 | 是 |
| `SPRING_PROFILES_ACTIVE` | 环境标识（prod） | 是 |
| `ALERT_EMAIL` | 告警邮件地址 | 否 |

---

## 11. 里程碑计划

| 阶段 | 目标 | 预估周期 |
|------|------|----------|
| P0 基础框架 | 完成前后端项目脚手架、数据库建表、CORS 配置、基础 API 联调 | 第 1 周 |
| P1 数据采集 | RSS 爬虫 + 2-3 路数据源接入 + 事件存储 + 采集日志 | 第 2 周 |
| P2 AI 集成 | Claude API 接入 + 事件验证 + 每日分析报告生成 | 第 3 周 |
| P3 前端核心 | 仪表盘 + 事件列表 + 分析报告页面 + 日期检索 | 第 4 周 |
| P4 基金模块 | 13F 采集 + 持仓动向页面 | 第 5 周 |
| P5 生产部署 | Docker 化 + Nginx + HTTPS + 定时任务验证 | 第 6 周 |
| P6 扩展优化 | 更多数据源接入、历史数据回填、移动端适配、告警通知 | 持续迭代 |

---

*文档最后更新：2026-03-31*
