# Parliament System

Система управления парламентом - веб-приложение для учёта депутатов и их активности.

## Технологии

- **Backend:** Python Django
- **Frontend:** React
- **Database:** PostgreSQL
- **CI/CD:** TeamCity
- **Containerization:** Docker

## Запуск проекта

### Development окружение:
```bash
docker-compose up -d
```

Frontend: http://localhost:3000
Backend API: http://localhost:8000

### Stage окружение:
```bash
cd ~/stage-deployment
docker-compose -f docker-compose.stage.yml up -d
```

Frontend: http://localhost:3001
Backend API: http://localhost:8001

## Разработка

Проект следует методологии GitFlow.

### Создание новой feature:
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
# ... делайте изменения ...
git add .
git commit -m "Add: описание изменений"
git push origin feature/your-feature-name
```

## Авторы

DevOps Team - Parliament System Project

## CI/CD Pipeline

Automated builds and deployments:
- **Build:** Triggered on push to dev/prod branches
- **Docker Images:** Built and pushed to DockerHub
- **Stage Deploy:** Automatic deployment to stage environment on dev branch

Build trigger: Вт 28 окт 2025 02:51:02 MSK
Test auto-build: Вт 28 окт 2025 10:39:24 MSK
GitFlow test: Вт 28 окт 2025 10:44:38 MSK
