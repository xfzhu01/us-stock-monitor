CREATE DATABASE IF NOT EXISTS us_monitor DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE us_monitor;

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

CREATE TABLE fund_positions (
    id              BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    fund_name       VARCHAR(100)    NOT NULL                COMMENT '基金名称',
    manager_name    VARCHAR(100)                            COMMENT '基金经理',
    ticker          VARCHAR(10)     NOT NULL                COMMENT '股票代码',
    company_name    VARCHAR(200)                            COMMENT '公司名称',
    action          VARCHAR(10)     NOT NULL                COMMENT '操作: ADD/REDUCE/NEW/CLOSE',
    shares_change   BIGINT                                  COMMENT '变动股数',
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

CREATE TABLE daily_analysis (
    id                  BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键',
    analysis_date       DATE            NOT NULL UNIQUE         COMMENT '分析日期',
    spx_bull_prob_7d    TINYINT UNSIGNED                        COMMENT 'SPX 7日看涨概率 0-100',
    spx_bull_prob_30d   TINYINT UNSIGNED                        COMMENT 'SPX 30日看涨概率 0-100',
    ndx_bull_prob_7d    TINYINT UNSIGNED                        COMMENT 'NDX 7日看涨概率 0-100',
    ndx_bull_prob_30d   TINYINT UNSIGNED                        COMMENT 'NDX 30日看涨概率 0-100',
    signal              VARCHAR(15)                             COMMENT '综合信号: strong_bull/bull/neutral/bear/strong_bear',
    key_risks           JSON                                    COMMENT '主要风险列表',
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
