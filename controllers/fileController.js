const db = require("../database");
const config = require("config");
const fs = require("fs");
const path = require("path");
const fileService = require("../services/fileService");
const Uuid = require("uuid");

class FileController {
    async createDir(req, res) {
        try {
            const {id} = req.user;
            const {fileName, fileType = "dir", parent_id = null} = req.body;
            const parentFile = await db.promise().query(`SELECT * FROM file WHERE id=${parent_id}`);
            let filePath = "";

            if (!parentFile[0].length) {
                filePath = fileName;
                await fileService.createDir({user_id: id, path: filePath});
            } else {
                filePath = `${parentFile[0][0].path}/${fileName}`;
                await fileService.createDir({user_id: id, path: filePath});
            }

            await db.promise().query(`INSERT INTO file (fileName, fileType, parent_id, user_id, path) VALUES ("${fileName}", "${fileType}", ${parent_id}, ${id}, "${filePath}")`);
            let file;

            if (parent_id === null || parent_id === "null") {
                file = await db.promise().query(`SELECT * FROM file WHERE parent_id is NULL AND fileName="${fileName}"`);
            } else {
                file = await db.promise().query(`SELECT * FROM file WHERE parent_id=${parent_id} AND fileName="${fileName}"`);
            }

            return res.status(200).json({file: file[0][0]});
        } catch (err) {
            console.log(err);
            return res.status(400).json({message: err});
        }
    }

    async getFiles(req, res) {
        try {
            const {parent_id = null, sort} = req.query;
            const {id} = req.user;

            let files;
            let sortFields = ["fileName", "fileType", "date"];

            if (sortFields.find(field => field === sort)) {
                if (parent_id === null || parent_id === "null") {
                    files = await db.promise().query(`SELECT * FROM file WHERE user_id=${id} AND parent_id is NULL ORDER BY ${sort}`);
                } else {
                    files = await db.promise().query(`SELECT * FROM file WHERE user_id=${id} AND parent_id=${parent_id} ORDER BY ${sort}`);
                }
            } else {
                if (parent_id === null || parent_id === "null") {
                    files = await db.promise().query(`SELECT * FROM file WHERE user_id=${id} AND parent_id is NULL`);
                } else {
                    files = await db.promise().query(`SELECT * FROM file WHERE user_id=${id} AND parent_id=${parent_id}`);
                }
            }


            res.status(200).json({files: files[0]});
        } catch (err) {
            console.log(err);
            return res.status(400).json({message: err});
        }
    }

    async uploadFile(req, res) {
        try {
            const file = req.files.file;
            const {parent_id = null} = req.body;
            const {id} = req.user;

            const parentFile = await db.promise().query(`SELECT * FROM file WHERE user_id=${id} AND id=${parent_id}`);
            const user = await db.promise().query(`SELECT * FROM user WHERE id=${id}`);
            let usedSpace = user[0][0].usedSpace;
            let path;
            let globalPath;

            if (usedSpace + file.size > user[0][0].diskSpace) {
                return res.status(400).json({message: "There is no space"})
            }

            if (parentFile[0].length) {
                globalPath = `${config.get("filePath")}/${id}/${parentFile[0][0].path}/${file.name}`;
                path = `${parentFile[0][0].path}/${file.name}`;
            } else {
                globalPath = `${config.get("filePath")}/${id}/${file.name}`;
                path = `${file.name}`;
            }

            if (fs.existsSync(globalPath)) {
                return res.status(400).json({message: "File already exist"});
            }
            file.mv(globalPath);
            const fileType = file.name.split('.').pop();
            await db.promise().query(`INSERT INTO file (fileName, fileType, size, parent_id, user_id, path) VALUES ("${file.name}", "${fileType}", ${file.size}, ${parent_id}, ${id}, "${path}")`);
            res.status(200).json({
                file: {
                    fileName: file.name,
                    fileType,
                    parent_id,
                    size: file.size,
                    date: Date.now(),
                    path
                }
            });

        } catch (err) {
            console.log(err);
            return res.status(400).json({message: "Upload error"});
        }
    }

