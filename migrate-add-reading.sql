-- 数据库迁移脚本：添加阅读记录功能
-- 此脚本可以安全地在现有数据库上运行，不会删除任何现有数据
-- 执行时间：2024年

USE literacy_db;

-- 检查并创建书籍表
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

-- 检查并创建阅读记录表
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

-- 插入默认书籍（如果表是空的）
INSERT INTO books (title, author, cover_color, total_pages, description)
SELECT * FROM (
    SELECT '小王子' as title, '安东尼·德·圣-埃克苏佩里' as author, 'yellow' as cover_color, 96 as total_pages, '一个关于爱与责任的童话故事' as description
    UNION ALL
    SELECT '绿野仙踪', '莱曼·弗兰克·鲍姆', 'green', 120, '奇幻冒险的经典儿童文学'
    UNION ALL
    SELECT '爱丽丝梦游仙境', '刘易斯·卡罗尔', 'purple', 88, '充满想象力的奇幻故事'
    UNION ALL
    SELECT '安徒生童话', '安徒生', 'blue', 150, '经典童话故事集'
    UNION ALL
    SELECT '格林童话', '格林兄弟', 'pink', 140, '温馨的童话故事集'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM books LIMIT 1);

-- 显示结果
SELECT '✅ 数据库迁移完成！' AS status;
SELECT '📚 书籍表状态：' AS info, COUNT(*) AS total_books FROM books;
SELECT '📖 阅读记录表状态：' AS info, COUNT(*) AS total_records FROM reading_records;
SELECT '✍️ 汉字表状态：' AS info, COUNT(*) AS total_words FROM words;
SELECT '⭐ 学习记录状态：' AS info, COUNT(*) AS total_learned FROM learning_records;

