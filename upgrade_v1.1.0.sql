-- ========================================
-- 数据库增量更新脚本
-- 版本: v1.1.0
-- 日期: 2025-11-05
-- 说明: 新增旅行计划、古诗、日常任务功能
-- ========================================

USE literacy_db;

-- 创建版本管理表（如果不存在）
CREATE TABLE IF NOT EXISTS db_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    description VARCHAR(500) COMMENT '更新说明',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '应用时间',
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据库版本管理表';

-- 检查是否已应用此版本
SET @version_exists = (SELECT COUNT(*) FROM db_version WHERE version = 'v1.1.0');

-- 如果版本已存在，则退出
SELECT 
    CASE 
        WHEN @version_exists > 0 THEN '⚠️  版本 v1.1.0 已经应用过，无需重复执行'
        ELSE '✅ 开始应用版本 v1.1.0 的更新...'
    END AS status;

-- 仅在版本不存在时执行更新
SET @apply_update = IF(@version_exists = 0, 1, 0);

-- ========================================
-- 1. 旅行计划表
-- ========================================
SET @sql1 = IF(@apply_update = 1, 
'CREATE TABLE IF NOT EXISTS travel_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination VARCHAR(200) NOT NULL COMMENT ''目的地'',
    budget DECIMAL(10, 2) DEFAULT 0 COMMENT ''预算（元）'',
    start_date DATE COMMENT ''开始时间'',
    end_date DATE COMMENT ''结束时间'',
    notes TEXT COMMENT ''备注'',
    is_completed BOOLEAN DEFAULT FALSE COMMENT ''是否完成'',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''创建时间'',
    completed_at DATETIME COMMENT ''完成时间'',
    INDEX idx_destination (destination),
    INDEX idx_completed (is_completed),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''旅行计划表''',
'SELECT 1');

PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- ========================================
-- 2. 旅行足迹表
-- ========================================
SET @sql2 = IF(@apply_update = 1,
'CREATE TABLE IF NOT EXISTS travel_footprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT NOT NULL COMMENT ''旅行计划ID'',
    expense DECIMAL(10, 2) NOT NULL COMMENT ''花费金额'',
    description VARCHAR(200) COMMENT ''描述'',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''记录时间'',
    FOREIGN KEY (plan_id) REFERENCES travel_plans(id) ON DELETE CASCADE,
    INDEX idx_plan_id (plan_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''旅行足迹表''',
'SELECT 1');

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- ========================================
-- 3. 古诗表
-- ========================================
SET @sql3 = IF(@apply_update = 1,
'CREATE TABLE IF NOT EXISTS poems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL COMMENT ''诗名'',
    author VARCHAR(100) COMMENT ''作者'',
    content TEXT NOT NULL COMMENT ''诗词内容'',
    is_completed BOOLEAN DEFAULT FALSE COMMENT ''是否完成'',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''录入时间'',
    completed_at DATETIME COMMENT ''完成时间'',
    INDEX idx_title (title),
    INDEX idx_completed (is_completed),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''古诗表''',
'SELECT 1');

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- ========================================
-- 4. 日常任务表
-- ========================================
SET @sql4 = IF(@apply_update = 1,
'CREATE TABLE IF NOT EXISTS daily_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(200) NOT NULL COMMENT ''任务名称'',
    reward_stars INT DEFAULT 0 COMMENT ''奖励星星数量'',
    description TEXT COMMENT ''任务描述'',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''创建时间'',
    INDEX idx_task_name (task_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''日常任务表''',
'SELECT 1');

PREPARE stmt4 FROM @sql4;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

-- ========================================
-- 5. 日常任务完成记录表
-- ========================================
SET @sql5 = IF(@apply_update = 1,
'CREATE TABLE IF NOT EXISTS task_completions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL COMMENT ''任务ID'',
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''完成时间'',
    notes TEXT COMMENT ''备注'',
    stars_earned INT DEFAULT 0 COMMENT ''获得星星数'',
    FOREIGN KEY (task_id) REFERENCES daily_tasks(id) ON DELETE CASCADE,
    INDEX idx_task_id (task_id),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''任务完成记录表''',
'SELECT 1');

PREPARE stmt5 FROM @sql5;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

-- ========================================
-- 记录版本信息
-- ========================================
SET @sql_version = IF(@apply_update = 1,
'INSERT INTO db_version (version, description) VALUES (''v1.1.0'', ''新增旅行计划、古诗背诵、日常任务功能模块'')',
'SELECT 1');

PREPARE stmt_version FROM @sql_version;
EXECUTE stmt_version;
DEALLOCATE PREPARE stmt_version;

-- ========================================
-- 验证更新结果
-- ========================================
SELECT 
    CASE 
        WHEN @apply_update = 1 THEN '✅ 数据库升级完成！'
        ELSE '⚠️  更新已跳过（版本已存在）'
    END AS result;

-- 显示当前数据库版本信息
SELECT 
    version AS '版本号',
    description AS '说明',
    applied_at AS '应用时间'
FROM db_version 
ORDER BY applied_at DESC 
LIMIT 5;

-- 显示所有表的统计信息
SELECT 
    TABLE_NAME AS '表名',
    TABLE_COMMENT AS '说明',
    TABLE_ROWS AS '记录数',
    ROUND(DATA_LENGTH/1024/1024, 2) AS '数据大小(MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'literacy_db'
ORDER BY TABLE_NAME;

-- ========================================
-- 更新说明
-- ========================================
/*
本次更新内容：
1. 新增旅行计划功能（travel_plans, travel_footprints）
   - 记录旅行目的地、预算、时间
   - 旅行足迹：1元 = 1颗星星

2. 新增古诗背诵功能（poems）
   - 录入古诗词
   - 完成背诵：1首 = 5颗星星

3. 新增日常任务功能（daily_tasks, task_completions）
   - 自定义任务和奖励
   - 任务完成记录

4. 新增数据库版本管理（db_version）
   - 跟踪数据库版本
   - 防止重复执行更新脚本

注意事项：
- 此脚本可以安全地重复执行
- 如果版本已存在，将自动跳过更新
- 所有表使用 IF NOT EXISTS，不会覆盖已有数据
- 外键约束确保数据完整性
*/

