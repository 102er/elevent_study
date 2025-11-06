#!/bin/bash

# ========================================
# 应用前端更新脚本
# 用途：重启前端容器以应用代码更改
# ========================================

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}应用前端更新${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否在项目目录
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${YELLOW}错误：请在项目根目录下运行此脚本${NC}"
    exit 1
fi

echo -e "${BLUE}正在重新构建并重启前端容器...${NC}"

# 尝试新版 docker compose
if docker compose version &> /dev/null; then
    docker compose build frontend
    docker compose up -d frontend
    echo ""
    echo -e "${GREEN}✅ 前端已重新构建并启动！${NC}"
    echo ""
    echo -e "${YELLOW}⏳ 等待前端启动...${NC}"
    sleep 5
    echo ""
    echo -e "${YELLOW}📱 请在浏览器中强制刷新页面：${NC}"
    echo "   Windows/Linux: Ctrl + Shift + R"
    echo "   Mac: Cmd + Shift + R"
    echo ""
    echo -e "${BLUE}更新内容：${NC}"
    echo "   ✅ 旅行完成标记功能"
    echo "   ✅ 点击已完成旅行标题查看足迹"
    echo "   ✅ 移除旅行花费星星奖励"
    echo ""
elif docker-compose version &> /dev/null; then
    # 尝试旧版 docker-compose
    docker-compose build frontend
    docker-compose up -d frontend
    echo ""
    echo -e "${GREEN}✅ 前端已重新构建并启动！${NC}"
    echo ""
    echo -e "${YELLOW}⏳ 等待前端启动...${NC}"
    sleep 5
    echo ""
    echo -e "${YELLOW}📱 请在浏览器中强制刷新页面：${NC}"
    echo "   Windows/Linux: Ctrl + Shift + R"
    echo "   Mac: Cmd + Shift + R"
    echo ""
    echo -e "${BLUE}更新内容：${NC}"
    echo "   ✅ 旅行完成标记功能"
    echo "   ✅ 点击已完成旅行标题查看足迹"
    echo "   ✅ 移除旅行花费星星奖励"
    echo ""
else
    echo -e "${YELLOW}错误：未找到 docker compose 或 docker-compose 命令${NC}"
    exit 1
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}更新完成！${NC}"
echo -e "${BLUE}========================================${NC}"

