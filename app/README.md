﻿# Задание: Геокодер

Преобразование адреса в точку на карте с использованием сервиса Яндекс. На странице имеется форма для ввода адреса и кнопка выполнения запроса. Результатом является карта со значком в точке, соответствующей введенному адресу.
Также выполнена история запросов, из которой можно выбрать строку, отредактировать и геокодировать еще раз.


## Стек технологий

- **Backend**:
  - ASP.NET Core 9.0

- **Фронтенд**:
  - JavaScript
  - Yandex Maps JS API
  - Bootstrap 5 (для UI компонентов)

- **База данных**:
  - Microsoft SQL Server 2022
  - Entity Framework Core (ORM)

## Требования

- Docker 20.10+
- Docker Compose 2.20+
- .NET 9.0 SDK (только для разработки)

## Установка и запуск

### Клонирование репозитория
```bash
git clone https://github.com/MaXIDoGG/Geocoder
cd GeoCoder
```

### Запуск
```bash
docker-compose up --build
```

Сервис будет доступен по адресу:
http://localhost:8000