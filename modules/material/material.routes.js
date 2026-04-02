const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const upload = require("../../middlewares/upload.middleware");

const {
  addMaterialTransaction,
  getAllMaterialTransactions,
  getProjectMaterials,
  getAllProjectsWithMaterialsDetails,
  getTransactionsById,
  getMaterialsAndTransactionsByProjectId,
  getAllMaterialIssueTransactions,
  getProjectMaterialIssues,
  getConsumableMaterialsAndTransactionsByProjectIdAndMaterialId,
} = require("./material.controller");
const { addTransactionValidation } = require("./material.validation");
// router.use(authenticate(["ADMIN"]));
router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post(
  "/",
  upload.single("challan"),
  addTransactionValidation,
  validate,
  addMaterialTransaction
);

router.get("/", getProjectMaterials);

router.get("/transactions", getAllMaterialTransactions);

router.get("/issue-transactions", getAllMaterialIssueTransactions);

router.get("/getallprojectwise", getAllProjectsWithMaterialsDetails);

router.get(
  "/fetch-projectMaterialIssues/:projectId", 
  getProjectMaterialIssues
);
router.get(
  "/:id", 
  getTransactionsById
);

router.get(
  "/project-materials/:projectId", 
  getMaterialsAndTransactionsByProjectId
);

router.get(
  "/consumable/projects/:projectId/materials/:materialId",
  getConsumableMaterialsAndTransactionsByProjectIdAndMaterialId,
);

module.exports = router;
