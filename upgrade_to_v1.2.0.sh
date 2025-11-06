#!/bin/bash

# ========================================
# 数据库升级脚本 v1.2.0
# 日期: 2025-11-05
# 说明: 升级到 v1.2.0（星星兑换系统）
# ========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 数据库密码
DB_PASSWORD="literacy2024"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}========================================${NC}"
    echo ""
}

print_feature() {
    echo -e "${CYAN}  ✨ $1${NC}"
}

# 检查是否在项目目录
check_directory() {
    if [ ! -f "docker-compose.yml" ]; then
        print_error "错误：请在项目根目录下运行此脚本"
        exit 1
    fi
}

# 检查 Docker 服务状态
check_docker() {
    print_info "检查 Docker 服务..."
    if ! docker compose ps | grep -q "Up"; then
        print_warning "Docker 服务未运行，请先启动服务"
        print_info "运行: docker compose up -d"
        exit 1
    fi
    print_success "Docker 服务正常运行"
}

# 备份数据库
backup_database() {
    print_header "1. 备份数据库"
    
    BACKUP_FILE="backup_v1.2.0_$(date +%Y%m%d_%H%M%S).sql"
    
    print_info "正在备份数据库到: $BACKUP_FILE"
    
    docker compose exec -T mysql mysqldump -uroot -p${DB_PASSWORD} literacy_db > "$BACKUP_FILE" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
        print_success "数据库备份成功！文件大小: $BACKUP_SIZE"
        echo "备份文件: $BACKUP_FILE"
    else
        print_error "数据库备份失败！"
        exit 1
    fi
}

# 执行升级脚本
upgrade_database() {
    print_header "2. 执行数据库升级"
    
    if [ ! -f "upgrade_v1.2.0.sql" ]; then
        print_error "升级脚本 upgrade_v1.2.0.sql 不存在！"
        exit 1
    fi
    
    print_info "正在执行升级脚本..."
    print_info "升级内容："
    print_feature "新增星星兑换系统"
    print_feature "新增奖励商品管理"
    print_feature "新增旅行足迹线路图"
    echo ""
    
    docker compose exec -T mysql mysql -uroot -p${DB_PASSWORD} literacy_db < upgrade_v1.2.0.sql
    
    if [ $? -eq 0 ]; then
        print_success "数据库升级成功！"
    else
        print_error "数据库升级失败！"
        print_warning "可以使用备份文件 $BACKUP_FILE 恢复数据"
        exit 1
    fi
}

# 重启服务
restart_services() {
    print_header "3. 重启服务"
    
    print_info "正在重启后端服务..."
    docker compose restart backend
    
    if [ $? -eq 0 ]; then
        print_success "服务重启成功！"
    else
        print_warning "服务重启失败，请手动重启"
    fi
    
    print_info "等待服务启动..."
    sleep 3
}

# 验证升级
verify_upgrade() {
    print_header "4. 验证升级"
    
    print_info "检查新增的表..."
    docker compose exec -T mysql mysql -uroot -p${DB_PASSWORD} literacy_db -e "
        SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'literacy_db' 
        AND TABLE_NAME IN ('reward_items', 'star_redemptions')
        ORDER BY TABLE_NAME;
    " 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "新表创建成功"
    fi
    
    print_info "检查数据库版本..."
    docker compose exec -T mysql mysql -uroot -p${DB_PASSWORD} literacy_db -e "
        SELECT version, description, applied_at 
        FROM db_version 
        WHERE version = 'v1.2.0';
    " 2>/dev/null
    
    print_info "等待服务完全启动..."
    sleep 2
    
    # 检查健康状态
    print_info "检查API健康状态..."
    HEALTH_CHECK=$(curl -s http://localhost:5000/api/health 2>/dev/null || echo "")
    
    if [ -n "$HEALTH_CHECK" ]; then
        print_success "API服务正常运行"
    else
        print_warning "无法连接到API服务，请检查日志"
    fi
}

# 显示新功能
show_new_features() {
    print_header "🎉 新功能介绍"
    
    echo ""
    print_feature "旅行足迹线路图 🗺️"
    echo "    - 三个小人代表一家三口（爸爸、妈妈、宝宝）"
    echo "    - 可视化展示所有旅行历史"
    echo "    - 访问：生活记录 → 旅行足迹"
    echo ""
    
    print_feature "我的奖励（独立模块）🏆"
    echo "    - 成就徽章：查看学习成就"
    echo "    - 星星兑换：用星星兑换奖励"
    echo "    - 访问：我的奖励菜单"
    echo ""
    
    print_feature "星星兑换系统 🎁"
    echo "    - 添加自定义奖励商品"
    echo "    - 设置所需星星数量"
    echo "    - 星星够了就可以兑换"
    echo "    - 默认商品：游乐园、玩具、大餐等"
    echo ""
}

# 显示完成信息
show_completion() {
    print_header "升级完成！"
    
    print_success "数据库已成功升级到 v1.2.0"
    echo ""
    
    print_info "📊 升级统计："
    echo "  ✅ 新增表：2个（reward_items, star_redemptions）"
    echo "  ✅ 新增功能：3个"
    echo "  ✅ 默认商品：6个"
    echo ""
    
    print_info "🌐 访问应用："
    echo "  http://localhost (或服务器IP)"
    echo ""
    
    print_info "📱 新菜单位置："
    echo "  🗺️  生活记录 → 旅行足迹"
    echo "  🏆 我的奖励 → 成就徽章"
    echo "  🎁 我的奖励 → 星星兑换"
    echo ""
    
    print_info "📝 查看日志："
    echo "  docker compose logs -f backend"
    echo ""
    
    print_warning "💾 备份文件已保存："
    echo "  $BACKUP_FILE"
    print_info "建议保留备份文件，以备不时之需"
    echo ""
    
    print_success "🎊 升级成功！祝使用愉快！"
    echo ""
}

# 错误处理
handle_error() {
    print_error "升级过程中发生错误！"
    print_warning "请查看错误信息，并检查："
    echo "  1. Docker 容器是否正常运行: docker compose ps"
    echo "  2. 查看日志: docker compose logs"
    echo "  3. 数据库密码是否正确: $DB_PASSWORD"
    echo "  4. 如需恢复，使用备份: docker compose exec -T mysql mysql -uroot -p${DB_PASSWORD} literacy_db < $BACKUP_FILE"
    exit 1
}

# 主函数
main() {
    print_header "🚀 升级到 v1.2.0"
    
    echo ""
    print_info "本次升级将添加以下功能："
    print_feature "旅行足迹线路图（三个小人）"
    print_feature "星星兑换系统"
    print_feature "奖励商品管理"
    print_feature "我的奖励独立模块"
    echo ""
    
    print_warning "升级步骤："
    echo "  1️⃣  备份当前数据库"
    echo "  2️⃣  执行增量更新脚本"
    echo "  3️⃣  重启后端服务"
    echo "  4️⃣  验证升级结果"
    echo ""
    
    read -p "确认继续升级？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "升级已取消"
        exit 0
    fi
    
    echo ""
    
    # 设置错误处理
    trap handle_error ERR
    
    # 执行升级步骤
    check_directory
    check_docker
    backup_database
    upgrade_database
    restart_services
    verify_upgrade
    show_new_features
    show_completion
}

# 运行主函数
main

