FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

# 安装系统依赖，可按需增删
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \
       git \
       curl \
    && rm -rf /var/lib/apt/lists/*

# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# 为 claude 可执行文件预留路径并安装 Claude CLI
ENV PATH="/root/.local/bin:${PATH}"
RUN curl -fsSL https://claude.ai/install.sh | bash

# 复制依赖并安装 Python 包
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=core.settings

COPY backend/pyproject.toml /app/
RUN uv pip install --system --no-cache -r pyproject.toml

# 复制项目代码（运行时仍会挂载宿主目录，确保本地修改可生效）
COPY backend/ /app

# 默认启动命令：先迁移数据库，再启动 Gunicorn
CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-4} --worker-class gevent"]
