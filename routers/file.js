const Router = require("express");
const router = new Router();
const authMiddleware = require("../middleware/auth.middleware");
const controller = require("../controllers/fileController");

router.post("", authMiddleware, controller.createDir);
router.post("/upload", authMiddleware, controller.uploadFile);
router.post("/avatar", authMiddleware, controller.uploadAvatar);
router.get("", authMiddleware, controller.getFiles);
router.get("/download", authMiddleware, controller.downloadFile);
router.get("/search", authMiddleware, controller.searchFile);
router.get("/usedSpace", authMiddleware, controller.setUsedSpace);
router.delete("/", authMiddleware, controller.deleteFile);
router.delete("/avatar", authMiddleware, controller.deleteAvatar);

module.exports = router;