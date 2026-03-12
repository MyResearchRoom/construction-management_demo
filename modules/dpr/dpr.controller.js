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
  sequelize,
  Participant,
} = require("../../models");
const { errorResponse, successResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");
const { Op } = require("sequelize");

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

    // console.log("frontend data",req.body);

    const workDone = JSON.parse(req.body.workDone || "[]");
    const materialOnSite = JSON.parse(req.body.materialOnSite || "[]");
    const dailyExpense = JSON.parse(req.body.dailyExpense || "[]");
    const dieselReport = JSON.parse(req.body.dieselReport || "[]");
    const laborReport = JSON.parse(req.body.laborReport || "[]");
    const maintenance = JSON.parse(req.body.maintenance || "[]") || [];

    // const photos = req.files.photos || [];
    const files = req.files || [];
    const photos = files.filter(file => file.fieldname === "photos");

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
    const materialOnSiteData =
      materialOnSite.length > 0
        ? materialOnSite?.map((item) => ({
            dprId: dpr.id,
            ...item,
          }))
        : [];
    const dailyExpenseData =
      dailyExpense.length > 0
        ? dailyExpense?.map((item) => ({
            dprId: dpr.id,
            ...item,
          }))
        : [];
    const dieselReportData =
      dieselReport.length > 0
        ? dieselReport?.map((item) => ({
            dprId: dpr.id,
            ...item,
          }))
        : [];
    const laborReportData =
      laborReport.length > 0
        ? laborReport?.map((item) => ({
            dprId: dpr.id,
            ...item,
          }))
        : [];

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
    if (materialOnSiteData?.length)
      await MaterialOnSite.bulkCreate(materialOnSiteData, { transaction });
    if (dailyExpenseData?.length)
      await DailyExpense.bulkCreate(dailyExpenseData, { transaction });
    if (dieselReportData?.length)
      await DieselReport.bulkCreate(dieselReportData, { transaction });
    if (laborReportData?.length)
      await LaborReport.bulkCreate(laborReportData, { transaction });
    if (vehicleMaintenanceData?.length)
      await VehicleMaintenance.bulkCreate(vehicleMaintenanceData, { transaction });
    if (machineryMaintenanceData?.length)
      await MachineryMaintenance.bulkCreate(machineryMaintenanceData, { transaction });
    if (photosData?.length)
      await SitePhoto.bulkCreate(photosData, { transaction });

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
        "photos",
        "project",
        "vehicleMaintenance",
        "machineryMaintenance",
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
      ],
      transaction
    });

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

    return {
      headId: item.laborHeadId,
      projectId:dprData.projectId,
      headPresent,
      headPayment,

      // maleCount: item.male,
      // malePresent : item.laborHead?.laborData?.maleWorkersCount || 0,
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

    // console.log("attendanceData",attendanceData);
    

    await LaborAttendence.bulkCreate(attendanceData, { transaction });;
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
    const materialOnSite = JSON.parse(req.body.materialOnSite || "[]");
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
      Model: MaterialOnSite,
      dataArray: materialOnSite,
      dprId,
      transaction,
      updateFields: [
        "challanNumber",
        "materialType",
        "vehicleNumber",
        "brass",
        "remarks",
      ],
    });

    await syncChildTable({
      Model: DieselReport,
      dataArray: dieselReport,
      dprId,
      transaction,
      updateFields: [
        "startTime",
        "endTime",
        "vehicleNumber",
        "machineType",
        "tripFrom",
        "tripTo",
        "diesel",
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

    await syncChildTable({
      Model: DailyExpense,
      dataArray: dailyExpense,
      dprId,
      transaction,
      updateFields: [
        "particular",
        "expense",
        "remainingAmount",
        "note",
      ],
    });

    const maintenance = JSON.parse(req.body.maintenance || "[]");

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

    const machineryMaintenance = maintenanceWithInvoice.filter(item => item.machineId);
    const vehicleMaintenance = maintenanceWithInvoice.filter(item => item.vehicleId);

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

