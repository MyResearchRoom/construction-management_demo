const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { getLaborHeadData, getLaborAttendenceData, getAttedanceDataByHeadId, getLabourHeadById } = require("./labourAttendence.controller");

router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.get("/attendence", getLaborAttendenceData);

router.get("/attendence/:headId", getAttedanceDataByHeadId);

router.get("/head/:headId", getLabourHeadById);

router.get("/", getLaborHeadData);
module.exports = router;