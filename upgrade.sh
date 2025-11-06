#!/bin/bash

# ========================================
# 数据库升级脚本
# 版本: v1.1.0
# 日期: 2025-11-05
# ========================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# 检查是否在项目目录
check_directory() {
    if [ ! -f "docker-compose.yml" ]; then
        print_error "错误：请在项目根目录下运行此脚本"
        exit 1
    fi
}

# 备份数据库
backup_database() {
    print_header "1. 备份数据库"
    
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    
    print_info "正在备份数据库到: $BACKUP_FILE"
    
    docker compose exec -T mysql mysqldump -uroot -pliteracy2024 literacy_db > "$BACKUP_FILE" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        BACKUP_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
        print_success "数据库备份成功！文件大小: $BACKUP_SIZE"
    else
        print_error "数据库备份失败！"
        exit 1
    fi
}

# 执行升级脚本
upgrade_database() {
    print_header "2. 执行数据库升级"
    
    if [ ! -f "upgrade_v1.1.0.sql" ]; then
        print_error "升级脚本 upgrade_v1.1.0.sql 不存在！"
        exit 1
    fi
    
    print_info "正在执行升级脚本..."
    
    docker compose exec -T mysql mysql -uroot -pliteracy2024 literacy_db < upgrade_v1.1.0.sql
    
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
}

# 验证升级
verify_upgrade() {
    print_header "4. 验证升级"
    
    print_info "等待服务启动..."
    sleep 3
    
    # 检查健康状态
    print_info "检查API健康状态..."
    HEALTH_CHECK=$(curl -s http://localhost:5000/api/health 2>/dev/null || echo "")
    
    if [ -n "$HEALTH_CHECK" ]; then
        print_success "API服务正常运行"
    else
        print_warning "无法连接到API服务，请检查日志"
    fi
    
    # 显示表信息
    print_info "查询新增的表..."
    docker compose exec -T mysql mysql -uroot -pliteracy2024 literacy_db -e "
        SELECT TABLE_NAME, TABLE_ROWS 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'literacy_db' 
        AND TABLE_NAME IN ('travel_plans', 'travel_footprints', 'poems', 'daily_tasks', 'task_completions', 'db_version')
        ORDER BY TABLE_NAME;
    " 2>/dev/null
}

# 显示完成信息
show_completion() {
    print_header "升级完成！"
    
    print_success "数据库已成功升级到 v1.1.0"
    echo ""
    print_info "新增功能："
    echo "  ✈️  旅行计划 - 记录旅行，1元=1星"
    echo "  📖 古诗背诵 - 背诵古诗，1首=5星"
    echo "  ✅ 日常任务 - 自定义任务和奖励"
    echo ""
    print_info "访问应用："
    echo "  🌐 http://localhost (或服务器IP)"
    echo ""
    print_info "查看日志："
    echo "  docker compose logs -f"
    echo ""
    print_warning "备份文件已保存为: $BACKUP_FILE"
    print_info "建议保留备份文件，以备不时之需"
    echo ""
}

# 错误处理
handle_error() {
    print_error "升级过程中发生错误！"
    print_warning "请查看错误信息，并检查："
    echo "  1. Docker 容器是否正常运行: docker compose ps"
    echo "  2. 查看日志: docker compose logs"
    echo "  3. 如需恢复，使用备份: docker compose exec -T mysql mysql -uroot -pliteracy2024 literacy_db < $BACKUP_FILE"
    exit 1
}

# 主函数
main() {
    print_header "🚀 数据库升级工具 v1.1.0"
    
    print_info "本次升级将："
    echo "  1. 备份当前数据库"
    echo "  2. 执行增量更新脚本"
    echo "  3. 重启后端服务"
    echo "  4. 验证升级结果"
    echo ""
    
    read -p "确认继续？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "升级已取消"
        exit 0
    fi
    
    # 设置错误处理
    trap handle_error ERR
    
    # 执行升级步骤
    check_directory
    backup_database
    upgrade_database
    restart_services
    verify_upgrade
    show_completion
}

# 运行主函数
main

