const mysql = require("mysql2");

module.exports = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "SeishunBunnyGirl42",
    database: "cloud_disk2"
})