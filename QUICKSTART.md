# 🚀 快速开始指南

## 首次部署步骤

### 方法一：使用初始化脚本（推荐）

```bash
# 1. 进入项目目录
cd /Users/102er/Desktop/WORK/github.com/eleven_study

# 2. 运行初始化脚本
./init-setup.sh

# 3. 启动服务
docker compose up -d

# 4. 等待服务启动（约1-2分钟）
docker compose ps

# 5. 访问应用
# 浏览器打开: http://localhost
```

### 方法二：手动部署

#### 步骤1：安装前端依赖

```bash
cd frontend
npm install
cd ..
```

#### 步骤2：配置环境变量

创建`.env`文件：

```bash
cat > .env << EOF
MYSQL_ROOT_PASSWORD=your_secure_password
VITE_API_URL=/api
EOF
```

#### 步骤3：启动Docker服务

```bash
docker compose up -d
```

#### 步骤4：查看服务状态

```bash
# 查看所有容器状态
docker compose ps

# 查看日志
docker compose logs -f
```

## 常见问题

### Q1: npm ci 失败

**错误信息**: `npm ci` can only install with an existing package-lock.json

**解决方案**:
```bash
cd frontend
npm install
cd ..
docker compose build frontend
docker compose up -d
```

### Q2: Docker权限错误

**错误信息**: permission denied

**解决方案**:
```bash
# 添加当前用户到docker组
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker
```

### Q3: 端口被占用

**错误信息**: port is already allocated

**解决方案**:
```bash
# 检查端口占用
sudo lsof -i :80
sudo lsof -i :5000
sudo lsof -i :3306

# 停止占用端口的服务或修改docker-compose.yml中的端口
```

### Q4: MySQL启动失败

**错误信息**: Can't connect to MySQL server

**解决方案**:
```bash
# 查看MySQL日志
docker compose logs mysql

# 重启MySQL服务
docker compose restart mysql

# 如果持续失败，删除数据卷重新初始化
docker compose down -v
docker compose up -d
```

## 验证部署

### 1. 检查所有服务运行状态

```bash
docker compose ps
```

应该看到3个服务都是`Up`状态：
- literacy-mysql
- literacy-backend  
- literacy-frontend

### 2. 测试后端API

```bash
curl http://localhost:5000/api/health
```

应该返回：
```json
{"status":"healthy","timestamp":"2025-10-28T..."}
```

### 3. 测试前端

```bash
curl http://localhost/
```

应该返回HTML内容。

### 4. 浏览器访问

打开浏览器访问 `http://localhost`，应该看到儿童识字乐园的界面。

## 下一步

### 数据备份

```bash
# 备份数据库
docker compose exec mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} literacy_db > backup.sql
```

### 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build
```

### 停止服务

```bash
# 停止所有服务
docker compose stop

# 停止并删除容器（保留数据）
docker compose down

# 停止并删除所有内容（包括数据）
docker compose down -v
```

## 性能优化建议

### 1. 生产环境配置

修改`.env`文件：
```bash
MYSQL_ROOT_PASSWORD=strong_random_password_here
```

### 2. 限制资源使用

在`docker-compose.yml`中添加资源限制：
```yaml
services:
  mysql:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### 3. 启用日志轮转

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

## 获取帮助

- 详细部署文档: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 项目说明: [README.md](./README.md)
- 问题反馈: 提交Issue到项目仓库

---

祝您使用愉快！🎉

