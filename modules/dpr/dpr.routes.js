const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middlewares/auth.middleware");
const { validate } = require("../../middlewares/validate.middleware");
const { addDpr, getDprs, getDprById, getDprsByProjectId, changeStatusOfDPR, editDPRByDprId, getRemainingAmountByProjectId, deleteDailyExpenseDetailById, deleteSitePhotos } = require("./dpr.controller");
const upload = require("../../middlewares/upload.middleware");

// router.use(authenticate(["ADMIN"]));
router.use(authenticate(["ADMIN","FINANCE_MANAGER","PROJECT_MANAGER","SITE_MANAGER","TENDER_MANAGER","SUPERVISOR"]));

router.post("/", upload.any(), addDpr);

router.get("/", getDprs);

router.get("/:id", getDprById);

router.get("/get-remainingAmount/:projectId", getRemainingAmountByProjectId);

router.get("/dprs-projectwise/:projectId", getDprsByProjectId);

router.patch(
    "/changeStatus/:id",
    changeStatusOfDPR
)

router.patch(
    "/editDPR/:dprId",
    upload.any(),
    editDPRByDprId
)

router.delete(
  "/delete-sitePhoto/:id",
  deleteSitePhotos
);

router.delete(
  "/delete/:id",
  deleteDailyExpenseDetailById
);

module.exports = router;
