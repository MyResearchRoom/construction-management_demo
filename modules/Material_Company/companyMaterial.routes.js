const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { saveMaterialData, getAllMaterialData,getAllMaterialsForDropdown } = require("./companyMaterial.controller");
// router.use(authenticate(["ADMIN"]));
router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post("/", saveMaterialData);
router.get("/", getAllMaterialData);

router.get("/materials", getAllMaterialsForDropdown);

module.exports = router;