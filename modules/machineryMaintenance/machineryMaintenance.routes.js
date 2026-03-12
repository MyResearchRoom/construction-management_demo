const express = require("express");
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");
const { addMachineMaintenanceValidation } = require("./machineryMaintenance.validations");
const { addMachineryMaintenance,  getMachineryMaintenaceListByMachineId, getAllMAchineryMaintenance } = require("./machineryMaintenance.controller");
const router = express.Router();

router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post(
    "/add", 
    upload.single("invoice"),
    addMachineMaintenanceValidation, 
    validate, 
    addMachineryMaintenance
);

router.get(
    "/:machineId",
    getMachineryMaintenaceListByMachineId,
)

router.get(
    "/",
    getAllMAchineryMaintenance,
)
module.exports = router;