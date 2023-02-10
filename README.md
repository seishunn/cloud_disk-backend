# Установка и настройка сервера `cloud_disk`
Данный проект нигде не хостится, поэтому, вам придется выполнить эти шаги из инструкции

### О проекте
Аналог облачного хранилища Google Drive. Сохраняйте свои файлы на своей базе данных и свободно ими пользуйтесь.   
При желании проект можно захостить.  

### Установка самого проекта
Установите на свое устройство этот проект и поместите его в папку "sever". В новую папку сервер добавьте две новой директории:
+ `files` - для хранения ваших файлов
+ `static` - для хранения аватаров пользователей

### Установка пакетов проекта
Проект разбит на две части:
+ Клиентская часть [cloud_disk-frontend](https://github.com/seishunn/cloud_disk-frontend)
+ Серверная часть  [cloud_disk-backend](https://github.com/seishunn/cloud_disk-backend)    
  При открытии проекта переидите в `server`, в терминале введите следующую команду
```js 
    npm i
```

### Настройка базы данных
На вашем устройстве должен быть установлен `MySQL`

[Как установить MySQL](https://dev.mysql.com/downloads/installer/)

Создание базы данных:
+ В терминале переидите к папке MySQL и найдите bin   
  `cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"`
+ Войдите в вашу учетную запись   
  `mysql -u root -p`
+ После ввода команды выше, потребуется ввести ваш пароль от учетной записи.    
  После успешной авторизации можете выполнить следующие команды
+ Вводите команды строка за строкой (не все сразу)
```
    CREATE DATABASE cloud_disk;
    USE cloud_disk;
    CREATE TABLE user(id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, avatar VARCHAR(500), login VARCHAR(255), diskSpace BIGINT DEFAULT (pow(1024,3) * 10), usedSpace BIGINT DEFAULT 0);
    CREATE TABLE file(id INT AUTO_INCREMENT PRIMARY KEY, fileName VARCHAR(255) NOT NULL, fileType VARCHAR(20) NOT NULL, accessLink VARCHAR(255), size BIGINT DEFAULT 0, path VARCHAR(255), parent_id INT DEFAULT NULL, FOREIGN KEY (parent_id) REFERENCES file(id), user_id INT, FOREIGN KEY (user_id) REFERENCES user(id), date DATETIME DEFAULT CURRENT_TIMESTAMP);
```
+ После всей настройки базы данных переидите в `server/database.js`. В этом файле измените поле `password` на ваш пароль от учетной записи MySQL. Если при создании базы данных вы изменили ее имя, то следует указать его в поле `database`.

### Последний шаг
Запустите сам сервер. Для этого откройте один терминал и в нем введите следующие команду
```js
    cd .\server
    npm run dev
```
После успешного запуска сервера, переидите в [cloud_disk-frontend](https://github.com/seishunn/cloud_disk-frontend) и выполните настройку приложения.