    async setUsedSpace(req, res) {
        try {
            const {id} = req.user;
            const {totalSize} = req.query;
            const user = await db.promise().query(`SELECT * FROM user WHERE id = ${id}`);
            const usedSpace = user[0][0].usedSpace + totalSize;
            await db.promise().query(`UPDATE user SET usedSpace = ${usedSpace} WHERE id=${id}`);

            return res.status(200);
        } catch (err) {
            console.log(err);
            return res.status(500).json({message: "Server error"});
        }
    }

    async downloadFile(req, res) {
        try {
            const {file_id} = req.query;
            const {id} = req.user;
            const file = await db.promise().query(`SELECT * FROM file WHERE id=${file_id} AND user_id=${id}`);
            let filePath;

            filePath = fileService.getPath(file[0][0]);

            if (fs.existsSync(filePath)) {
                return res.download(filePath, file[0][0].fileName);
            }

            return res.status(400).json({message: "Download error"});
        } catch (err) {
            console.log(err);
            return res.status(400).json({message: "Download error"});
        }
    }

    async deleteFile(req, res) {
        try {
            const {file_id} = req.query;
            const {id} = req.user;
            const file = await db.promise().query(`SELECT * FROM file WHERE id=${file_id} AND user_id=${id}`);
            const user = await db.promise().query(`SELECT * FROM user WHERE id=${id}`);

            if (!file[0].length) {
                return res.status(400).json({message: "File not found"});
            }

            const usedSpace = user[0][0].usedSpace - file[0][0].size;

            fileService.deleteFile(file[0][0]);
            await db.promise().query(`DELETE FROM file WHERE id=${file_id} AND user_id=${id}`);
            await db.promise().query(`UPDATE user SET usedSpace = ${usedSpace} WHERE id=${id}`);
            return res.json({message: "File was deleted"});

        } catch (err) {
            console.log(err);
            return res.status(400).json({message: "Dir is not empty"});
        }
    }

    async searchFile(req, res) {
        try {
            const {searchQuery} = req.query;
            const {id} = req.user;
            const files = await db.promise().query(`SELECT * FROM file WHERE fileName LIKE "%${searchQuery}%" AND user_id=${id}`);

            return res.status(200).json({files: files[0]});
        } catch (err) {
            console.log(err);
            return res.status(400).json({message: "Search error"});
        }
    }

    async uploadAvatar(req, res) {
        try {
            const {file} = req.files;
            const {id} = req.user;
            const avatarName = Uuid.v4() + ".jpg";
            file.mv(path.join(config.get("staticPath"), avatarName));
            await db.promise().query(`UPDATE user SET avatar = "${avatarName}" WHERE id = ${id}`);
            const user = await db.promise().query(`SELECT * FROM user WHERE id = ${id}`);

            return res.status(200).json({
                user: {
                    id,
                    email: user[0][0].email,
                    login: user[0][0].login,
                    avatar: avatarName,
                    diskSpace: user[0][0].diskSpace,
                    usedSpace: user[0][0].usedSpace,
                }
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({message: "Upload avatar error"});
        }
    }

    async deleteAvatar(req, res) {
        try {
            const {id} = req.user;
            const user = await db.promise().query(`SELECT * FROM user WHERE id = ${id}`);
            fs.unlinkSync(path.join(config.get("staticPath"), user[0][0].avatar));
            await db.promise().query(`UPDATE user SET avatar = null WHERE id = ${id}`);
            return res.status(200).json({
                user: {
                    id,
                    email: user[0][0].email,
                    login: user[0][0].login,
                    avatar: null,
                    diskSpace: user[0][0].diskSpace,
                    usedSpace: user[0][0].usedSpace,
                }
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({message: "Delete avatar error"});
        }
    }
}

module.exports = new FileController();