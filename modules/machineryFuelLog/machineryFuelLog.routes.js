const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");
const { addMachineryFuelLogValidation } = require("./machineryFuelLog.validations");
const { addMachineryFuelLog, getAllMachineryFuelLogs, deleteMachineFuelLog } = require("./machineryFuelLog.controller");
router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post(
    "/add", 
    upload.single("billPhoto"),
    addMachineryFuelLogValidation, 
    validate, 
    addMachineryFuelLog,
);
router.get("/", getAllMachineryFuelLogs);

router.delete(
  "/delete/:id",
  deleteMachineFuelLog
);

module.exports = router;