const Router = require("express");
const {check} = require("express-validator");
const controller = require("../controllers/authController");
const authMiddleware = require("../middleware/auth.middleware");
const router = new Router();

router.post("/registration",
    [
        check("email", "Incorrect email").isEmail(),
        check("password", "Password must be longer than 3 and shorter than 12").isLength({min: 3, max: 12}),
        check("login", "Login must be longer than 3 and shorter than 20 ").isLength({min: 3, max: 20})
    ], controller.registration);
router.post("/login", controller.login);
router.get("/auth", authMiddleware, controller.auth);

module.exports = router;