const express = require("express");
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { addVehicleMaintenanceValidation } = require("./vehicleMaintenance.validation");
const { addVehicleMaintenance, getVehicleMaintenaceListByVehicleId, getAllVehicleMaintenance } = require("./vehicleMaintenance.controller");
const upload = require("../../middlewares/upload.middleware");
const router = express.Router();

router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post(
    "/add", 
    upload.single("invoice"),
    addVehicleMaintenanceValidation, 
    validate, 
    addVehicleMaintenance
);

router.get(
    "/:vehicleId",
    getVehicleMaintenaceListByVehicleId,
)

router.get(
    "/",
    getAllVehicleMaintenance,
)

module.exports = router;