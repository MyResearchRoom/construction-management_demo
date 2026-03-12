const { errorResponse, successResponse } = require("../../utils/response");
const {Project,Tender,Dpr,Expense,CompanyMaterial,MaterialTransaction,Vehicle,FuelLog,Machinery,MachineryFuelLog,MachineryMaintenance,Sequelize} =require("../../models");
const { Op } = require("sequelize");

exports.getCount = async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const totalTenders = await Tender.count();
    const totalDPRs = await Dpr.count();
    const totalPendingDPRs = await Dpr.count({where:{status:"pending"}});
    const totalApprovedDPRs = await Dpr.count({where:{status:"approved"}});
    const totalRejectedDPRs = await Dpr.count({where:{status:"rejected"}});
    const totalExpense=await Expense.count();
    const totalPendingExpense=await Expense.count({where:{status:"pending"}});
    const totalApprovedExpense=await Expense.count({where:{status:"approved"}});
    const totalRejectedExpense=await Expense.count({where:{status:"rejected"}})
    successResponse(
        res, 
        "Data retrieved successfully",
        {
            data: {
              totalProjects:totalProjects,
              totalTenders:totalTenders,
              totalDPRs:totalDPRs,
              totalPendingDPRs:totalPendingDPRs,
              totalApprovedDPRs:totalApprovedDPRs,
              totalRejectedDPRs:totalRejectedDPRs,
              totalExpense:totalExpense,
              totalPendingExpense:totalPendingExpense,
              totalApprovedExpense:totalApprovedExpense,
              totalRejectedExpense:totalRejectedExpense,
            }
        ,}
    );
  } catch (error) {
    errorResponse(res, "Failed to get counts", 500);
  }
};

exports.getTendorCount = async (req, res) => {
  try {
    const totalTenders = await Tender.count();
    const totalNewTenders = await Tender.count({where:{status:"new"}});
    const totalBoqPreparation = await Tender.count({where:{status:"boqPreparation"}});
    const totalRateAnalysis = await Tender.count({where:{status:"rateAnalysis"}});
    const totalSubmitted = await Tender.count({where:{status:"submitted"}});
    const totalWon = await Tender.count({where:{status:"won"}});
    const totalLost = await Tender.count({where:{status:"lost"}});
    const totalCancelled = await Tender.count({where:{status:"cancelled"}});
    successResponse(
        res, 
        "Data retrieved successfully",
        {
            data: {
              totalTenders:totalTenders,
              totalNewTenders:totalNewTenders,
              totalBoqPreparation:totalBoqPreparation,
              totalRateAnalysis:totalRateAnalysis,
              totalSubmitted:totalSubmitted,
              totalWon:totalWon,
              totalLost:totalLost,
              totalCancelled:totalCancelled,
            }
        ,}
    );
  } catch (error) {
    errorResponse(res, "Failed to get tender counts", 500);
  }
};

exports.getProjectCount = async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const totalActiveProject=await Expense.count({where:{status:"onTrack"}});
    const totalDelayedProject=await Expense.count({where:{status:"delayed"}})
    const totalBudget = await Project.sum("budget");
    successResponse(
        res, 
        "Data retrieved successfully",
        {
            data: {
              totalProjects:totalProjects,
              totalActiveProject:totalActiveProject,
              totalDelayedProject:totalDelayedProject,
              totalBudget:totalBudget,
            }
        ,}
    );
  } catch (error) {
    errorResponse(res, "Failed to get counts", 500);
  }
};

exports.getExpenseCount = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(1);
    endOfMonth.setHours(0, 0, 0, 0);

    const now = new Date();

    const startOfMonthForSpend = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonthForSpend = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const totalPendingExpense=await Expense.count({where:{status:"pending"}});
    const approvedTenderPerMonth = await Expense.count({
      where: {
        status: "approved",
        createdAt: {
          [Op.gte]: startOfMonth,
          [Op.lt]: endOfMonth,
        },
      },
    });
    const totalExpense = await Expense.sum("amount", {
      where: {
        createdAt: {
          [Op.gte]: startOfMonthForSpend,
          [Op.lt]: endOfMonthForSpend,
        },
      },
    });
    successResponse(
        res, 
        "Data retrieved successfully",
        {
            data: {
              totalPendingExpense:totalPendingExpense,
              approvedTenderPerMonth:approvedTenderPerMonth,
              totalExpense:totalExpense,
            }
        ,}
    );
  } catch (error) {
    console.log(error);
    
    errorResponse(res, "Failed to get tendor count", 500);
  }
};

exports.getMaterialCount = async (req, res) => {
  try {
    const totalMaterials = await CompanyMaterial.count();
    const lowStockAlert = await CompanyMaterial.count({
      where:{available_quantity: {[Op.lte]: 10,  },}
    });
    const totalTransaction = await MaterialTransaction.count();
    successResponse(
        res, 
        "Data retrieved successfully",
        {
            data: {
              totalMaterials:totalMaterials,
              lowStockAlert:lowStockAlert,
              totalTransaction:totalTransaction,
            }
        ,}
    );
  } catch (error) {
    errorResponse(res, "Failed to get material counts", 500);
  }
};

exports.getFuelAndVehicalCount = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const totalVehical = await Vehicle.count();
    // const avgEfficiency = await Vehicle.avg("targetEfficiency");
    const result = await Vehicle.findOne({
      attributes: [
        [Sequelize.fn("AVG", Sequelize.col("targetEfficiency")), "averageEfficiency"]
      ],
      raw: true,
    });

    const avgEfficiency = result.averageEfficiency
      ? parseFloat(result.averageEfficiency).toFixed(2)
      : "0.00";

    const totalLitersToday = await FuelLog.sum("litersFilled", {
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay], 
        },
      },
    });
    successResponse(
        res, 
        "Data retrieved successfully",
        {
            data: {
              totalVehical:totalVehical,
              avgEfficiency : avgEfficiency,
              totalLitersToday:totalLitersToday,
            }
        ,}
    );
  } catch (error) {
    console.log(error);
    
    errorResponse(res, "Failed to get material counts", 500);
  }
};

exports.getMachineryandFuelCount = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const totalMachinery = await Machinery.count();
    const result = await Machinery.findOne({
      attributes: [
        [Sequelize.fn("AVG", Sequelize.col("targetEfficiency")), "averageEfficiency"]
      ],
      raw: true,
    });

    const avgEfficiency = result.averageEfficiency
      ? parseFloat(result.averageEfficiency).toFixed(2)
      : "0.00";

    const totalLitersToday = await MachineryFuelLog.sum("litersFilled", {
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay], 
        },
      },
    });

    const totalMaintenance = await MachineryMaintenance.sum("cost");
    successResponse(
        res, 
        "Data retrieved successfully",
        {
            data: {
              totalMachinery:totalMachinery,
              avgEfficiency : avgEfficiency,
              totalLitersToday:totalLitersToday,
              totalMaintenance:totalMaintenance,
            }
        ,}
    );
  } catch (error) {
    console.log(error);
    
    errorResponse(res, "Failed to get material counts", 500);
  }
};