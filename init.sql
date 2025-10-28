-- 初始化数据库脚本
CREATE DATABASE IF NOT EXISTS literacy_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE literacy_db;

-- 汉字表
CREATE TABLE IF NOT EXISTS words (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(10) NOT NULL COMMENT '汉字',
    pinyin VARCHAR(50) NOT NULL COMMENT '拼音',
    meaning VARCHAR(200) NOT NULL COMMENT '意思',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_word (word),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='汉字表';

-- 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word_id INT NOT NULL COMMENT '汉字ID',
    learned_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '学习时间',
    year INT NOT NULL COMMENT '年份',
    week INT NOT NULL COMMENT '周数',
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    INDEX idx_word_id (word_id),
    INDEX idx_year_week (year, week),
    INDEX idx_learned_at (learned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学习记录表';

-- 星星记录表
CREATE TABLE IF NOT EXISTS star_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stars INT DEFAULT 0 NOT NULL COMMENT '星星数量',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='星星记录表';

-- 插入默认星星记录
INSERT INTO star_records (stars) VALUES (0);

-- 插入默认汉字
INSERT INTO words (word, pinyin, meaning) VALUES
('日', 'rì', '太阳'),
('月', 'yuè', '月亮'),
('水', 'shuǐ', '液体'),
('火', 'huǒ', '燃烧'),
('山', 'shān', '高大的地形'),
('木', 'mù', '树木'),
('人', 'rén', '人类'),
('口', 'kǒu', '嘴巴');

