const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { addMachine, getMachineById, getAllMachinary, editMachine, getMachineryWithMaintenanceDetails } = require("./machinery.controller");
const { addMachineValidation, editMachineValidation } = require("./machinery.validations");

router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post(
    "/add", 
    addMachineValidation, 
    validate, 
    addMachine
);

router.patch(
    "/edit/:id", 
    editMachineValidation, 
    validate, 
    editMachine
);

router.get("/", getAllMachinary);

router.get("/machinery-maintenance",getMachineryWithMaintenanceDetails)

router.get(
    "/:id", 
    getMachineById
); 
module.exports = router;