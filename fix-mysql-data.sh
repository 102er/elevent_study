#!/bin/bash

echo "🔧 MySQL数据修复工具"
echo "========================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-password}
BACKUP_DIR="./backups"

echo "📊 当前情况分析："
echo "   MySQL数据文件损坏，无法启动"
echo ""
echo "💡 解决方案："
echo "   1. 如果有SQL备份：从备份恢复"
echo "   2. 如果有旧Docker卷：重新迁移"
echo "   3. 如果都没有：初始化新数据库"
echo ""

# 检查是否有备份文件
if ls $BACKUP_DIR/*.sql 2>/dev/null | grep -q .; then
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/*.sql 2>/dev/null | head -1)
    echo "✅ 找到备份文件：$LATEST_BACKUP"
    HAS_BACKUP=true
else
    echo "⚠️  未找到SQL备份文件"
    HAS_BACKUP=false
fi

# 检查是否有旧的Docker卷
VOLUME_NAME="eleven_study_mysql_data"
if docker volume inspect $VOLUME_NAME &> /dev/null; then
    echo "✅ 找到旧的Docker数据卷：$VOLUME_NAME"
    HAS_VOLUME=true
else
    echo "⚠️  未找到旧的Docker数据卷"
    HAS_VOLUME=false
fi

echo ""
echo "请选择修复方案："
echo "  1) 从SQL备份恢复（推荐，如果有备份）"
echo "  2) 从Docker卷重新迁移（如果旧卷还在）"
echo "  3) 初始化全新数据库（会丢失数据）"
echo ""
read -p "请输入选项 (1/2/3): " choice

case $choice in
    1)
        if [ "$HAS_BACKUP" = false ]; then
            echo "❌ 没有找到备份文件，请选择其他方案"
            exit 1
        fi
        
        echo ""
        echo "================================"
        echo "📦 方案1：从SQL备份恢复"
        echo "================================"
        
        # 步骤1：停止所有服务
        echo ""
        echo "步骤 1/5: 停止所有服务"
        docker compose down
        
        # 步骤2：清理损坏的数据
        echo ""
        echo "步骤 2/5: 清理损坏的数据目录"
        sudo rm -rf ./data/mysql/*
        echo "✅ 已清理"
        
        # 步骤3：启动MySQL（会初始化新数据库）
        echo ""
        echo "步骤 3/5: 启动MySQL服务"
        docker compose up -d mysql
        
        echo "⏳ 等待MySQL初始化..."
        sleep 30
        
        # 等待MySQL就绪
        for i in {1..30}; do
            if docker compose exec mysql mysqladmin ping -h localhost -uroot -p${MYSQL_ROOT_PASSWORD} &> /dev/null; then
                echo "✅ MySQL已就绪"
                break
            fi
            echo "等待MySQL启动... ($i/30)"
            sleep 2
        done
        
        # 步骤4：恢复数据
        echo ""
        echo "步骤 4/5: 从备份恢复数据"
        echo "使用备份文件：$LATEST_BACKUP"
        
        if [[ $LATEST_BACKUP == *.gz ]]; then
            gunzip -c $LATEST_BACKUP | docker compose exec -T mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD}
        else
            docker compose exec -T mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} < $LATEST_BACKUP
        fi
        
        if [ $? -eq 0 ]; then
            echo "✅ 数据恢复成功"
        else
            echo "❌ 数据恢复失败"
            exit 1
        fi
        
        # 步骤5：启动所有服务
        echo ""
        echo "步骤 5/5: 启动所有服务"
        docker compose up -d
        
        echo ""
        echo "✅ 修复完成！"
        ;;
        
    2)
        if [ "$HAS_VOLUME" = false ]; then
            echo "❌ 没有找到旧的Docker卷，请选择其他方案"
            exit 1
        fi
        
        echo ""
        echo "================================"
        echo "📦 方案2：从Docker卷重新迁移"
        echo "================================"
        
        # 步骤1：停止所有服务
        echo ""
        echo "步骤 1/4: 停止所有服务"
        docker compose down
        
        # 步骤2：清理损坏的数据
        echo ""
        echo "步骤 2/4: 清理损坏的数据目录"
        sudo rm -rf ./data/mysql
        mkdir -p ./data/mysql
        echo "✅ 已清理"
        
        # 步骤3：重新迁移数据
        echo ""
        echo "步骤 3/4: 从Docker卷重新迁移数据"
        echo "这可能需要几分钟..."
        
        docker run --rm \
            -v ${VOLUME_NAME}:/source:ro \
            -v $(pwd)/data/mysql:/target \
            alpine \
            sh -c "cp -av /source/. /target/ && chown -R 999:999 /target"
        
        if [ $? -eq 0 ]; then
            echo "✅ 数据迁移成功"
        else
            echo "❌ 数据迁移失败"
            exit 1
        fi
        
        # 修复权限
        sudo chown -R 999:999 ./data/mysql
        sudo chmod -R 750 ./data/mysql
        
        # 步骤4：启动所有服务
        echo ""
        echo "步骤 4/4: 启动所有服务"
        docker compose up -d
        
        echo ""
        echo "✅ 修复完成！"
        ;;
        
    3)
        echo ""
        echo "================================"
        echo "📦 方案3：初始化全新数据库"
        echo "================================"
        echo ""
        echo "⚠️  警告：这将删除所有现有数据！"
        read -p "确定要继续吗？(yes/no): " confirm
        
        if [ "$confirm" != "yes" ]; then
            echo "已取消"
            exit 0
        fi
        
        # 步骤1：停止所有服务
        echo ""
        echo "步骤 1/3: 停止所有服务"
        docker compose down
        
        # 步骤2：清理数据目录
        echo ""
        echo "步骤 2/3: 清理数据目录"
        sudo rm -rf ./data/mysql
        mkdir -p ./data/mysql
        sudo chown -R 999:999 ./data/mysql
        sudo chmod -R 750 ./data/mysql
        echo "✅ 已清理"
        
        # 步骤3：启动服务（会自动初始化）
        echo ""
        echo "步骤 3/3: 启动服务"
        docker compose up -d
        
        echo ""
        echo "⏳ 等待MySQL初始化..."
        sleep 30
        
        echo ""
        echo "✅ 初始化完成！"
        echo ""
        echo "💡 提示：数据库已初始化，包含示例数据"
        ;;
        
    *)
        echo "❌ 无效的选项"
        exit 1
        ;;
esac

echo ""
echo "================================"
echo "🔍 验证结果"
echo "================================"

sleep 5

# 检查服务状态
echo ""
echo "服务状态："
docker compose ps

echo ""
echo "验证数据库："
docker compose exec mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} -e "
USE literacy_db;
SELECT 'words表记录数:' as '', COUNT(*) FROM words;
SELECT 'learning_records表记录数:' as '', COUNT(*) FROM learning_records;
SELECT 'books表记录数:' as '', COUNT(*) FROM books;
SELECT 'reading_records表记录数:' as '', COUNT(*) FROM reading_records;
" 2>/dev/null

echo ""
echo "================================"
echo "🎉 修复完成！"
echo "================================"
echo ""
echo "🌐 现在可以访问："
echo "   http://localhost"
echo "   或 http://服务器IP"
echo ""

