#!/bin/bash
set -e

echo "=== Влюбви Deploy ==="

# 1. Сборка фронтенда
cd frontend
npm ci
npm run build
rsync -av dist/ /var/www/vlubvi/

# 2. Запуск prod контейнеров
cd ..
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Миграции БД (после старта бэкенда)
sleep 5
docker-compose -f docker-compose.prod.yml exec backend1 alembic upgrade head

# 4. Создать pgvector индексы (ПОСЛЕ загрузки данных)
# Выполнять только при первом деплое или после bulk insert:
# docker-compose exec backend1 python -c "
#   from app.database import engine
#   import asyncio
#   async def create_idx():
#       async with engine.begin() as conn:
#           await conn.execute(text('CREATE INDEX CONCURRENTLY IF NOT EXISTS
#             idx_psych_embedding ON psychological_profiles
#             USING ivfflat (embedding vector_cosine_ops) WITH (lists=100)'))
#   asyncio.run(create_idx())"

echo "=== Deploy завершён ==="
docker-compose -f docker-compose.prod.yml ps
