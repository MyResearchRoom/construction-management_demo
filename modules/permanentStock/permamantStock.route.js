const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { savePermanentStock, getAllPermanentStocks, getAllPermanentStockTransactions, addPermanentStockTransaction, editPermanentStock, getPermanentStockById, getTransactionsById, getProjectPermanentStockIssues, getPermanantMaterialsAndTransactionsByProjectIdAndStcokId } = require("./permanentStock.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { addTransactionValidation } = require("./permamantStock.validation");
const upload = require("../../middlewares/upload.middleware");
router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post(
    "/add-permanentStock", 
    savePermanentStock
);
router.get(
    "/fetch-permanentStock", 
    getAllPermanentStocks
);

router.get("/fetch-transactions", getAllPermanentStockTransactions);

router.post(
    "/add-transaction", 
    upload.single("challan"),
    addTransactionValidation,
    validate,
    addPermanentStockTransaction
);

router.patch(
    "/edit-permanentStock/:id", 
    editPermanentStock
);

router.get(
    "/:id",
    getPermanentStockById
)

router.get(
    "/transaction/:id",
    getTransactionsById
)

router.get(
  "/fetch-projectPermanentStockIssues/:projectId", 
  getProjectPermanentStockIssues
);

router.get(
  "/permanent/projects/:projectId/stock/:stockId",
  getPermanantMaterialsAndTransactionsByProjectIdAndStcokId,
);

module.exports = router;