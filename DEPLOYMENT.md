# 🚀 儿童识字乐园 - 部署文档

本文档详细说明如何在Linux服务器上使用Docker部署儿童识字乐园应用。

## 📋 前置要求

### 系统要求
- Linux服务器（推荐 Ubuntu 20.04 或 CentOS 8+）
- 至少 2GB RAM
- 至少 10GB 磁盘空间

### 软件要求
- Docker 20.10+
- Docker Compose 2.0+
- Git（用于克隆代码）

## 🔧 安装Docker和Docker Compose

### Ubuntu/Debian

```bash
# 更新包索引
sudo apt-get update

# 安装必要的包
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

### CentOS/RHEL

```bash
# 安装yum-utils
sudo yum install -y yum-utils

# 添加Docker仓库
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 安装Docker Engine
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker compose version
```

## 📦 部署步骤

### 1. 克隆项目代码

```bash
# 克隆仓库
git clone <your-repository-url>
cd eleven_study

# 或者上传代码到服务器
# scp -r ./eleven_study user@server:/path/to/deploy/
```

### 2. 配置环境变量

```bash
# 创建环境变量文件
cat > .env << EOF
# MySQL配置
MYSQL_ROOT_PASSWORD=your_secure_password_here

# API配置（可选，前端会自动使用/api路径）
VITE_API_URL=/api
EOF

# 设置安全权限
chmod 600 .env
```

### 3. 构建和启动服务

```bash
# 构建并启动所有服务
sudo docker compose up -d

# 查看服务状态
sudo docker compose ps

# 查看日志
sudo docker compose logs -f
```

### 4. 初始化数据库

数据库会在首次启动时自动初始化（通过init.sql脚本）。如果需要手动初始化：

```bash
# 进入后端容器
sudo docker compose exec backend python

# 在Python shell中
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
...
>>> exit()
```

### 5. 验证部署

```bash
# 检查所有容器是否运行
sudo docker compose ps

# 测试后端API
curl http://localhost:5000/api/health

# 测试前端
curl http://localhost/

# 在浏览器中访问
# http://your-server-ip/
```

## 🔍 服务说明

### 服务端口

| 服务 | 内部端口 | 外部端口 | 说明 |
|------|---------|---------|------|
| frontend | 80 | 80 | Nginx前端服务 |
| backend | 5000 | 5000 | Flask后端API |
| mysql | 3306 | 3306 | MySQL数据库 |

### 服务依赖

```
frontend → backend → mysql
```

- frontend通过nginx反向代理访问backend
- backend连接mysql数据库
- 所有服务在同一Docker网络中通信

## 🛠️ 常用运维命令

### 查看服务状态

```bash
# 查看所有容器状态
sudo docker compose ps

# 查看资源使用情况
sudo docker stats
```

### 查看日志

```bash
# 查看所有服务日志
sudo docker compose logs

# 查看特定服务日志
sudo docker compose logs frontend
sudo docker compose logs backend
sudo docker compose logs mysql

# 实时跟踪日志
sudo docker compose logs -f

# 查看最近100行日志
sudo docker compose logs --tail=100
```

### 重启服务

```bash
# 重启所有服务
sudo docker compose restart

# 重启特定服务
sudo docker compose restart backend
sudo docker compose restart frontend
```

### 停止和启动服务

```bash
# 停止所有服务
sudo docker compose stop

# 启动所有服务
sudo docker compose start

# 停止并删除容器（数据卷会保留）
sudo docker compose down

# 停止并删除所有内容（包括数据卷）
sudo docker compose down -v
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
sudo docker compose up -d --build

# 或者分步执行
sudo docker compose build
sudo docker compose up -d
```

## 💾 数据备份与恢复

### 备份数据库

```bash
# 方法1：使用mysqldump
sudo docker compose exec mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} literacy_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 方法2：备份数据卷
sudo docker compose stop mysql
sudo tar -czf mysql_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  /var/lib/docker/volumes/eleven_study_mysql_data
sudo docker compose start mysql
```

### 恢复数据库

```bash
# 从SQL文件恢复
sudo docker compose exec -T mysql mysql -uroot -p${MYSQL_ROOT_PASSWORD} literacy_db < backup.sql

