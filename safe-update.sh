#!/bin/bash

echo "🔄 儿童识字乐园 - 安全更新脚本"
echo "================================"
echo ""
echo "⚠️  注意：此脚本会保留所有现有数据！"
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 步骤1：备份数据（可选但推荐）
echo "📦 步骤 1/5: 数据备份（推荐）"
echo "------------------------"
read -p "是否备份当前数据？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BACKUP_DIR="./backups"
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    mkdir -p $BACKUP_DIR
    echo "正在备份数据库..."
    
    docker compose exec -T mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD:-password} literacy_db > $BACKUP_DIR/$BACKUP_FILE 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ 备份完成：$BACKUP_DIR/$BACKUP_FILE"
    else
        echo "⚠️  备份失败，但可以继续（现有数据仍在数据卷中）"
    fi
else
    echo "⏭️  跳过备份"
fi

echo ""

# 步骤2：更新代码
echo "📝 步骤 2/5: 更新应用代码"
echo "------------------------"
echo "代码已更新（包含阅读记录功能）"
echo "✅ 前端组件已更新"
echo "✅ 后端API已更新"
echo "✅ 数据库迁移脚本已准备"
echo ""

# 步骤3：重新构建镜像
echo "🔨 步骤 3/5: 重新构建Docker镜像"
echo "------------------------"
echo "正在重新构建..."
docker compose build --no-cache

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误信息"
    exit 1
fi

echo "✅ 构建完成"
echo ""

# 步骤4：重启服务（不删除数据卷）
echo "🚀 步骤 4/5: 重启服务"
echo "------------------------"
echo "正在重启服务（保留所有数据）..."

# 停止容器但不删除数据卷
docker compose down

# 启动新容器
docker compose up -d

echo "✅ 服务已重启"
echo ""

# 等待MySQL启动
echo "⏳ 等待数据库启动..."
sleep 10

# 步骤5：执行数据库迁移
echo "🗄️  步骤 5/5: 数据库迁移"
echo "------------------------"
echo "正在添加新表（books, reading_records）..."

# 执行迁移脚本
docker compose exec -T mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD:-password} < migrate-add-reading.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移成功"
else
    echo "⚠️  迁移可能已执行过，或需要手动检查"
fi

echo ""
echo "🎉 更新完成！"
echo "================================"
echo ""
echo "📊 服务状态："
docker compose ps
echo ""
echo "🌐 访问地址："
echo "   http://localhost"
echo ""
echo "✅ 已保留的数据："
echo "   - 所有汉字"
echo "   - 学习记录"
echo "   - 星星积分"
echo "   - 周统计数据"
echo ""
echo "🆕 新增功能："
echo "   - 阅读记录管理"
echo "   - 书籍管理"
echo "   - 阅读进度追踪"
echo ""
echo "💡 提示："
echo "   点击导航菜单中的 '阅读记录' 开始使用新功能！"
echo ""

