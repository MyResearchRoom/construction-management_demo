const {
  Dpr,
  DieselReport,
  LaborReport,
  LaborHead,
  Labor,
  LaborAttendence,
  MaterialOnSite,
  WorkDone,
  SitePhoto,
  DailyExpense,
  Project,
  User,
  MachineryMaintenance,
  VehicleMaintenance,
  MaterialTransaction,
  PermanentStockTransaction,
  sequelize,
  Participant,
  CompanyMaterial,
  ProjectMaterial,
  PermanentStock,
  Vehicle,
  MachineryFuelLog,FuelLog,DailyExpenseDetails,Expense,Category
} = require("../../models");
const { errorResponse, successResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");
const { Op, where } = require("sequelize");

const getCategoryName = async (id) => {
  const category = await Category.findOne({
    where: { id },
  });

  return category?.categoryName || "";
};


const generateExpenseId = async () => {
  const year = new Date().getFullYear();
  const count = await Expense.count();
  const next = (count + 1).toString().padStart(3, "0");
  return `EXP-${year}-${next}`;
};

exports.addDpr = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      projectId,
      nameOfSite,
      nameOfSupervisor,
      date,
      dateOfSubmission,
    } = req.body;

    console.log("frontend data",req.body);

    const workDone = JSON.parse(req.body.workDone || "[]");
    const materialOnSite = JSON.parse(req.body.materialOnSite || "[]");
    const dailyExpense = JSON.parse(req.body.dailyExpense || "[]");
    const dieselReport = JSON.parse(req.body.dieselReport || "[]");
    const laborReport = JSON.parse(req.body.laborReport || "[]");
    const maintenance = JSON.parse(req.body.maintenance || "[]") || [];
    console.log("dieselReport",dieselReport);
    

    // const photos = req.files.photos || [];
    const files = req.files || [];
    const photos = files.filter(file => file.fieldname === "photos");

    const materialChallans = files.filter(file =>
      file.fieldname.startsWith("materialChallan_")
    );
    console.log("materialChallans",materialChallans);

    const dieselBillPhotos = files.filter(file =>
      file.fieldname.startsWith("dieselBillPhoto_")
    );
    console.log("dieselBillPhotos",dieselBillPhotos);
    

    const maintenanceInvoices = files.filter(file =>
      file.fieldname.startsWith("maintenanceInvoice_")
    );

    console.log("req.user.id",req.user.id);
    
    const dpr = await Dpr.create(
      {
        projectId,
        nameOfSite,
        nameOfSupervisor,
        date,
        dateOfSubmission,
        submittedBy:req.user.id,
      },
      { transaction }
    );

    const workDoneData =
      workDone.length > 0
        ? workDone.map((item) => ({ dprId: dpr.id, ...item }))
        : [];

    const laborReportData =
      laborReport.length > 0
        ? laborReport?.map((item) => ({
            dprId: dpr.id,
            ...item,
          }))
        : [];
    //material on site
    const materialWithChallan = materialOnSite.map((item, index) => {
      const challanFile = materialChallans.find(
        (file) => file.fieldname === `materialChallan_${index}`
      );

      return {
        ...item,
        challan: challanFile
          ? challanFile.buffer
          : null,
        imageContentType : challanFile ? challanFile.mimetype : null,
      };
    });

    const consumableStock = materialWithChallan.filter(
      item => item.materialId && !item.stockId
    );

    const permanentStock = materialWithChallan.filter(
      item => !item.materialId && item.stockId
    );

    const consumableStockData = consumableStock.length > 0 ?
     consumableStock?.map((item)=>({
      ...item,
      dprId: dpr.id,
      projectMaterialId: item?.projectMaterialId,
      transactionType: item?.transactionType,
      quantity: item?.brass,
      vehicleId: item?.vehicleId,
      challanNumber:item?.challanNumber,
      challan: item?.challan,
      imageContentType:item?.imageContentType,
      note: item?.note,
     })) : [];

    const permanentStockData = permanentStock.length > 0 ?
     permanentStock?.map((item)=>({
      ...item,
      dprId: dpr.id,
      projectId: projectId,
      stockId: item?.stockId,
      transactionType: item?.transactionType,
      quantity: item?.brass,
      vehicleId: item?.vehicleId,
      challanNumber:item?.challanNumber,
      challan: item?.challan,
      imageContentType:item?.imageContentType,
      note: item?.note,
     })) : [];

    //diesel report
    const dieselWithBillPhotos = dieselReport.map((item, index) => {
      const billFile = dieselBillPhotos.find(
        (file) => file.fieldname === `dieselBillPhoto_${index}`
      );

      return {
        ...item,
        billPhoto: billFile
          ? billFile.buffer
          : null,
        imageContentType : billFile ? billFile.mimetype : null,
      };
    });

    const machineryFuelLogs = dieselWithBillPhotos.filter(
      item => item.machineId && !item.vehicleId
    );

    const vehicleFuelLogs = dieselWithBillPhotos.filter(
      item => item.vehicleId && !item.machineId
    );

    const machineryFuelLogsData = machineryFuelLogs.length > 0 ?
     machineryFuelLogs?.map((item)=>({
      ...item,
      dprId: dpr.id,
      date: new Date(),
      totalKmReading:
        parseFloat(item?.endReading || 0) -
        parseFloat(item?.startReading || 0),
      fuelSupplier: item?.fuelSupplier || "Bharat Petroleum",
      remarks: item?.remarks || null
     })) : [];

     const vehicleFuelLogsData = vehicleFuelLogs.length > 0 ?
     vehicleFuelLogs?.map((item)=>({
      ...item,
      dprId: dpr.id,
      date: new Date(),
      totalKmReading:
        parseFloat(item?.endReading || 0) -
        parseFloat(item?.startReading || 0),
      fuelSupplier: item?.fuelSupplier || "Bharat Petroleum",
      remarks: item?.remarks || null
     })) : [];

    //maintenance
    const maintenanceWithInvoice = maintenance.map((item, index) => {
      const invoiceFile = maintenanceInvoices.find(
        (file) => file.fieldname === `maintenanceInvoice_${index}`
      );

      return {
        ...item,
        invoice: invoiceFile
          ? invoiceFile.buffer
          : null,
        invoiceContentType : invoiceFile ? invoiceFile.mimetype : null,
      };
    });

    const machineryMaintenance = maintenanceWithInvoice.filter(
      item => item.machineId && !item.vehicleId
    );

    const vehicleMaintenance = maintenanceWithInvoice.filter(
      item => item.vehicleId && !item.machineId
    );

    const vehicleMaintenanceData = vehicleMaintenance.length > 0 ?
     vehicleMaintenance?.map((item)=>({
      ...item,
      dprId: dpr.id,
      nextServiceDate: item?.nextServiceDate || null
     })) : [];

    const machineryMaintenanceData = machineryMaintenance.length > 0 ?
     machineryMaintenance?.map((item)=>({
      ...item,
      dprId: dpr.id,
      nextServiceDate: item?.nextServiceDate || null
     })) : [];

    const photosData =
      photos.length > 0
        ? photos?.map((photo) => ({
            dprId: dpr.id,
            photo: `data:${photo.mimetype};base64,${photo.buffer.toString(
              "base64"
            )}`,
            fileName: photo.originalname,
          }))
        : [];

    if (workDoneData?.length)
      await WorkDone.bulkCreate(workDoneData, { transaction });

    if(consumableStockData?.length)
      await MaterialTransaction.bulkCreate(consumableStockData, { transaction });
    if(permanentStockData?.length)
      await PermanentStockTransaction.bulkCreate(permanentStockData, { transaction });

    if (vehicleFuelLogsData?.length)
      await FuelLog.bulkCreate(vehicleFuelLogsData, { transaction });
    if (machineryFuelLogsData?.length)
      await MachineryFuelLog.bulkCreate(machineryFuelLogsData, { transaction });

    if (laborReportData?.length)
      await LaborReport.bulkCreate(laborReportData, { transaction });
    
    if (vehicleMaintenanceData?.length)
      await VehicleMaintenance.bulkCreate(vehicleMaintenanceData, { transaction });
    if (machineryMaintenanceData?.length)
      await MachineryMaintenance.bulkCreate(machineryMaintenanceData, { transaction });
    if (photosData?.length)
      await SitePhoto.bulkCreate(photosData, { transaction });

    if (dailyExpense && dailyExpense.length > 0) {
      const item = dailyExpense[0]; 
      const createdExpense = await DailyExpense.create(
        {
          dprId: dpr.id,
          expense: item?.expense || 0,
          remainingAmount: item?.remainingAmount || 0,
          date: new Date(),
          note: item?.note || null,
        },
        { transaction }
      );
      if (item.expenseDetails && item.expenseDetails.length > 0) {
        const expenseDetailsData = await Promise.all(
          item.expenseDetails.map(async (detail) => ({
            expenseId: createdExpense.id,
            workName: await getCategoryName(detail.workName), 
            amount: detail.amount,
            date: new Date(),
            note: detail.note || null,
          }))
        );

        await DailyExpenseDetails.bulkCreate(expenseDetailsData, {
          transaction,
        });
      }
    }

    await transaction.commit();

    successResponse(res, "Daily progress report added successfully", {
      dprId: dpr.id,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.log(error);
    
    errorResponse(res, "Failed to add daily progress report", 500);
  }
};

