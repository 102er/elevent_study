-- 更新数据库结构：将拼音和意思字段改为可选
-- 此脚本用于更新现有数据库

USE literacy_db;

-- 修改 words 表的字段定义
ALTER TABLE words 
    MODIFY COLUMN pinyin VARCHAR(50) NULL COMMENT '拼音（可选）',
    MODIFY COLUMN meaning VARCHAR(200) NULL COMMENT '意思（可选）';

-- 对于已有的空字符串数据，可以选择保持不变或转换为NULL
-- UPDATE words SET pinyin = NULL WHERE pinyin = '';
-- UPDATE words SET meaning = NULL WHERE meaning = '';

SELECT '✅ 数据库结构更新完成！拼音和意思已改为可选字段。' as message;

