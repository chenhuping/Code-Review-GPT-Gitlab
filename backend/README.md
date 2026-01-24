# Code Review GPT - Django Backend

基于 Django + SQLite 的 GitLab 代码审查后端服务

## 项目架构

### 技术栈
- **框架**: Django 4.2.9 + Django REST Framework
- **数据库**: SQLite (Django 默认 ORM) + Redis 缓存
- **LLM集成**: UnionLLM (支持多种大模型)
- **生产服务器**: Gunicorn + Gevent

### 项目结构
```
backend/
├── core/                   # Django 核心配置
│   ├── settings.py        # 项目设置
│   ├── urls.py            # 路由配置
│   ├── wsgi.py            # WSGI 配置
│   └── exceptions.py      # 异常处理
├── apps/                   # Django 应用
│   ├── webhook/           # Webhook 处理
│   │   ├── models.py      # 数据模型
│   │   ├── views.py       # 视图
│   │   ├── serializers.py # 序列化器
│   │   └── urls.py        # 路由
│   ├── review/            # 代码审查逻辑
│   │   ├── services.py    # 业务服务
│   │   └── views.py       # 视图
│   ├── llm/               # LLM 集成
│   │   └── services.py    # LLM 服务
│   └── response/          # 通知响应
│       └── services.py    # 通知服务
├── utils/                 # 工具函数
│   └── gitlab_parser.py   # GitLab 解析工具
├── manage.py              # Django 管理脚本
├── requirements.txt       # 依赖列表（已废弃，使用 pyproject.toml）
├── pyproject.toml         # 项目配置和依赖管理（uv）
└── .python-version        # Python 版本指定
```

> 后端 Docker 镜像配置位于仓库根目录的 `docker/backend/Dockerfile`，可按需扩展系统依赖。

## 环境要求

- Python 3.11+
- Redis (用于缓存和会话存储)
- [uv](https://github.com/astral-sh/uv) - 现代 Python 包管理工具

## 快速开始

### 1. 安装 uv

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# 或使用 pip
pip install uv
```

### 2. 安装依赖

```bash
cd backend

# 使用 uv 同步依赖（推荐，会自动创建虚拟环境）
uv sync

# 或手动安装依赖
uv pip install -r pyproject.toml

# 或者使用传统 pip（不推荐）
pip install -r requirements.txt
```

> **注意**：uv 会根据 `.python-version` 文件自动使用 Python 3.11，即使系统有多个 Python 版本也不会冲突。

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置必要的环境变量
# 注意：GitLab 配置现在通过后台管理页面维护
```

### 4. 初始化数据库

```bash
# 运行数据库迁移（使用 uv run 确保使用正确的 Python 版本）
uv run --no-project python manage.py migrate

# 创建超级用户（可选）
uv run --no-project python manage.py createsuperuser
```

### 5. 启动开发服务器

```bash
# 开发模式启动（推荐，自动使用正确的 Python 版本和虚拟环境）
uv run --no-project python manage.py runserver 0.0.0.0:8000

# 或者先激活虚拟环境再启动
source .venv/bin/activate  # Linux/macOS
# 或 .venv\Scripts\activate  # Windows
python manage.py runserver 0.0.0.0:8000

# 访问管理后台
# http://localhost:8000/admin/
```

> **为什么使用 `uv run --no-project`？**
> - 自动使用 `.python-version` 指定的 Python 3.11
> - 自动管理虚拟环境，避免多个项目的依赖冲突
> - 无需手动激活虚拟环境
> - `--no-project` 表示不尝试构建项目本身，只管理依赖

## 生产部署

### 使用 Gunicorn

```bash
# 直接启动
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4 --worker-class gevent

# 或使用环境变量控制 worker 数量
GUNICORN_WORKERS=8 gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS} --worker-class gevent
```

### 使用 Docker

```bash
# 构建并启动（包含后端、前端、Redis）
docker compose up -d

# 仅重新构建后端
docker compose build backend

# 查看日志
docker compose logs -f backend
```

## 依赖管理

项目使用 **uv** 进行包管理，配置文件为 `pyproject.toml`。

### 添加新依赖

```bash
# 添加依赖到 pyproject.toml 的 dependencies 列表
# 然后重新安装
uv pip install -r pyproject.toml
```

### 更新依赖

```bash
# 更新所有依赖
uv pip install --upgrade -r pyproject.toml

# 更新特定包
uv pip install --upgrade <package-name>
```

### 查看已安装的包

```bash
uv pip list
```

### 镜像源配置

项目已配置阿里云 PyPI 镜像源（在 `pyproject.toml` 中），安装速度更快。如需修改：

```toml
[tool.uv]
index-url = "https://mirrors.aliyun.com/pypi/simple/"
```

## 开发说明
