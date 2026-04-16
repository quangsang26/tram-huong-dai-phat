const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/account/me", verifyToken, accountController.getMyProfile);
router.put("/account/me", verifyToken, accountController.updateMyProfile);
router.put("/account/change-password", verifyToken, accountController.changeMyPassword);

module.exports = router;