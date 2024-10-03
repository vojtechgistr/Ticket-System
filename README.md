# Overview
Allows registered users to send "tickets," which can be viewed by individuals with sufficient permissions. Implements an email service, a Content Delivery Network (CDN), and an interactive user interface.

*[Here are some useful links, like downloads or docs.](#useful-links)*

# Default Credentials
- **Email:** owner@void.com
- **Password:** Owner-1234
  
# How to run
## React App
1. Open /react-app directory and install required node modules (Node.js v20.16.0):
```
npm install
```
2. To run this app use following command:
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

## Build Database
1. Open Package Manager.
2. Run `Update-Database` command.

## Setting-up email notifications
For email notifications to work, you have to change email and app password.
1. Go to `MessagingService/EmailSender.cs`
2. Modify SMTP client if needed.
```cs
  private readonly SmtpClient client = new("smtp.gmail.com", 587)
```
3. Change credentials on line 17 and 18.
```cs
    private const string Email = "myemail"; // change email
    private const string Password = "mypassword"; // change to your APP password
```
*If using Gmail SMTP, don't forget to use APP PASSWORD. [Here](https://support.google.com/mail/answer/185833?hl=en) is how to set it up!*

## Backend
1. Open Server/Server.sln project.
2. Rename `template.appsettings.json` to `appsettings.json` and fill the required fields.
3. Build & Run projects: `API`, `MessagingService`

# Useful links
- [Nodejs - Download](https://nodejs.org/en/download/package-manager)
- [.NET 6](https://dotnet.microsoft.com/en-us/download/dotnet/6.0)
- [Docker Desktop - Download](https://www.docker.com/products/docker-desktop/)
- [Azure Blob Storage - How to](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-create?tabs=azure-portal)
- [RabbitMQ - Docker Setup](https://www.rabbitmq.com/docs/download)
- [Elasticsearch - Docker Setup](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)
- [SQL Server - Download](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/sql-server-management-studio-ssms?view=sql-server-ver16)
