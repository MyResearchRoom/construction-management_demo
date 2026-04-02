const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { saveMaterialTransactionData, getAllCompanyMaterialTransaction, getAllCompanyMaterialTransactionByMaterialId } = require("./companyMaterialTransaction.controller");
const { addCompanyMaterialTransactionValidation } = require("./materialTransaction.validation");
const { validate } = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");
router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post(
    "/", 
    upload.single("image"),
    addCompanyMaterialTransactionValidation, 
    validate, 
    saveMaterialTransactionData,
);

router.get("/", getAllCompanyMaterialTransaction);

router.get("/companyMaterial-transaction/:materialId",getAllCompanyMaterialTransactionByMaterialId);

module.exports = router;