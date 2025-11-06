-- ========================================
-- 数据库增量更新脚本
-- 版本: v1.2.0
-- 日期: 2025-11-05
-- 说明: 新增星星兑换系统、奖励商品管理
-- ========================================

USE literacy_db;

-- 检查版本管理表是否存在
CREATE TABLE IF NOT EXISTS db_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    description VARCHAR(500) COMMENT '更新说明',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '应用时间',
    INDEX idx_version (version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据库版本管理表';

-- 检查是否已应用此版本
SET @version_exists = (SELECT COUNT(*) FROM db_version WHERE version = 'v1.2.0');

-- 如果版本已存在，则退出
SELECT 
    CASE 
        WHEN @version_exists > 0 THEN '⚠️  版本 v1.2.0 已经应用过，无需重复执行'
        ELSE '✅ 开始应用版本 v1.2.0 的更新...'
    END AS status;

-- 仅在版本不存在时执行更新
SET @apply_update = IF(@version_exists = 0, 1, 0);

-- ========================================
-- 1. 奖励商品表
-- ========================================
SET @sql1 = IF(@apply_update = 1, 
'CREATE TABLE IF NOT EXISTS reward_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL COMMENT ''商品名称'',
    description TEXT COMMENT ''商品描述'',
    cost_stars INT NOT NULL COMMENT ''所需星星数'',
    icon VARCHAR(50) DEFAULT ''🎁'' COMMENT ''图标'',
    is_active BOOLEAN DEFAULT TRUE COMMENT ''是否启用'',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''创建时间'',
    INDEX idx_name (name),
    INDEX idx_cost_stars (cost_stars),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''奖励商品表''',
'SELECT 1');

PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- ========================================
-- 2. 星星兑换记录表
-- ========================================
SET @sql2 = IF(@apply_update = 1,
'CREATE TABLE IF NOT EXISTS star_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL COMMENT ''商品ID'',
    stars_spent INT NOT NULL COMMENT ''花费星星数'',
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT ''兑换时间'',
    notes TEXT COMMENT ''备注'',
    status VARCHAR(20) DEFAULT ''pending'' COMMENT ''状态：pending/completed/cancelled'',
    FOREIGN KEY (item_id) REFERENCES reward_items(id) ON DELETE CASCADE,
    INDEX idx_item_id (item_id),
    INDEX idx_status (status),
    INDEX idx_redeemed_at (redeemed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT=''星星兑换记录表''',
'SELECT 1');

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- ========================================
-- 3. 插入默认奖励商品
-- ========================================
SET @sql3 = IF(@apply_update = 1,
'INSERT INTO reward_items (name, description, cost_stars, icon) VALUES
(''去游乐园'', ''全家一起去游乐园玩一天'', 100, ''🎢''),
(''买玩具'', ''选一个喜欢的玩具'', 50, ''🧸''),
(''吃大餐'', ''去最喜欢的餐厅吃一顿'', 80, ''🍕''),
(''看电影'', ''去电影院看一场电影'', 60, ''🎬''),
(''买零食'', ''买一些喜欢的零食'', 30, ''🍬''),
(''周末旅行'', ''周末去附近玩两天'', 150, ''✈️'')',
'SELECT 1');

PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- ========================================
-- 记录版本信息
-- ========================================
SET @sql_version = IF(@apply_update = 1,
'INSERT INTO db_version (version, description) VALUES (''v1.2.0'', ''新增星星兑换系统、奖励商品管理、旅行足迹线路图'')',
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

-- 显示新增的表
SELECT 
    TABLE_NAME AS '表名',
    TABLE_COMMENT AS '说明',
    TABLE_ROWS AS '记录数'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'literacy_db'
AND TABLE_NAME IN ('reward_items', 'star_redemptions')
ORDER BY TABLE_NAME;

-- ========================================
-- 更新说明
-- ========================================
/*
v1.2.0 更新内容：

1. 新增星星兑换系统
   - reward_items: 奖励商品表
   - star_redemptions: 兑换记录表
   - 默认添加6个奖励商品

2. 新增功能
   - 旅行足迹线路图（三个小人）
   - 我的奖励独立模块
   - 星星兑换功能
   - 商品管理功能

3. 菜单结构调整
   - "我的奖励"成为独立一级菜单
   - 新增"旅行足迹"菜单项
   - 新增"星星兑换"子菜单

注意事项：
- 此脚本可以安全地重复执行
- 如果版本已存在，将自动跳过更新
- 所有表使用 IF NOT EXISTS，不会覆盖已有数据
- 默认商品仅在表为空时插入
*/

