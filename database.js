const mysql = require("mysql2");

module.exports = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "cloud_disk"
})