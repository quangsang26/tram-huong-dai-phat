const express = require("express");
const router = express.Router();
const momoController = require("../controllers/momo.controller");

router.post("/momo/create", momoController.createMomoPayment);
router.post("/momo/ipn", momoController.momoIpn);
router.post("/momo/confirm-return", momoController.confirmMomoReturn);

module.exports = router;