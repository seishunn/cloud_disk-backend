const db = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const {validationResult} = require("express-validator");
const fileService = require("../services/fileService");


class AuthController {
    async registration(req, res) {
        try {
            const {email, password, login} = req.body;
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({message: "Incorrect request"});
            }

            const users = await db.promise().query(`SELECT * FROM user WHERE email="${email}"`);

            if (users[0].length) {
                return res.status(403).json({message: `User with email address ${email} already exist`})
            }

            const hashPassword = await bcrypt.hash(password, 8);
            await db.promise().query(`INSERT INTO user (email, password, login) VALUES ("${email}", "${hashPassword}", "${login}")`);

            const user = await db.promise().query(`SELECT * FROM user WHERE email="${email}"`);

            await fileService.createDir({user_id: user[0][0].id, path: ""})
            return res.status(200).json({message: "User was created"});

        } catch (err) {
            console.log(err);
            res.json({message: "Server error"})
        }
    }
    async login(req, res) {
        try {
            const {email, password} = req.body;
            const users = await db.promise().query(`SELECT * FROM user WHERE email="${email}"`);

            if (!users[0].length) {
                return res.status(404).json({message: "User is not found"});
            }

            const isPassValid = bcrypt.compareSync(password, users[0][0].password);

            if (!isPassValid) {
                return res.status(400).json({message: "Wrong password"});
            }

            const token = jwt.sign({id: users[0][0].id}, config.get("secretKey"), {expiresIn: "1h"}, {});
            return res.status(200).json({
                message: "Login successful",
                token,
                user: {
                    id: users[0][0].id,
                    email: users[0][0].email,
                    login: users[0][0].login,
                    avatar: users[0][0].avatar,
                    diskSpace: users[0][0].diskSpace,
                    usedSpace: users[0][0].usedSpace,
                }
            });


        } catch (err) {
            console.log(err);
            res.send({message: "Server error"});
        }
    }
    async auth(req, res) {
        try {
            const {id} = req.user;
            const user = await db.promise().query(`SELECT * FROM user WHERE id=${id}`);
            const token = jwt.sign({id: id}, config.get("secretKey"), {expiresIn: "1h"});

            res.status(200).json({
                token,
                user: {
                    id,
                    email: user[0][0].email,
                    avatar: user[0][0].avatar,
                    login: user[0][0].login,
                    diskSpace: user[0][0].diskSpace,
                    usedSpace: user[0][0].usedSpace,
                }
            })
        } catch (err) {
            console.log(err);
            res.send({message: "Server error"});
        }
    }
}

module.exports = new AuthController();