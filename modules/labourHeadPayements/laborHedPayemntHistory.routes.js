const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { addPaymentHistory, getPaymentHistory } = require("./labourHeadPaymentHistory.controller");
const { addPaymentHistoryValidation } = require("./labourHeadPaymentHistory.validation");

router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post("/",addPaymentHistoryValidation , validate , addPaymentHistory);
router.get("/:headId", getPaymentHistory);


module.exports = router;
