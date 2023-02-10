const fs = require("fs");
const path = require("path");
const config = require("config");
const exec = require("child_process").exec;

class FileService {
    createDir(file) {
        const filePath = this.getPath(file);

        return new Promise((resolve, reject) => {
            try {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath);
                    return resolve({message: "File was created"});
                } else {
                    return reject({message: "File already exist"})
                }
            } catch (err) {
                console.log(err);
                return reject({message: "File Error"});
            }
        })
    }
    deleteFile(file) {
        const path = this.getPath(file);

        if (file.fileType === "dir") {
            fs.rmdirSync(path);
        } else {
            fs.unlinkSync(path);
        }
    }
    getPath(file) {
        if (file.path === null || file.path === "null") {
            return path.join(config.get("filePath"), `${file.user_id}`);
        }

        return path.join(config.get("filePath"), `${file.user_id}`, file.path.split("/").join("\\"));
    }
}

module.exports = new FileService();