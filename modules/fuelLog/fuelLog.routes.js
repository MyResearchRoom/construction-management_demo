const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { addFuelLog, getAllFuelLogs, deleteVehicleFuelLog, getVehicleFuelLogByVehicleId } = require("./fuelLog.controller");
const upload = require("../../middlewares/upload.middleware");
const { addFuelLogValidation } = require("./fuelLog.validation");

// router.use(authenticate(["ADMIN"]));
router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post(
    "/add", 
    upload.single("billPhoto"),
    addFuelLogValidation, 
    validate, 
    addFuelLog,
);
router.get("/", getAllFuelLogs);

router.get("/vehicle-fuelLog/:vehicleId", getVehicleFuelLogByVehicleId);

router.delete(
  "/delete/:id",
  deleteVehicleFuelLog
);

module.exports = router;
