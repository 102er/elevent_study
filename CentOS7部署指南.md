# 🐧 CentOS 7 部署指南

## ⚠️ 重要说明

CentOS 7 的 glibc 版本是 2.17，**无法直接安装 Node.js 18+**（需要 glibc 2.28+）。

本指南使用 **Docker 容器**来处理所有 Node.js 相关工作，无需在系统上安装 Node.js。

---

## 🚀 一键部署（推荐）

### 使用专用部署脚本

```bash
# 1. 进入项目目录
cd /opt/eleven_study

# 2. 运行 CentOS 7 专用部署脚本
./deploy-centos7.sh

# 3. 等待完成，访问应用
# http://服务器IP/
```

这个脚本会自动：
- ✅ 检查 Docker 环境
- ✅ 使用 Docker 安装前端依赖
- ✅ 配置环境变量
- ✅ 配置防火墙
- ✅ 启动所有服务

---

## 📦 手动部署步骤

### 前置要求

只需要安装 Docker，不需要 Node.js！

```bash
# 1. 安装 Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 2. 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 3. 添加当前用户到 docker 组（可选）
sudo usermod -aG docker $USER
newgrp docker

# 4. 验证安装
docker --version
docker compose version
```

### 部署应用

```bash
# 1. 进入项目目录
cd /opt/eleven_study

# 2. 使用 Docker 安装前端依赖（关键步骤）
docker run --rm -v $(pwd)/frontend:/app -w /app node:18-alpine npm install

# 3. 配置环境变量
cat > .env << 'EOF'
MYSQL_ROOT_PASSWORD=your_secure_password
VITE_API_URL=/api
EOF

# 4. 配置防火墙
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload

# 5. 启动服务
docker compose up -d

# 6. 查看状态
docker compose ps
docker compose logs -f
```

---

## 🔧 修改后的脚本说明

### init-setup.sh（已更新）

现在支持两种安装方式：
1. 如果检测到 npm → 使用本地 npm
2. 如果没有 npm → 自动使用 Docker 容器

```bash
./init-setup.sh
# 会自动检测并使用最佳方式
```

### start.sh（已更新）

增加了 Docker 支持：
1. 检查前端依赖
2. 如果缺失且没有 npm → 提示使用 Docker 安装
3. 提供正确的安装命令

```bash
./start.sh
# 会提示你选择安装方式
```

### deploy-centos7.sh（新增）

专为 CentOS 7 设计的一键部署脚本：
- ✅ 完全不依赖本地 Node.js
- ✅ 所有工作在 Docker 容器内完成
- ✅ 自动配置防火墙
- ✅ 提供详细的状态检查

---

## 💡 关键命令解释

### 使用 Docker 安装前端依赖

```bash
docker run --rm -v $(pwd)/frontend:/app -w /app node:18-alpine npm install
```

**解释：**
- `docker run` - 运行 Docker 容器
- `--rm` - 用完自动删除容器
- `-v $(pwd)/frontend:/app` - 挂载前端目录到容器
- `-w /app` - 设置工作目录
- `node:18-alpine` - 使用 Node.js 18 镜像
- `npm install` - 在容器内安装依赖

**结果：**
- 在 `frontend/node_modules` 生成依赖
- 在 `frontend/package-lock.json` 生成锁定文件

---

## 🎯 三种部署方式对比

| 方式 | 命令 | 优点 | 适用场景 |
|------|------|------|---------|
| **自动脚本** | `./deploy-centos7.sh` | 最简单，一键完成 | 首次部署 |
| **通用脚本** | `./init-setup.sh` | 自动检测环境 | 有/无 Node.js |
| **手动部署** | 见上文 | 完全控制 | 理解原理 |

---

## 📋 验证部署

```bash
# 1. 检查容器状态
docker compose ps
# 应该看到 3 个容器都是 Up 状态

# 2. 测试后端
curl http://localhost:5000/api/health
# 应该返回 JSON 状态信息

# 3. 测试前端
curl http://localhost/
# 应该返回 HTML 内容

# 4. 获取服务器 IP
curl ifconfig.me

# 5. 浏览器访问
# http://服务器IP/
```

---

## 🔍 故障排查

### 问题1：Docker 命令权限错误

```bash
# 解决方案：添加 sudo 或加入 docker 组
sudo usermod -aG docker $USER
newgrp docker
```

### 问题2：npm install 在容器内失败

```bash
# 使用国内镜像
docker run --rm -v $(pwd)/frontend:/app -w /app node:18-alpine sh -c "npm config set registry https://registry.npmmirror.com && npm install"
```

### 问题3：无法访问 80 端口

```bash
# 检查防火墙
sudo firewall-cmd --list-ports

# 开放端口
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --reload

# 检查 SELinux
sudo setenforce 0
```

### 问题4：容器无法启动

```bash
# 查看详细日志
docker compose logs

# 重新构建
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 🎈 常用管理命令

```bash
# 查看所有容器状态
docker compose ps

# 查看日志
docker compose logs -f
docker compose logs backend

# 重启服务
docker compose restart

# 停止服务
docker compose stop

# 启动服务
docker compose start

# 更新应用
git pull
docker run --rm -v $(pwd)/frontend:/app -w /app node:18-alpine npm install
docker compose up -d --build

# 数据库备份
docker compose exec mysql mysqldump -uroot -p${MYSQL_ROOT_PASSWORD} literacy_db > backup.sql
```

---

## 💾 数据持久化

数据存储在 Docker 数据卷中：

```bash
# 查看数据卷
docker volume ls | grep literacy

# 备份数据卷
docker run --rm -v eleven_study_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz /data

# 恢复数据卷
docker run --rm -v eleven_study_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql_backup.tar.gz -C /
```

---

## 🆙 系统升级建议

如果条件允许，建议升级到：
- **Rocky Linux 8** - CentOS 7 的最佳替代品
- **AlmaLinux 8** - 另一个优秀的 RHEL 兼容版本
- **CentOS Stream 8/9** - CentOS 的滚动版本

这些系统都支持更高版本的 glibc，可以直接安装 Node.js 18+。

---

## 📚 相关文档

- **README.md** - 项目介绍
- **QUICKSTART.md** - 快速开始
- **DEPLOYMENT.md** - 详细部署文档
- **脚本使用说明.md** - 脚本对比

---

## ✅ 总结

**CentOS 7 部署核心原则：**
1. ❌ 不在系统上安装 Node.js
2. ✅ 使用 Docker 容器处理所有 Node.js 工作
3. ✅ 简单、可靠、无依赖冲突

**推荐命令：**
```bash
./deploy-centos7.sh  # 一键部署！
```

部署成功后访问 `http://服务器IP/` 即可使用！🎉