exports.getDprs = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { projectId, searchTerm,status } = req.query;

    const { role, id: userId } = req.user; 

    const whereCondition = {};

    if (role === "PROJECT_MANAGER" || role ==="SITE_MANAGER" || role ==="FINANCE_MANAGER" || role ==="SUPERVISOR") {
      const participantProjects = await Participant.findAll({
        where: { userId },
        attributes: ["projectId"],
      });
      const projectIds = participantProjects.map((p) => p.projectId);

      whereCondition.projectId = projectIds;
    }

    if (projectId) {
      whereCondition.projectId = projectId;
    }

    if(status){
      whereCondition.status = status;
    }

    if (searchTerm) {
      whereCondition[Op.or] = [
        { nameOfSupervisor: { [Op.like]: `%${searchTerm}%` } },
       
        { "$project.projectName$": { [Op.like]: `%${searchTerm}%` } },
        { "$project.location$": { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const { rows, count } = await Dpr.findAndCountAll({
      where: whereCondition,
      include: [      
        {
          model: User,
          as: "submittedByUser",
          attributes: ["id", "name", "email","role"],
        },
        {
          model: User,
          as: "editedByUser",
          attributes: ["id", "name", "email","role"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "projectName", "location"],
        },
        { model: WorkDone, as: "workDone" },
        { model: MaterialOnSite, as: "materialOnSite" },
        { model: DieselReport, as: "dieselReport" },

        { model: VehicleMaintenance, as: "vehicleMaintenance" },
        { model: MachineryMaintenance, as: "machineryMaintenance" },

        { model: MaterialTransaction, as: "consumableStock" },
        { model: PermanentStockTransaction, as: "permananetStock" },

        { model: LaborReport, 
          as: "laborReport" ,
          include :[
            "laborHead",
          ]
        },
        { model: DailyExpense, as: "dailyExpense" },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
      // subQuery: false, 
    });

     successResponse(res, "Daily progress reports fetched successfully", {
      reports: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch DPRs",
      error: error.message,
    });
  }
};

exports.getDprById = async (req, res) => {
  try {
    const dpr = await Dpr.findByPk(req.params.id, {
      include: [
        "workDone",
        "materialOnSite",
        "dieselReport",
        "dailyExpense",
        {
          model: DailyExpense,
          as: "dailyExpense",
          include :[
            "expenseDetails",
          ]
        },

        "photos",
        "project",
        "vehicleMaintenance",
        "machineryMaintenance",
        "machineryFuelLog",
        "vehicleFuelLog",
        {
          model: PermanentStockTransaction,
          as: "permananetStock",
          include: [
            {
              model: PermanentStock,
              as: "permanentStock",
              attributes: ["id", "name"],
            },
            {
              model: Vehicle,
              as: "vehicle",
              attributes: ["id", "vehicleName", "registrationNumber"],
            }
          ],
        },
        {
          model: MaterialTransaction,
          as: "consumableStock",
           include: [
            {
              model: ProjectMaterial,
              as: "projectMaterial",
              include: [
                {
                  model: CompanyMaterial,
                  as: "material",
                  attributes: ["id", "materialName", "available_quantity"],
                },
              ],
            },
            {
              model: Vehicle,
              as: "Vehicle",
              attributes: ["id", "vehicleName", "registrationNumber"],
            }
          ],
        },
        {
          model: LaborReport,
          as: "laborReport",
          include :[
            "laborHead",
          ]
        },
        {
          model: User,
          as: "submittedByUser",
          attributes: ["id", "name", "email","role"],
        },
        {
          model: User,
          as: "editedByUser",
          attributes: ["id", "name", "email","role"],
        },
      ],
    });
    const photos = dpr.photos.map((item) => ({
      fileName: item.fileName,
      photo: item.photo.toString("utf-8"),
    }));
    dpr.photos = photos;
    successResponse(res, "Daily progress fetch successfully.", dpr);
  } catch (error) {
    console.log(error);
    
    errorResponse(res);
  }
};

exports.getDprsByProjectId = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams(req.query);
    const { searchTerm } = req.query;
    const { projectId } = req.params;

    if (!projectId) {
      return errorResponse(res, "Project ID is required", 400);
    }

    const whereCondition = { projectId };

    if (searchTerm) {
      whereCondition[Op.or] = [
        { nameOfSupervisor: { [Op.like]: `%${searchTerm}%` } },
        { "$project.projectName$": { [Op.like]: `%${searchTerm}%` } },
        { "$project.location$": { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const { rows, count } = await Dpr.findAndCountAll({
      where: whereCondition,
      include: [
        { model: Project, as: "project", attributes: ["id", "projectName", "location"] },
        { model: WorkDone, as: "workDone" },
        { model: MaterialOnSite, as: "materialOnSite" },
        { model: DieselReport, as: "dieselReport" },
        { model: LaborReport, as: "laborReport" },
        { model: DailyExpense, as: "dailyExpense" },
        { model: VehicleMaintenance, as: "vehicleMaintenance" },
        { model: MachineryMaintenance, as: "machineryMaintenance" },
        { model: MaterialTransaction, as: "consumableStock" },
        { model: PermanentStockTransaction, as: "permananetStock" },
        {
          model: User,
          as: "submittedByUser",
          attributes: ["id", "name", "email","role"],
        },
        {
          model: User,
          as: "editedByUser",
          attributes: ["id", "name", "email","role"],
        },
      ],
      distinct: true,
      order: [["date", "DESC"]],
      limit,
      offset,
      subQuery: false,
    });

    successResponse(res, "Daily progress reports fetched successfully", {
      reports: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Failed to fetch DPRs", 500);
  }
};

const getOrCreateCategory = async (categoryName, transaction) => {
  const [category] = await Category.findOrCreate({
    where: { categoryName },
    defaults: { categoryName },
    transaction,
  });

  return category;
};

exports.changeStatusOfDPR = async (req, res) => {
   const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status,rejectionReason } = req.body;

    if (!id || !status) {
      await transaction.rollback();
      return errorResponse(res, "DPR ID and status are required", 400);
    }


    if (!["approved", "rejected"].includes(status)) {
      await transaction.rollback();
      return errorResponse(
        res,
        "DPR status must be either 'approved' or 'rejected'",
        400
      );
    }

    const dprData = await Dpr.findByPk(id, {
      include: [
        {
          model: LaborReport,
          as:"laborReport",
          include :[
          {
            model:LaborHead,
            as:"laborHead",
            include: [
            {
              model: Labor,
              as: "laborData",
            },
          ],
          }
          ]
        },
        {
          model:DailyExpense,
          as:"dailyExpense",
          include:[
            {
              model:DailyExpenseDetails,
              as:"expenseDetails",
            }           
          ]
        },
        {
          model:MachineryFuelLog,
          as:"machineryFuelLog",
        },
        {
          model:FuelLog,
          as:"vehicleFuelLog",
        },
        {
          model:MachineryMaintenance,
          as:"machineryMaintenance",
        },
        {
          model:VehicleMaintenance,
          as:"vehicleMaintenance",
        },
      ],
      // raw: true,
      transaction
    });
    console.log("dpr data",dprData);
    

    if (!dprData) {
      await transaction.rollback();
      return errorResponse(res, "DPR not found", 404);
    }

    if (dprData.status !== "pending") {
      await transaction.rollback();
      return errorResponse(res, `DPR already processed (${dprData.status})`, 400);
    }

    if (dprData.status === status) {
      return errorResponse(
        res,
        `DPR status is already ${status}`,
        400
      );
    }

    if (status === "rejected") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        await transaction.rollback();
        return errorResponse(
          res,
          "Rejection reason is required when rejecting DPR",
          400
        );
      }
      dprData.rejectionReason = rejectionReason;
    }

    if (status === "approved") {
      dprData.rejectionReason = null;
    }

    dprData.status = status;
    await dprData.save({ transaction });

    if (status === "approved") {
      //labor expense and attendenece and haed amount
      const attendanceData = await Promise.all(
        dprData.laborReport.map(async (item) => {

          const headPayment = item.laborHead?.laborData?.headDailyWage || 0;
          const malePayment = item.laborHead?.laborData?.maleDailyWage || 0;
          const femalePayment = item.laborHead?.laborData?.femaleDailyWage || 0;

          const headPresent = !!item.mukadam;

          const malePresent = item.male;
          const femalePresent = item.female;

          const totalAmount =
            (headPresent ? headPayment : 0) +
            (malePresent * malePayment) +
            (femalePresent * femalePayment);

          const amount = Number(totalAmount) || 0;

          if (item.laborHeadId && amount > 0) {
            await LaborHead.increment(
            {
              totalAmount: amount,
              totalRemaining: amount,
            },
            {
              where: { id: item.laborHeadId },
              transaction,
            }
            );
            const head = await LaborHead.findByPk(item.laborHeadId, { transaction });

            if (head.totalRemaining > 0) {
              head.status = "partial";
              await head.save({ transaction });
            }
          }

          const category = await getOrCreateCategory("labor", transaction);

          const labourExpense = {
            expenseId: await generateExpenseId(),
            projectId: dprData.projectId,
            categoryId: category.id,
            submittedBy: req.user.id,
            amount,
            gst: 0,
            status: "approved",
            description: "Labor expense from dpr",
            receipt: null,
            imageContentType: null,
          };

          if(labourExpense){
            await Expense.create(labourExpense, { transaction });
          }
          
          return {
            headId: item.laborHeadId,
            projectId:dprData.projectId,
            headPresent,
            headPayment,

            maleCount:item.laborHead?.laborData?.maleWorkersCount || 0,
            malePresent:malePresent,
            malePayment : malePayment,

            femaleCount: item.laborHead?.laborData?.femaleWorkersCount || 0,
            femalePresent:femalePresent,
            femalePayment:femalePayment,
            date: dprData.date
          };
        })
      );

      //daily expense 
      const allExpenseDetails = (dprData?.dailyExpense || []).flatMap(
        (exp) => exp.expenseDetails || []
      );

      const expenseData = await Promise.all(
        allExpenseDetails.map(async (item) => {
          const name = item?.workName?.trim();
          const amount = Number(item?.amount) || 0;

          const category = await getOrCreateCategory(name, transaction);

          const expenseId = await generateExpenseId();

          return {
            expenseId,
            projectId: dprData.projectId,
            categoryId: category.id,
            submittedBy: req.user.id,
            amount,
            gst: 0,
            status:"approved",
            description: "Expense from dpr",
            
            receipt: null,
            imageContentType: null,
          };
        })
      );

      //diesel fuel log
      const machineryCategory = await getOrCreateCategory("machinery fuel", transaction);

      const machineryFuelExpense = await Promise.all(
        dprData?.machineryFuelLog.map(async (item) => {
          if(item?.litersFilled > 0){
            const amount = Number(item?.litersFilled) * Number(item?.ratePerLiter);

            return {
              expenseId:await generateExpenseId(),
              projectId: dprData.projectId,
              categoryId: machineryCategory.id,
              submittedBy: req.user.id,
              amount,
              gst: 0,
              status:"approved",
              description: "Machnery fuel expense from dpr",  
              receipt: item.billPhoto || null,
              imageContentType: item.imageContentType || null,
            };
          }
        })
      );

      const newmachineryFuelExpense = machineryFuelExpense.filter(Boolean);

      const vehicleCategory = await getOrCreateCategory("vehicle fuel", transaction);

      const vehicleFuelExpense = await Promise.all(
        dprData?.vehicleFuelLog.map(async (item) => {
          if(item?.litersFilled > 0){
            const amount = Number(item?.litersFilled) * Number(item?.ratePerLiter);

            return {
              expenseId:await generateExpenseId(),
              projectId: dprData.projectId,
              categoryId: vehicleCategory.id,
              submittedBy: req.user.id,
              amount,
              gst: 0,
              status:"approved",
              description: "Machnery fuel expense from dpr",  
              receipt: item.billPhoto || null,
              imageContentType: item.imageContentType || null,
            };
          }
        })
      );

      const newvehicleFuelExpense = vehicleFuelExpense.filter(Boolean);

      //maintenance
      const machineryMaintenanceCategory = await getOrCreateCategory("machinery maintenance", transaction);

      const machineryMaintenanceExpense = await Promise.all(
        dprData?.machineryMaintenance.map(async (item) => {
          if(item?.cost > 0){
            const amount = Number(item?.cost) || 0;
            return {
              expenseId:await generateExpenseId(),
              projectId: dprData.projectId,
              categoryId: machineryMaintenanceCategory.id,
              submittedBy: req.user.id,
              amount,
              gst: 0,
              status:"approved",
              description: "Machinery maintenance expense from dpr",  
              receipt: item.invoice || null,
              imageContentType: item.invoiceContentType || null,
            };
          }
        })
      );

      const newMachineryMaintenanceExpense = machineryMaintenanceExpense.filter(Boolean);

      const vehicleMaintenanceCategory = await getOrCreateCategory("vehicle maintenance", transaction);

      const vehicleMaintenanceExpense = await Promise.all(
        dprData?.vehicleMaintenance.map(async (item) => {
          if(item?.cost > 0){
            const amount = Number(item?.cost) || 0;
            return {
              expenseId:await generateExpenseId(),
              projectId: dprData.projectId,
              categoryId: vehicleMaintenanceCategory.id,
              submittedBy: req.user.id,
              amount,
              gst: 0,
              status:"approved",
              description: "Vehicle maintenance expense from dpr",  
              receipt: item.invoice || null,
              imageContentType: item.invoiceContentType || null,
            };
          }
        })
      );

      const newVehicleMaintenanceExpense = vehicleMaintenanceExpense.filter(Boolean);

      if (newmachineryFuelExpense.length > 0) {
        await Expense.bulkCreate(newmachineryFuelExpense, { transaction });
      }  

      if (newvehicleFuelExpense.length > 0) {
        await Expense.bulkCreate(newvehicleFuelExpense, { transaction });
      }

      if (newMachineryMaintenanceExpense.length > 0) {
        await Expense.bulkCreate(newMachineryMaintenanceExpense, { transaction });
      } 

      if (newVehicleMaintenanceExpense.length > 0) {
        await Expense.bulkCreate(newVehicleMaintenanceExpense, { transaction });
      } 

      if (expenseData.length > 0) {
        await Expense.bulkCreate(expenseData, { transaction });
      }
 
      if (attendanceData.length > 0) {
        await LaborAttendence.bulkCreate(attendanceData, { transaction });
      }
      
    }

    await transaction.commit();

    return successResponse(
      res,
      `DPR ${status} successfully`,
      dprData
    );
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    return errorResponse(
      res,
      "Failed to approve or reject DPR",
      500
    );
  }
};

const syncChildTable = async ({
  Model,
  dataArray,
  dprId,
  transaction,
  updateFields,
}) => {

  const existingRows = await Model.findAll({
    where: { dprId },
    transaction,
  });

  const existingIds = existingRows.map(row => row.id);
  const finalIds = [];

  for (const item of dataArray) {
    const itemId = Number(item.id);
    const updateData = {};
    updateFields.forEach(field => {
      updateData[field] =
        field === "diesel" || field === "length" || field === "width" || field === "height" || field === "expense" || field === "remainingAmount" ||field === "male" || field === "female"
          ? parseFloat(item[field]) || 0
          : item[field];
    });

    if (itemId && existingIds.includes(itemId)) {
      await Model.update(updateData, {
        where: { id: itemId },
        transaction,
      });

      finalIds.push(itemId);

    } else {
      const created = await Model.create(
        { dprId, ...updateData },
        { transaction }
      );

      finalIds.push(created.id);
    }
  }

  await Model.destroy({
    where: {
      dprId,
      id: { [Op.notIn]: finalIds.length ? finalIds : [0] },
    },
    transaction,
  });
};

exports.editDPRByDprId = async (req, res) => {
  const transaction = await sequelize.transaction();
  try{
    const {dprId}=req.params;
    // console.log("frontend data dpr id",dprId);
    // console.log("frontend data",req.body);
    const {
      projectId,
      nameOfSite,
      nameOfSupervisor,
      date,
      dateOfSubmission,
    } = req.body;

    const workDoneData = JSON.parse(req.body.workDone || "[]");
    // const materialOnSite = JSON.parse(req.body.materialOnSite || "[]");
    const dailyExpense = JSON.parse(req.body.dailyExpense || "[]");
    const dieselReport = JSON.parse(req.body.dieselReport || "[]");
    const laborReport = JSON.parse(req.body.laborReport || "[]");

    console.log(req.body.workDone );
    console.log(req.body.materialOnSite );
    console.log(req.body.dailyExpense );
    console.log(req.body.dieselReport );
    console.log(req.body.laborReport );
    console.log(req.body.maintenance );

    const files = req.files || [];
    const photos = files.filter(file => file.fieldname === "photos");

    const maintenanceInvoices = files.filter(file =>
      file.fieldname.startsWith("maintenanceInvoice_")
    );
    const materialChallans = files.filter(file =>
      file.fieldname.startsWith("materialChallan_")
    );
    const dieselBillPhotos = files.filter(file =>
      file.fieldname.startsWith("dieselBillPhoto_")
    );

    const dpr = await Dpr.findByPk(dprId, { transaction });

    if (!dpr) {
      await transaction.rollback();
      return errorResponse(res, "DPR not found", 404);
    }

    dpr.projectId=projectId;
    dpr.nameOfSite=nameOfSite;
    dpr.nameOfSupervisor=nameOfSupervisor;
    dpr.date=date;
    dpr.dateOfSubmission=dateOfSubmission;
    dpr.editedBy=req.user.id;

    if (dpr.status === "rejected") {
      dpr.status = "pending";
      dpr.rejectionReason = null;
    }
    await dpr.save({ transaction });

    await syncChildTable({
      Model: WorkDone,
      dataArray: workDoneData,
      dprId,
      transaction,
      updateFields: [
        "chainage",
        "itemOfWork",
        "length",
        "width",
        "height",
        "note",
      ],
    });

    await syncChildTable({
      Model: LaborReport,
      dataArray: laborReport,
      dprId,
      transaction,
      updateFields: [
        "laborHeadId",
        "work",
        "mukadam",
        "male",
        "female",
        "note",
      ],
    });

    let dailyExpenseData=[];
    if (dailyExpense && dailyExpense.length > 0) {
      const item = dailyExpense[0]; 
      if(item?.id){
        const totalDetailAmount = (item.expenseDetails || []).reduce(
          (sum, d) => sum + (Number(d.amount) || 0),
          0
        );

        const previousTotalSpentAmount = await DailyExpenseDetails.sum("amount", {
          where: { expenseId: item?.id },
        });

        // console.log("previousTotalSpentAmount",previousTotalSpentAmount);
        
        const previousDailyExpense = await DailyExpense.findOne({
          where :{dprId: dpr.id},
          raw: true,
        })

        const newDifferance= previousTotalSpentAmount - totalDetailAmount;
        const newRemainingAmount = Number(previousDailyExpense?.remainingAmount)  + newDifferance;

        // console.log("remainingAmount",remainingAmount);
        // console.log("newDifferance",newDifferance);
        // console.log("newRemainingAmount",newRemainingAmount);

        dailyExpenseData=[{
          dprId: dpr.id,
          id: item?.id,
          remainingAmount: newRemainingAmount,
          note:item?.note||null,
        }]

        if (item.expenseDetails && item.expenseDetails.length > 0) 
        { 
          const newDetails = item.expenseDetails.filter((detail) => !detail.id);

          if (newDetails.length > 0) {
            // const dailyExpenseDetailData = newDetails.map((detail) => ({
            //   expenseId: item?.id,
            //   workName: detail.workName,
            //   amount: Number(detail.amount) || 0,
            //   date: new Date(),
            //   note: detail.note || null,
            // }));

            const dailyExpenseDetailData = await Promise.all(
              newDetails.map(async (detail) => ({
                expenseId: item?.id,
                workName: await getCategoryName(detail.workName), 
                amount: Number(detail.amount) || 0,
                date: new Date(),
                note: detail.note || null,
              }))
            );

            await DailyExpenseDetails.bulkCreate(dailyExpenseDetailData, {
              transaction,
            });
          }
        }

        let isMismatch = false;

        if (previousTotalSpentAmount !== totalDetailAmount) {
          isMismatch = true;
        }

        // console.log("isMismatch",isMismatch);
        if(isMismatch){
          const latestDailyExpense = await DailyExpense.findOne({
            include: [
              {
                model: Dpr,
                as: "dpr",
                where: { projectId: dpr.projectId },
                attributes: [], 
              },
            ],
            order: [["date", "DESC"], ["id", "DESC"]],
            raw: true,
            transaction,
          });
          let updatedRemaining =
            Number(latestDailyExpense?.remainingAmount) || 0;

          updatedRemaining = updatedRemaining + newDifferance;

            // console.log("updatedRemaining",updatedRemaining);

          await DailyExpense.update(
            { remainingAmount: updatedRemaining },
            {
              where: { id: latestDailyExpense.id },
              transaction,
            }
          );
        }
      } else{ 
        const createdExpense = await DailyExpense.create(
        {
          dprId: dpr.id,
          expense: item?.expense || 0,
          remainingAmount: item?.remainingAmount || 0,
          date: new Date(),
          note: item?.note || null,
        },
        { transaction }
        );
        if (item.expenseDetails && item.expenseDetails.length > 0) {
          // const expenseDetailsData = item.expenseDetails.map((detail) => ({
          //   expenseId: createdExpense.id, 
          //   workName: detail.workName,
          //   amount: detail.amount,
          //   date: new Date(),
          //   note: detail.note || null,
          // }));

            const expenseDetailsData = await Promise.all(
              item.expenseDetails.map(async (detail) => ({
                expenseId: createdExpense.id,
                workName: await getCategoryName(detail.workName), 
                amount: Number(detail.amount) || 0,
                date: new Date(),
                note: detail.note || null,
              }))
            );

          await DailyExpenseDetails.bulkCreate(expenseDetailsData, {
            transaction,
          });
        }      
      }
    }
    
    const maintenance = JSON.parse(req.body.maintenance || "[]");
    const materialOnSite = JSON.parse(req.body.materialOnSite || "[]");
    

    const maintenanceWithInvoice = maintenance.map((item, index) => {
    const invoiceFile = maintenanceInvoices.find(
      file => file.fieldname === `maintenanceInvoice_${index}`
    );

    return {
      ...item,
      invoice: invoiceFile
        ? invoiceFile.buffer
        : item.invoice || null,
      invoiceContentType: invoiceFile
        ? invoiceFile.mimetype
        : item.invoiceContentType || null
    };
    });

    const materialWithChallan = materialOnSite.map((item, index) => {
      const challanFile = materialChallans.find(
        (file) => file.fieldname === `materialChallan_${index}`
      );

      return {
        ...item,
        challan: challanFile
          ? challanFile.buffer
          : null,
        imageContentType : challanFile ? challanFile.mimetype : null,
      };
    });

    const dieselWithBillPhotos = dieselReport.map((item, index) => {
      const billFile = dieselBillPhotos.find(
        (file) => file.fieldname === `dieselBillPhoto_${index}`
      );

      return {
        ...item,
        billPhoto: billFile
          ? billFile.buffer
          : null,
        imageContentType : billFile ? billFile.mimetype : null,
      };
    });

    const machineryMaintenance = maintenanceWithInvoice.filter(item => item.machineId);
    const vehicleMaintenance = maintenanceWithInvoice.filter(item => item.vehicleId);

    const consumableStockData = materialWithChallan.filter(
      item => item.materialId 
    );
    const permanentStockData = materialWithChallan.filter(
      item => item.stockId
    );

    const consumableStock = consumableStockData.map ((item,index)=>{
        return{
          ...item,
          quantity:item?.brass||0,
        }
    });

    const permanentStock = permanentStockData.map ((item,index)=>{
        return{
          ...item,
          quantity:item?.brass||0,
        }
    });

    const machineryFuelLog = dieselWithBillPhotos.filter(item => item.machineId);
    const vehicleFuelLog = dieselWithBillPhotos.filter(item => item.vehicleId);

    const machineryFuelLogData = machineryFuelLog.map((item, index) => {
      return {
        ...item,
        date: new Date(),
        totalKmReading:
        parseFloat(item?.endReading || 0) -
        parseFloat(item?.startReading || 0),
        fuelSupplier: item?.fuelSupplier || "Bharat Petroleum",
      };
    });

    const vehicleFuelLogData = vehicleFuelLog.map((item, index) => {
      return {
        ...item,
        date: new Date(),
        totalKmReading:
        parseFloat(item?.endReading || 0) -
        parseFloat(item?.startReading || 0),
        fuelSupplier: item?.fuelSupplier || "Bharat Petroleum",
      };
    });


    if (machineryMaintenance.length) {
      await syncChildTable({
        Model: MachineryMaintenance,
        dataArray: machineryMaintenance,
        dprId,
        transaction,
        updateFields: [
          "machineId",
          "serviceDate",
          "description",
          "cost",
          "garageName",
          "garageContactNumber",
          "nextServiceDate",
          "invoice",
          "invoiceContentType"
        ],
      });
    }

    if (vehicleMaintenance.length) {
      await syncChildTable({
        Model: VehicleMaintenance,
        dataArray: vehicleMaintenance,
        dprId,
        transaction,
        updateFields: [
          "vehicleId",
          "serviceDate",
          "description",
          "cost",
          "garageName",
          "garageContactNumber",
          "nextServiceDate",
          "invoice",
          "invoiceContentType",
        ],
      });
    }

    if (machineryFuelLogData.length) {
      await syncChildTable({
        Model: MachineryFuelLog,
        dataArray: machineryFuelLogData,
        dprId,
        transaction,
        updateFields: [
          "machineId",
          "startReading",
          "endReading",
          "date",
          "totalKmReading",
          "litersFilled",
          "ratePerLiter",
          "fuelSupplier",
          "driverName",
          "dieselEntryBy",
          "remarks",
          "billPhoto",
          "invoiceContentType"
        ],
      });
    }

    if (vehicleFuelLogData.length) {
      await syncChildTable({
        Model: FuelLog,
        dataArray: vehicleFuelLogData,
        dprId,
        transaction,
        updateFields: [
          "vehicleId",
          "startReading",
          "endReading",
          "totalKmReading",
          "litersFilled",
          "ratePerLiter",
          "date",
          "fuelSupplier",
          "driverName",
          "dieselEntryBy",
          "remarks",
          "billPhoto",
          "invoiceContentType"
        ],
      });
    }

    if (consumableStock.length) {
      await syncChildTable({
        Model: MaterialTransaction,
        dataArray: consumableStock,
        dprId,
        transaction,
        updateFields: [
          "projectMaterialId",
          "transactionType",
          "quantity",
          "vehicleId",
          "challanNumber",
          "challan",
          "imageContentType",
          "note",
        ],
      });
    }

    if (permanentStock.length) {
      await syncChildTable({
        Model: PermanentStockTransaction,
        dataArray: permanentStock,
        dprId,
        transaction,
        updateFields: [
          "stockId",
          "transactionType",
          "quantity",
          "vehicleId",
          "challanNumber",
          "challan",
          "imageContentType",
          "note",
        ],
      });
    }

    const photosData =
      photos.length > 0
        ? photos?.map((photo) => ({
            dprId: dpr.id,
            photo: `data:${photo.mimetype};base64,${photo.buffer.toString(
              "base64"
            )}`,
            fileName: photo.originalname,
          }))
        : [];

    if (photosData?.length)
      await SitePhoto.bulkCreate(photosData, { transaction });

    await transaction.commit();

    successResponse(res, "Daily progress report edited successfully", {
      dprId: dpr.id,
    });

  }catch (error) {
    if (transaction) await transaction.rollback();
    console.log(error);
    
    errorResponse(res, "Failed to edit daily progress report", 500);
  }
};

// exports.changeStatusOfDPR = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status,rejectionReason } = req.body;

//     if (!id || !status) {
//       return errorResponse(res, "DPR ID and status are required", 400);
//     }


//     if (!["approved", "rejected"].includes(status)) {
//       return errorResponse(
//         res,
//         "DPR status must be either 'approved' or 'rejected'",
//         400
//       );
//     }

//     const dprData = await Dpr.findByPk(id, {
//       include: [
//         {
//           model: LaborReport,
//           as:"laborReport",
//           include :[
//           {
//             model:LaborHead,
//             as:"laborHead",
//             include: [
//             {
//               model: Labor,
//               as: "laborData",
//             },
//           ],
//           }
//           ]
//         },
//       ],
//     });

//     if (!dprData) {
//       return errorResponse(res, "DPR not found", 404);
//     }

//     if (dprData.status !== "pending") {
//       return errorResponse(res, `DPR already processed (${dprData.status})`, 400);
//     }

//     if (dprData.status === status) {
//       return errorResponse(
//         res,
//         `DPR status is already ${status}`,
//         400
//       );
//     }

//     if (status === "rejected") {
//       if (!rejectionReason || rejectionReason.trim() === "") {
//         return errorResponse(
//           res,
//           "Rejection reason is required when rejecting DPR",
//           400
//         );
//       }
//       dprData.rejectionReason = rejectionReason;
//     }

//     if (status === "approved") {
//       dprData.rejectionReason = null;
//     }

//     dprData.status = status;
//     await dprData.save();

//     if (status === "approved" && dprData.editedBy === null) {

//   // const attendanceData = dprData.laborReport.map((item) => {

//   //   const headPayment = item.laborHead?.laborData?.headDailyWage || 0;
//   //   const malePayment = item.laborHead?.laborData?.maleDailyWage || 0;
//   //   const femalePayment = item.laborHead?.laborData?.femaleDailyWage || 0;

//   //   const headPresent = item.mukadam ? 1 : 0;

//   //   const malePresent = item.male;
//   //   const femalePresent = item.female;

//   //   const totalAmount =
//   //     (headPresent ? headPayment : 0) +
//   //     (malePresent * malePayment) +
//   //     (femalePresent * femalePayment);

//   //   if (item.laborHead) {
//   //     await LaborHead.increment(
//   // { totalPaid: totalAmount },
//   // { where: { id: item.laborHeadId } }
//   //   );
//   //   }

//   //   return {
//   //     headId: item.laborHeadId,

//   //     headPresent: headPresent,
//   //     headPayment: headPayment,

//   //     maleCount: item.male,
//   //     malePresent: malePresent,
//   //     malePayment: malePayment,

//   //     femaleCount: item.female,
//   //     femalePresent: femalePresent,
//   //     femalePayment: femalePayment,

//   //     date: dprData.date,
//   //   };
//   // });

//   const attendanceData = await Promise.all(
//   dprData.laborReport.map(async (item) => {

//     const headPayment = item.laborHead?.laborData?.headDailyWage || 0;
//     const malePayment = item.laborHead?.laborData?.maleDailyWage || 0;
//     const femalePayment = item.laborHead?.laborData?.femaleDailyWage || 0;

//     const headPresent = item.mukadam ? 1 : 0;

//     const malePresent = item.male;
//     const femalePresent = item.female;

//     const totalAmount =
//       (headPresent ? headPayment : 0) +
//       (malePresent * malePayment) +
//       (femalePresent * femalePayment);

//     if (item.laborHead) {
//       await LaborHead.increment(
//         { totalPaid: totalAmount },
//         {
//           where: { id: item.laborHeadId },
//           transaction
//         }
//       );
//     }

//     return {
//       headId: item.laborHeadId,
//       headPresent,
//       headPayment,

//       maleCount: item.male,
//       malePresent,
//       malePayment,

//       femaleCount: item.female,
//       femalePresent,
//       femalePayment,

//       date: dprData.date
//     };
//   })
//   );

// await LaborsAttendence.bulkCreate(attendanceData, { transaction });;
// }

//     return successResponse(
//       res,
//       `DPR ${status} successfully`,
//       dprData
//     );
//   } catch (error) {
//     console.error(error);
//     return errorResponse(
//       res,
//       "Failed to approve or reject DPR",
//       500
//     );
//   }
// };

exports.getRemainingAmountByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const lastExpense = await DailyExpense.findOne({
      attributes: ["expense","remainingAmount", "date", "id"],
      include: [
        {
          model: Dpr,
          as: "dpr",
          attributes: [],
          where: { projectId: projectId },
        },
      ],
      order: [
        ["date", "DESC"], 
        ["id", "DESC"],    
      ],
      raw: true,
    });

    successResponse(res, "Daily expense fetch successfully.", lastExpense);
  }catch (error) {
    console.log(error);
    errorResponse(res);
  }
}

// exports.deleteDailyExpenseDetailById= async (req, res) => {
//   try {
//     const { id } = req.params;
//     if(!id){
//       return errorResponse(res, "Id is required", 400);
//     }
//     const deleted = await DailyExpenseDetails.destroy({
//       where: { id },
//     });

//     if (!deleted) {
//       return errorResponse(res, "Daily expense detial not found", 400);
//     }
//     successResponse(res, "Daily progress fetch successfully.");
//   }catch (error) {
//     console.log(error);
//     errorResponse(res);
//   }
// }

exports.deleteDailyExpenseDetailById = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (!id) {
      await t.rollback();
      return errorResponse(res, "Id is required", 400);
    }

    const detail = await DailyExpenseDetails.findOne({
      where: { id },
      raw: true,
      transaction: t,
    });

    if (!detail) {
      await t.rollback();
      return errorResponse(res, "Daily expense detail not found", 404);
    }

    const expenseId = detail.expenseId;
    const amount = Number(detail.amount) || 0;

    const dailyExpense = await DailyExpense.findOne({
      where: { id: expenseId },
      transaction: t,
    });

    if (!dailyExpense) {
      await t.rollback();
      return errorResponse(res, "Parent expense not found", 404);
    }

    const updatedRemaining =
      Number(dailyExpense.remainingAmount || 0) + amount;

    await DailyExpense.update(
      { remainingAmount: updatedRemaining },
      {
        where: { id: expenseId },
        transaction: t,
      }
    );

    await DailyExpenseDetails.destroy({
      where: { id },
      transaction: t,
    });

    await t.commit();

    return successResponse(
      res,
      "Daily expense detail deleted and remaining amount updated successfully"
    );

  } catch (error) {
    await t.rollback();
    console.log(error);
    errorResponse(res);
  }
};
  
exports.deleteSitePhotos = async (req,res) =>  {
  const t = await sequelize.transaction();
  try{
    const {id}=req.params;
    if (!id) {
      await t.rollback();
      return errorResponse(res, "Id is required", 400);
    }

    const sitePhoto = await SitePhoto.findOne({
      where:{id},
      transaction:t,
    })

    if (!sitePhoto) {
      await t.rollback();
      return errorResponse(res, "Site photo not found", 404);
    }
    
    await sitePhoto.destroy({ transaction: t });

    await t.commit();

    return successResponse(
      res,
      "Site photo deleted successfully"
    );

  } catch(error){
    await t.rollback();
    console.log(error);
    errorResponse(res);
  }

}