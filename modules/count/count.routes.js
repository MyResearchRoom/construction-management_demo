const express = require("express");
const { getCount, getTendorCount, getProjectCount, getExpenseCount, getMaterialCount, getFuelAndVehicalCount, getMachineryandFuelCount } = require("./count.controller");
const router = express.Router();

router.get("/", getCount);
router.get("/tender-counts", getTendorCount);
router.get("/project-counts", getProjectCount);
router.get("/expense-counts", getExpenseCount);
router.get("/material-counts", getMaterialCount);
router.get("/fuel-vehical-counts", getFuelAndVehicalCount);
router.get("/machinery-counts", getMachineryandFuelCount);
module.exports = router;