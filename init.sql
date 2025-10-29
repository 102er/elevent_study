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

-- 书籍表
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '书名',
    author VARCHAR(100) COMMENT '作者',
    cover_color VARCHAR(20) DEFAULT 'blue' COMMENT '封面颜色',
    total_pages INT DEFAULT 0 COMMENT '总页数',
    description TEXT COMMENT '简介',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    INDEX idx_title (title),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='书籍表';

-- 阅读记录表
CREATE TABLE IF NOT EXISTS reading_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL COMMENT '书籍ID',
    is_completed BOOLEAN DEFAULT FALSE COMMENT '是否读完',
    current_page INT DEFAULT 0 COMMENT '当前页数',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '开始阅读时间',
    completed_at DATETIME COMMENT '完成时间',
    notes TEXT COMMENT '阅读笔记',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id),
    INDEX idx_completed (is_completed),
    INDEX idx_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='阅读记录表';

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

-- 插入默认书籍
INSERT INTO books (title, author, cover_color, total_pages, description) VALUES
('小王子', '安东尼·德·圣-埃克苏佩里', 'yellow', 96, '一个关于爱与责任的童话故事'),
('绿野仙踪', '莱曼·弗兰克·鲍姆', 'green', 120, '奇幻冒险的经典儿童文学'),
('爱丽丝梦游仙境', '刘易斯·卡罗尔', 'purple', 88, '充满想象力的奇幻故事'),
('安徒生童话', '安徒生', 'blue', 150, '经典童话故事集'),
('格林童话', '格林兄弟', 'pink', 140, '温馨的童话故事集');