# 从数据卷备份恢复
sudo docker compose stop mysql
sudo tar -xzf mysql_backup.tar.gz -C /
sudo docker compose start mysql
```

## 🔒 安全配置

### 1. 修改默认密码

```bash
# 修改.env文件中的MYSQL_ROOT_PASSWORD
nano .env

# 重启服务
sudo docker compose down
sudo docker compose up -d
```

### 2. 配置防火墙

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. 配置HTTPS

使用Let's Encrypt免费SSL证书：

```bash
# 安装certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

修改`frontend/nginx.conf`添加SSL配置：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # 其他配置...
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 监控和日志

### 设置日志轮转

创建`/etc/docker/daemon.json`：

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

重启Docker服务：

```bash
sudo systemctl restart docker
```

### 监控容器健康

```bash
# 查看健康检查状态
sudo docker compose ps

# 查看容器详细信息
sudo docker inspect literacy-backend
```

## 🐛 故障排查

### 问题1：容器无法启动

```bash
# 查看详细错误日志
sudo docker compose logs

# 检查端口占用
sudo netstat -tulpn | grep -E '80|3306|5000'

# 清理并重新启动
sudo docker compose down
sudo docker compose up -d
```

### 问题2：数据库连接失败

```bash
# 检查MySQL容器状态
sudo docker compose ps mysql

# 查看MySQL日志
sudo docker compose logs mysql

# 进入MySQL容器检查
sudo docker compose exec mysql mysql -uroot -p
```

### 问题3：前端无法访问后端API

```bash
# 检查nginx配置
sudo docker compose exec frontend nginx -t

# 检查后端健康状态
curl http://localhost:5000/api/health

# 重启前端服务
sudo docker compose restart frontend
```

### 问题4：磁盘空间不足

```bash
# 清理未使用的Docker资源
sudo docker system prune -a

# 清理未使用的数据卷
sudo docker volume prune

# 查看磁盘使用情况
df -h
du -sh /var/lib/docker/*
```

## 🔄 更新和维护

### 定期维护任务

1. **每周**：
   - 备份数据库
   - 检查日志文件大小
   - 检查磁盘空间

2. **每月**：
   - 更新系统包：`sudo apt-get update && sudo apt-get upgrade`
   - 清理Docker资源：`sudo docker system prune`
   - 检查安全更新

3. **按需**：
   - 更新应用代码
   - 更新Docker镜像
   - 优化数据库

### 自动化脚本

创建维护脚本`/usr/local/bin/literacy-backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/backup/literacy"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
docker compose -f /path/to/eleven_study/docker-compose.yml \
  exec -T mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} literacy_db \
  > $BACKUP_DIR/db_backup_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/db_backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

添加到crontab：

```bash
# 每天凌晨2点执行备份
0 2 * * * /usr/local/bin/literacy-backup.sh >> /var/log/literacy-backup.log 2>&1
```

## 📞 技术支持

如遇到问题，请检查：
1. Docker和Docker Compose是否正确安装
2. 所有服务是否正常运行
3. 日志文件中的错误信息
4. 防火墙和网络配置

## 📝 附录

### Docker Compose配置说明

主要配置项：
- `mysql_data`: 数据持久化卷
- `literacy-network`: 服务间通信网络
- healthcheck: 服务健康检查配置

### 性能优化建议

1. **MySQL优化**：
   - 增加innodb_buffer_pool_size
   - 启用查询缓存
   - 定期优化表

2. **Nginx优化**：
   - 启用gzip压缩
   - 配置缓存策略
   - 优化worker进程数

3. **Docker优化**：
   - 限制容器资源使用
   - 使用overlay2存储驱动
   - 配置日志轮转

---

部署成功后，请访问 `http://your-server-ip/` 开始使用儿童识字乐园！🌈

