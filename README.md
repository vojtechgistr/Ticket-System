# Overview
Allows registered users to send "tickets," which can be viewed by individuals with sufficient permissions. Implements an email service, a Content Delivery Network (CDN), and an interactive user interface.

# How to run
## React App
1. Open /react-app directory and install required node modules (Node.js v20.16.0):
```
npm install
```
2. To run this app, run following command:
```
npm run dev
```

## Required Services
1. Run Elasticsearch docker containers:
```
docker network create elastic
```
```
docker run --hostname=es --name=elasticsearch --user=1000:0 --env=xpack.license.self_generated.type=trial --env=ELASTIC_PASSWORD=mypassword --env=discovery.type=single-node --env=xpack.security.http.ssl.enabled=false --env=ELASTIC_CONTAINER=true --network=elastic -p 127.0.0.1:9200:9200 -d docker.elastic.co/elasticsearch/elasticsearch:8.15.1
```
2. Run RabbitMQ container:
```
docker run -d --hostname=rmq --name rabbit-server -p 8090:15672 -p 5672:5672 rabbitmq:3.13-management
```

## Server
1. Open Server/Server.sln project.
2. Rename `template.appsettings.json` to `appsettings.json` and fill the required fields.
3. Build & Run projects: `API`, `MessagingService`

# Useful links:
- [Nodejs - Download](https://nodejs.org/en/download/package-manager)
- [Azure Blob Storage - How to](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal)
- [RabbitMQ - Docker Setup](https://www.rabbitmq.com/docs/download)
- [Elasticsearch - Docker Setup](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)
- [Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/database/?&ef_id=_k_CjwKCAjwgfm3BhBeEiwAFfxrG_JyfJmGpH2h6z9Uo3GqYjVhWqW-UkeVpaGnEy0xLWOayHUJ8i3SdRoCMxQQAvD_BwE_k_&OCID=AIDcmm22fzqsrc_SEM__k_CjwKCAjwgfm3BhBeEiwAFfxrG_JyfJmGpH2h6z9Uo3GqYjVhWqW-UkeVpaGnEy0xLWOayHUJ8i3SdRoCMxQQAvD_BwE_k_&gad_source=1&gclid=CjwKCAjwgfm3BhBeEiwAFfxrG_JyfJmGpH2h6z9Uo3GqYjVhWqW-UkeVpaGnEy0xLWOayHUJ8i3SdRoCMxQQAvD_BwE)
- [SQL Server - Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
