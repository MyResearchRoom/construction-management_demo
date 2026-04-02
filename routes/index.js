const express = require("express");
const router = express.Router();

const userRoutes = require("../modules/user/user.routes");
const authRoutes = require("../modules/auth/auth.routes");
const tenderRoutes = require("../modules/tender/tender.routes");
const projectRoutes = require("../modules/project/project.routes");
const vehicleRoutes = require("../modules/vehicle/vehicle.routes");
const fuelLogRoutes = require("../modules/fuelLog/fuelLog.routes");
const laborRoutes = require("../modules/labor/labor.routes");
const materialRoutes = require("../modules/material/material.routes");
const dprRoutes = require("../modules/dpr/dpr.routes");
const companyRoutes = require("../modules/company/company.routes");
const permissionRoute = require("../modules/permission/permission.routes");
const userPermissionRoutes = require("../modules/permission/userPermission.routes");
const companyMaterial = require("../modules/Material_Company/companyMaterial.routes");
const companyMaterialTransaction = require("../modules/Material_Transaction/companyMaterialTransaction.routes");
const categoryRoutes = require("../modules/category/category.routes");
const expenseRoutes = require("../modules/expense/expense.routes");
const participantsRoutes = require("../modules/participants/participants.routes");
const counts = require("../modules/count/count.routes");
const VehicleMaintenance = require("../modules/vehicleMaintence/vehicleMaintenance.routes");
const MachineryRoutes = require("../modules/machinery/machinery.routes")
const MachineryFuelLogRoutes = require("../modules/machineryFuelLog/machineryFuelLog.routes")
const MachineryMaintenanceRoutes = require("../modules/machineryMaintenance/machineryMaintenance.routes")
const LaborAttendence = require("../modules/labourAttendence/labourAttendence.route")
const HeadPayemntHistory = require("../modules/labourHeadPayements/laborHedPayemntHistory.routes")

const PermanatStockRoute = require("../modules/permanentStock/permamantStock.route");

router.use("/api/test", (req, res) => {
  res.send("<h1>This is a test route.</h1>");
});
router.use("/api/users", userRoutes);
router.use("/api/auth", authRoutes);
router.use("/api/tenders", tenderRoutes);
router.use("/api/projects", projectRoutes);
router.use("/api/vehicles", vehicleRoutes);
router.use("/api/fuel-logs", fuelLogRoutes);
router.use("/api/labors", laborRoutes);
router.use("/api/materials", materialRoutes);
router.use("/api/dprs", dprRoutes);
router.use("/api/company", companyRoutes);
router.use("/api/permission", permissionRoute);
router.use("/api/user-permission", userPermissionRoutes);
router.use("/api/company-material", companyMaterial);
router.use("/api/company-materialTransaction", companyMaterialTransaction);
router.use("/api/category", categoryRoutes);
router.use("/api/expense", expenseRoutes);
router.use("/api/participants",participantsRoutes);
router.use("/api/count",counts);
router.use("/api/vehical-maintenance",VehicleMaintenance);
router.use("/api/machinery",MachineryRoutes);
router.use("/api/machinery-fuelLog",MachineryFuelLogRoutes);
router.use("/api/machinery-maintenance",MachineryMaintenanceRoutes);
router.use("/api/laborAttendence",LaborAttendence);
router.use("/api/headPayemnt",HeadPayemntHistory);
router.use("/api/permanentStock",PermanatStockRoute);

module.exports = router;
