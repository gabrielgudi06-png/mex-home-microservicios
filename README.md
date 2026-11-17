# MEX HOME — Plataforma E-Commerce con Microservicios

## Arquitectura de Microservicios
- **Frontend (`mexhome_web`)**: Nginx en puerto `8080`.
- **Backend (`mexhome_api`)**: API REST Node.js/Express en puerto `3000`.
- **Base de Datos (`mexhome_mysql`)**: MySQL 8.0 en puerto `3306`.
- **Gestor BD (`mexhome_pma`)**: phpMyAdmin en puerto `8081`.

## Requisitos Previos
- Docker Desktop instalado y en ejecución.
- Git instalado.

## Instalación y Ejecución
1. Clonar el repositorio: `git clone <URL_DEL_REPOSITORIO>` y entrar con `cd mex-home`
2. Crear el archivo de variables de entorno: `cp .env.example .env`
3. Levantar los contenedores: `docker compose up -d --build`
4. Abrir **Tienda** en `http://localhost:8080` y **phpMyAdmin** en `http://localhost:8081`.