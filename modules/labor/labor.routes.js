const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { addLaborSummary, getAllLaborSummaries, getLaborById, getLabors } = require("./labor.controller");
const { laborValidation } = require("./labor.validation");

// router.use(authenticate(["ADMIN"]));
router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post("/", laborValidation, validate, addLaborSummary);
router.get("/", getAllLaborSummaries);

router.get("/project", getLabors);

router.get("/:id", getLaborById);

module.exports = router;
