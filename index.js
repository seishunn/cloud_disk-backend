const express = require("express");
const config = require("config");
const fileUpload = require("express-fileupload");
// Import Middlewares
const corsMiddleware = require("./middleware/cors.middleware");
const authMiddleware = require("./middleware/auth.middleware");
// Routers
const authRouter = require("./routers/auth");
const fileRouter = require("./routers/file");

const app = express();
const PORT = config.get("serverPort");

// Middlewares
app.use(fileUpload({}));
app.use(express.json());
app.use(express.static(config.get("staticPath")));
app.use(corsMiddleware);
app.use("/api/auth", authRouter);
app.use("/api/file", authMiddleware, fileRouter);


const start = () => {
    try {
        app.listen(PORT, (err) => {
            err ? console.log(err) : console.log(`Server is running on Port ${PORT}`);
        })
    } catch (err) {
        console.log(err.message);
    }
}

start()