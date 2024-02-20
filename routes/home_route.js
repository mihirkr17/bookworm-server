const express = require("express");
const { homeOverview } = require("../controllers/home_ctl");
const router = express.Router();


router.get("/", homeOverview);

module.exports = router;