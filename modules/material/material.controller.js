const { fn, col, literal,Op, where, } = require("sequelize");
const {
  ProjectMaterial,
  MaterialTransaction,
  Project,
  CompanyMaterial,
  Participant,
  Vehicle,
  PermanentStockTransaction,
  PermanentStock,
  sequelize,
} = require("../../models");
const { successResponse, errorResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");

exports.addMaterialTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { projectId,vehicleId, materialId, transactionType, quantity, challanNumber,note } =
      req.body;
    
    const challan = req.file ? req.file.buffer : null;
    const imageContentType = req.file ? req.file.mimetype : null;

    const project = await Project.findByPk(projectId, { transaction: t });
    if(!project) {
      await t.rollback();
      return errorResponse(res, "Project not found", 400);
    }

    let companyMaterial = await CompanyMaterial.findByPk(materialId, { transaction: t });
    if(!companyMaterial) {
      await t.rollback();
      return errorResponse(res, "Material not found", 400);
    }

    let [projectMaterial] = await ProjectMaterial.findOrCreate({
      where: { projectId, materialId },
      transaction: t,
    });

    if(transactionType==="issue"){
    if (companyMaterial.available_quantity < quantity) {
      await t.rollback();
      return errorResponse(res, "Not enough material in stock", 400);
    }
    }

    if(transactionType === "receive") {
      const transactions = await MaterialTransaction.findAll({
        where: { 
          projectMaterialId: projectMaterial.id,
          transactionType: {
            [Op.in]: ["receive", "issue"]
          }
        },
      });

      if (!transactions || transactions.length === 0) {
        await t.rollback();
        return errorResponse(res, "Material not issue yet", 400);
      }

      let totalReceived = 0;
      let totalIssued = 0;

      transactions.forEach((tx) => {
        if (tx.transactionType === "receive") totalReceived += tx.quantity;
        if (tx.transactionType === "issue") totalIssued += tx.quantity;
      });

      const availableToRecieved = totalIssued - totalReceived;

      if (quantity > availableToRecieved) {
        await t.rollback();
        return errorResponse(
          res,
          `Received material quantity is greater than issued quantity (${availableToRecieved})`,
          400
        );
      }
    }

    if(transactionType === "received to store") {
      const transactions = await MaterialTransaction.findAll({
        where: { 
          projectMaterialId: projectMaterial.id,
          transactionType: {
            [Op.in]: ["return", "received to store"]
          }
         },
      });

      if (!transactions || transactions.length === 0) {
        await t.rollback();
        return errorResponse(res, "Material not return yet", 400);
      }

      let totalReceivedToStore = 0;
      let totalReturned = 0;

      transactions.forEach((tx) => {
        if (tx.transactionType === "received to store") totalReceivedToStore += tx.quantity;
        if (tx.transactionType === "return") totalReturned += tx.quantity;
      });

      const availableToReceivedToStrore = totalReturned - totalReceivedToStore;

      if (quantity > availableToReceivedToStrore) {
        await t.rollback();
        return errorResponse(
          res,
          `Received to store quantity is greater than returned quantity (${availableToReceivedToStrore})`,
          400
        );
      }
    }

    const transaction = await MaterialTransaction.create(
      {
      projectMaterialId: projectMaterial.id,

      transactionType,
      quantity,
      vehicleId:vehicleId,
      challanNumber,
      challan,
      imageContentType,
      note: note ? note :null, 
      },
      { transaction: t }
    );

    if(transactionType==="issue"){
      await projectMaterial.increment(
        { assigned_quantity: quantity },
        { transaction: t }
      );
      await companyMaterial.decrement(
        {available_quantity: quantity},
        { transaction: t }
      );
    }

    if(transactionType==="received to store"){
      await companyMaterial.increment(
        {available_quantity: quantity},
        { transaction: t }
      );
    }

    await t.commit();
    successResponse(res, "Transaction recorded successfully", transaction);
  } catch (error) {
    if (!t.finished) {
      await t.rollback();
    }
    console.error(error);
    errorResponse(res, "Failed to record transaction", 500);
  }
};

exports.getProjectMaterials = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });

    const where = {};
    if (searchTerm) {
      where.material = { [Op.like]: `%${searchTerm}%` };
    }

    const { rows, count } = await ProjectMaterial.findAndCountAll({
      where,
      attributes: [
        "id",
        "materialId",
        [fn("SUM", col("transactions.quantity")), "totalQuantity"],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN transactions.transactionType = 'receive' THEN transactions.quantity ELSE 0 END`
            )
          ),
          "totalReceived",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN transactions.transactionType = 'issue' THEN transactions.quantity ELSE 0 END`
            )
          ),
          "totalIssued",
        ],
        [
          fn(
            "SUM",
            literal(
              `CASE WHEN transactions.transactionType = 'return' THEN transactions.quantity ELSE 0 END`
            )
          ),
          "totalReturned",
        ],
        [fn("MAX", col("transactions.createdAt")), "lastTransactionDate"],
        [
          literal(`
            SUM(
              CASE 
                WHEN transactions.transactionType = 'issue' THEN transactions.quantity
                WHEN transactions.transactionType = 'receive' THEN transactions.quantity
                WHEN transactions.transactionType = 'return' THEN -transactions.quantity
                ELSE 0 
              END
            )
          `),
          "currentStock",
        ],
      ],
      include: [
        {
          model: CompanyMaterial,
          as: "material",
          attributes: ["id", "materialName","available_quantity"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["id", "projectName"],
        },
        {
          model: MaterialTransaction,
          as: "transactions",
          attributes: [],
        },
      ],
      group: ["ProjectMaterial.id", "project.id"],
      limit,
      offset,
      order: [[fn("MAX", col("transactions.createdAt")), "DESC"]],
      subQuery: false,
    });

    successResponse(res, "Project materials fetched successfully", {
      materials: rows,
      pagination: {
        totalRecords: count.length || count,
        totalPages: Math.ceil((count.length || count) / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Failed to fetch project materials", 500);
  }
};

//search remaining
// exports.getAllMaterialTransactions = async (req, res) => {
//   try {
//     const { page, limit, offset } = validateQueryParams({ ...req.query });
//     // const { role, id: userId } = req.user;
//     // const whereCondition = {};

//     // if (role === "PROJECT_MANAGER" || role ==="SITE_MANAGER" || role ==="FINANCE_MANAGER") {
//     //   const participantProjects = await Participant.findAll({
//     //     where: { userId },
//     //     attributes: ["projectId"],
//     //   });
//     //   const projectIds = participantProjects.map((p) => p.projectId);

//     //   whereCondition.projectId = projectIds;
//     // }

//     // if (projectId) {
//     //   whereCondition.projectId = projectId;
//     // }
//     const { count, rows } = await MaterialTransaction.findAndCountAll({
//       // where: whereCondition,
//       attributes: { exclude: ["challan"] },
//       include: [
//         {
//           model: ProjectMaterial,
//           as: "projectMaterial",
//           attributes: ["projectId", "materialId","assigned_quantity"],
//           include: [
//             {
//               model: Project,
//               as: "project",
//               attributes: ["id", "projectName"],
//             },
//             {
//               model: CompanyMaterial,
//               as: "material",
//               attributes: ["id", "materialName","available_quantity"],
//             },
//           ],
//         },
//       ],
//       limit,
//       offset,
//       order: [["createdAt", "DESC"]],
//     });

//     successResponse(res, "Transactions fetched successfully.", {
//       transactions: rows,
//       pagination: {
//         totalRecords: count,
//         totalPages: Math.ceil(count / limit),
//         currentPage: page,
//         itemsPerPage: limit,
//       },
//     });
//   } catch (error) {
//     errorResponse(res, "Failed to fetch transactions");
//   }
// };

exports.getAllMaterialTransactions = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { projectId,materialId,transactionType } = req.query;
    const { role, id: userId } = req.user;

    const projectMaterialWhere = {};
    const stockWhere = {};
    if(materialId)
    {
        projectMaterialWhere.materialId=materialId;
    }
    if(transactionType){
        stockWhere.transactionType=transactionType;
    }

    if (
      role === "PROJECT_MANAGER" ||
      role === "SITE_MANAGER" ||
      role === "FINANCE_MANAGER"|| role ==="SUPERVISOR"
    ) {
      const participantProjects = await Participant.findAll({
        where: { userId },
        attributes: ["projectId"],
      });

      const projectIds = participantProjects.map((p) => p.projectId);

      if (!projectIds.length) {
        return successResponse(res, "No transactions found", {
          transactions: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            currentPage: page,
            itemsPerPage: limit,
          },
        });
      }

      projectMaterialWhere.projectId = projectIds;
    }

    if (projectId) {
      projectMaterialWhere.projectId = projectId;
    }

    const { count, rows } = await MaterialTransaction.findAndCountAll({
      where:stockWhere,
      include: [
        {
          model: ProjectMaterial,
          as: "projectMaterial",
          where: projectMaterialWhere,
          attributes: ["projectId", "materialId", "assigned_quantity"],
          include: [
            {
              model: Project,
              as: "project",
              attributes: ["id", "projectName"],
            },
            {
              model: CompanyMaterial,
              as: "material",
              attributes: ["id", "materialName", "available_quantity"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true, // IMPORTANT for correct count
    });

    successResponse(res, "Transactions fetched successfully.", {
      transactions: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Failed to fetch transactions");
  }
};

exports.getAllMaterialIssueTransactions = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { projectId } = req.query;
    const { role, id: userId } = req.user;

    const projectMaterialWhere = {};

    if (
      role === "PROJECT_MANAGER" ||
      role === "SITE_MANAGER" ||
      role === "FINANCE_MANAGER"|| role ==="SUPERVISOR"
    ) {
      const participantProjects = await Participant.findAll({
        where: { userId },
        attributes: ["projectId"],
      });
      
      const projectIds = participantProjects.map((p) => p.projectId);

      if (!projectIds.length) {
        return successResponse(res, "No transactions found", {
          transactions: [],
          pagination: {
            totalRecords: 0,
            totalPages: 0,
            currentPage: page,
            itemsPerPage: limit,
          },
        });
      }

      projectMaterialWhere.projectId = projectIds;
    }

    if (projectId) {
      projectMaterialWhere.projectId = projectId;
    }

    const { count, rows } = await MaterialTransaction.findAndCountAll({
      attributes: {  },
      where:{transactionType:"issue"},
      attributes: {
        exclude: ["challan"], 
      },
      include: [
        {
          model: ProjectMaterial,
          as: "projectMaterial",
          where: projectMaterialWhere,
          attributes: ["projectId", "materialId", "assigned_quantity"],
          include: [
            {
              model: Project,
              as: "project",
              attributes: ["id", "projectName"],
            },
            {
              model: CompanyMaterial,
              as: "material",
              attributes: ["id", "materialName", "available_quantity"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true, // IMPORTANT for correct count
    });

    successResponse(res, "Transactions fetched successfully.", {
      transactions: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Failed to fetch transactions");
  }
};

exports.getAllProjectsWithMaterialsDetails = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({ ...req.query });

    // Optional search filter on material name
    const materialWhere = {};
    if (searchTerm) {
      materialWhere.materialName = { [Op.like]: `%${searchTerm}%` };
    }

    const projects = await Project.findAndCountAll({
      attributes: ["id", "projectName"],
      include: [
        {
          model: ProjectMaterial,
          as: "projectMaterials",
          attributes: [
            "id","projectId",
            "assigned_quantity",
            "materialId",
            // [
            //   literal(`
            //     SUM(
            //       CASE 
            //         WHEN materials->transactions.transactionType = 'receive' THEN materials->transactions.quantity
            //         WHEN materials->transactions.transactionType = 'issue' THEN -materials->transactions.quantity
            //         WHEN materials->transactions.transactionType = 'return' THEN -materials->transactions.quantity
            //         ELSE 0
            //       END
            //     )
            //   `),
            //   "currentStock",
            // ],
            // [
            //   literal(`
            //     SUM(
            //       CASE 
            //         WHEN \`projectMaterials->transactions\`.\`transactionType\` = 'receive'
            //           THEN \`projectMaterials->transactions\`.\`quantity\`
            //         WHEN \`projectMaterials->transactions\`.\`transactionType\` = 'issue'
            //           THEN -\`projectMaterials->transactions\`.\`quantity\`
            //         WHEN \`projectMaterials->transactions\`.\`transactionType\` = 'return'
            //           THEN \`projectMaterials->transactions\`.\`quantity\`
            //         ELSE 0
            //       END
            //     )
            //   `),
            //   "currentStock",
            // ],
            // [
            //   fn(
            //     "SUM",
            //     literal(`CASE WHEN materials->transactions.transactionType = 'receive' THEN materials->transactions.quantity ELSE 0 END`)
            //   ),
            //   "totalReceived",
            // ],
            // [
            //   fn(
            //     "SUM",
            //     literal(`CASE WHEN materials->transactions.transactionType = 'issue' THEN materials->transactions.quantity ELSE 0 END`)
            //   ),
            //   "totalIssued",
            // ],
            // [
            //   fn(
            //     "SUM",
            //     literal(`CASE WHEN materials->transactions.transactionType = 'return' THEN materials->transactions.quantity ELSE 0 END`)
            //   ),
            //   "totalReturned",
            // ],
          ],
          include: [
            {
              model: CompanyMaterial,
              as: "material",
              attributes: ["id", "materialName", "available_quantity"],
              where: materialWhere, 
            },
            {
              model: MaterialTransaction,
              as: "transactions",
              // attributes: [],
            },
          ],
          group: ["ProjectMaterial.id", "material.id"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      subQuery: false,
    });

    successResponse(res, "Projects with materials fetched successfully", {
      projects: projects.rows,
      pagination: {
        totalRecords: projects.count,
        totalPages: Math.ceil(projects.count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Failed to fetch projects", 500);
  }
};

exports.getTransactionsById = async (req,res) =>{
try{
  const {id} = req.params;
  if (!id) {
    return errorResponse(res, "ID is required", 400);
  }

  const transaction = await MaterialTransaction.findOne({
    where: { id: id },
    include: [
      {
          model: ProjectMaterial,
          as: "projectMaterial",
          attributes: ["projectId", "materialId"],
          include: [
            {
              model: Project,
              as: "project",
              attributes: ["id", "projectName"],
            },
            {
              model: CompanyMaterial,
              as: "material",
              attributes: ["id", "materialName","available_quantity"],
            },
          ],
      },
      {
        model: Vehicle,
        as: "Vehicle",
      }
    ],
  });

  if (!transaction) {
    return errorResponse(res, "transaction not found", 404);
  }

  let challanBase64 = null;
    if (transaction.challan && transaction.imageContentType) {
      challanBase64 = `data:${transaction.imageContentType};base64,${transaction.challan.toString(
        "base64"
      )}`;
    }

    return successResponse(res, "Transaction details fetched successfully", {
      ...transaction.toJSON(),
      challan: challanBase64,
      challanContentType: transaction.imageContentType,
    });
    
} catch (error) {
  console.log(error);
  
    errorResponse(res, "Failed to fetch transactions");
  }
};

// exports.getMaterialsAndTransactionsByProjectId = async (req, res) => {
//   try {
//     const { page, limit, offset } = validateQueryParams({ ...req.query });
//     const { projectId } = req.params;

//     if (!projectId) {
//       return errorResponse(res, "Project ID is required", 400);
//     }

//     const { count, rows } = await ProjectMaterial.findAndCountAll({
//       where: { projectId },
//       attributes: [
//         "id",
//         "projectId",
//         "materialId",
//         "assigned_quantity",
//       ],
//       include: [
//         {
//           model: CompanyMaterial,
//           as: "material",
//           attributes: ["id", "materialName", "available_quantity"],
//         },
//         {
//           model: MaterialTransaction,
//           as: "transactions",
//           attributes: [
//             "id",
//             "transactionType",
//             "quantity",
//             "challanNumber",
//             "createdAt",
//           ],
//           order: [["createdAt", "DESC"]],
//         },
//       ],
//       limit,
//       offset,
//     });

//     const result = rows.map((pm) => {
//       let totalReceived = 0;
//       let totalIssued = 0;
//       let totalReturned = 0;

//       (pm.transactions || []).forEach((tx) => {
//         if (tx.transactionType === "receive") totalReceived += tx.quantity;
//         if (tx.transactionType === "issue") totalIssued += tx.quantity;
//         if (tx.transactionType === "return") totalReturned += tx.quantity;
//       });

//       const totalUsed = totalIssued - totalReturned;
//       return {
//         ...pm.toJSON(),
//         totals: {
//           totalReceived,
//           totalIssued,
//           totalReturned,
//           totalUsed,
//         },
//       };
//       });


//     successResponse(
//       res,
//       "Materials and transactions fetched successfully",{
//         materials:result,
//         pagination: {
//           totalRecords: result.length,
//           totalPages: Math.ceil(result.length / limit),
//           currentPage: page,
//           itemsPerPage: limit,
//         },
//     }
//     );
//   } catch (error) {
//     console.error(error);
//     errorResponse(res, "Failed to fetch project materials", 500);
//   }
// };


exports.getMaterialsAndTransactionsByProjectId = async (req, res) => {
  try {
    //search remaining
    const { page, limit, offset ,searchTerm} = validateQueryParams({ ...req.query });
    const { projectId } = req.params;

    const where = {};
    if (searchTerm) {
      // where.material = { [Op.like]: `%${searchTerm}%` };
    }

    if (!projectId) {
      return errorResponse(res, "Project ID is required", 400);
    }

    const { count, rows } = await ProjectMaterial.findAndCountAll({
      where: { projectId },
      attributes: ["id", "projectId", "materialId", "assigned_quantity"],
      include: [
        {
          model: CompanyMaterial,
          as: "material",
          attributes: ["id", "materialName", "available_quantity"],
        },
        {
          model: MaterialTransaction,
          as: "transactions",
          attributes: [
            "id",
            "transactionType",
            "quantity",
            "challanNumber",
            "createdAt",
          ],
          separate: true,
          order: [["createdAt", "DESC"]],
        },
      ],
      distinct: true,
    });

    const result = rows.map((pm) => {
      let totalReceived = 0;
      let totalIssued = 0;
      let totalReturned = 0;

      (pm.transactions || []).forEach((tx) => {
        if (tx.transactionType === "receive") totalReceived += tx.quantity;
        if (tx.transactionType === "issue") totalIssued += tx.quantity;
        if (tx.transactionType === "return") totalReturned += tx.quantity;
      });

      const totalUsed = totalReceived - totalReturned;

      return {
        ...pm.toJSON(),
        totals: {
          totalReceived,
          totalIssued,
          totalReturned,
          totalUsed,
        },
      };
    });

    const { count: countPermanent, rows: rowsPermanent } = await PermanentStock.findAndCountAll({
      
      attributes: ["id", "name", "available_quantity"],
      include:[
        {
          model:PermanentStockTransaction,
          where: { projectId:projectId },
          as:"transactions",
          attributes: ["id", "projectId","stockId", "quantity", "transactionType"],
          required: true,
          
        },  
      ]
    });

    const resultPermanent = rowsPermanent.map((pm) => {
      let totalReceived = 0;
      let totalIssued = 0;
      let totalReturned = 0;
      let totalReceiveToStore = 0;

      (pm.transactions || []).forEach((tx) => {
        if (tx.transactionType === "receive") totalReceived += tx.quantity;
        if (tx.transactionType === "issue") totalIssued += tx.quantity;
        if (tx.transactionType === "return") totalReturned += tx.quantity;
        if (tx.transactionType === "received to store") totalReceiveToStore += tx.quantity;
      });

      const totalUsed = totalReturned;

      return {
        id: pm.id,
        stock: pm.name,
        type: "permanent", 
        totalReceived,
        totalIssued,
        totalReturned,
        totalReceiveToStore,
        totalUsed,
        available:pm.available_quantity || 0,
      };
    });

    const resultConsumable = rows.map((pm) => {
      let totalReceived = 0;
      let totalIssued = 0;
      let totalReturned = 0;
      let totalReceiveToStore = 0;

      (pm.transactions || []).forEach((tx) => {
        if (tx.transactionType === "receive") totalReceived += tx.quantity;
        if (tx.transactionType === "issue") totalIssued += tx.quantity;
        if (tx.transactionType === "return") totalReturned += tx.quantity;
        if (tx.transactionType === "received to store") totalReceiveToStore += tx.quantity;
      });

      const totalUsed = totalReceived - totalReturned;

      return {
        id: pm.materialId, 
        stock: pm.material?.materialName,
        type: "consumable", 
        totalReceived,
        totalIssued,
        totalReturned,
        totalReceiveToStore,
        totalUsed,
        available:pm.material?.available_quantity || 0,
      };
    });

    const mergedData = [...resultConsumable, ...resultPermanent];

    const totalRecords = mergedData.length;

    const paginatedData = mergedData.slice(offset, offset + limit);

    successResponse(res, "Materials and transactions fetched successfully", {
      materials: paginatedData,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Failed to fetch project materials", 500);
  }
};

// exports.getProjectMaterialIssues = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     if (!projectId) {
//       return errorResponse(res, "Project ID is required", 400);
//     }

//     const transactions = await MaterialTransaction.findAll({
//       where: {
//         transactionType: "issue",
//       },
//       attributes: {
//         exclude: ["challan"], 
//       },
//       include: [
//         {
//           model: ProjectMaterial,
//           as: "projectMaterial",
//           where: { projectId },
//           attributes: ["id", "projectId","materialId"],
//           include: [
//             {
//               model: CompanyMaterial,
//               as: "material",
//               attributes: ["id", "materialName"],
//             },
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     const materialMap = {};
//     let totalReceived = 0;
//     let totalIssued = 0;

//     transactions.forEach((t) => {
//       const materialId = t.projectMaterial.material.id;
//       const materialName = t.projectMaterial.material.materialName;
//       const projectMaterialId= t.projectMaterialId

//       if (!materialMap[materialId]) {
//         materialMap[materialId] = {
//           materialId,
//           materialName,
//           totalIssuedQuantity: 0,
//           projectMaterialId,
//           transactions: [],
//         };
//       }

//       materialMap[materialId].totalIssuedQuantity += Number(t.quantity || 0);
//       // materialMap[materialId].transactions.push(t);
//     });

//     const result = Object.values(materialMap);

//     return successResponse(
//       res,
//       "Project material issues fetched successfully",
//       result
//     );
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, "Failed to fetch material issues");
//   }
// };

exports.getProjectMaterialIssues = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { transactionType } = req.query;

    if (!projectId) {
      return errorResponse(res, "Project ID is required", 400);
    }

    const transactions = await MaterialTransaction.findAll({
      where: {
        transactionType: {
          [Op.in]: ["receive", "issue", "return"],
        },
      },
      attributes: {
        exclude: ["challan"],
      },
      include: [
        {
          model: ProjectMaterial,
          as: "projectMaterial",
          where: { projectId },
          attributes: ["id", "projectId", "materialId"],
          include: [
            {
              model: CompanyMaterial,
              as: "material",
              attributes: ["id", "materialName"],
            },
          ],
        },
        
      ],
      order: [["createdAt", "DESC"]],
    });

    const materialMap = {};

    transactions.forEach((t) => {
      const materialId = t.projectMaterial.material.id;
      const materialName = t.projectMaterial.material.materialName;
      const projectMaterialId = t.projectMaterialId;

      if (!materialMap[materialId]) {
        materialMap[materialId] = {
          materialId,
          materialName,
          projectMaterialId,
          totalReceivedQuantity: 0,
          totalIssuedQuantity: 0,
          totalReturnedQuantity: 0,
        };
      }

      if (t.transactionType === "receive") {
        materialMap[materialId].totalReceivedQuantity += Number(t.quantity || 0);
      }

      if (t.transactionType === "issue") {
        materialMap[materialId].totalIssuedQuantity += Number(t.quantity || 0);
      }

      if (t.transactionType === "return") {
         materialMap[materialId].totalReturnedQuantity += Number(t.quantity || 0);
      }
    });

    const result=Object.values(materialMap).map((m) => {
     let availableValue = 0;

      if (transactionType === "receive") {
        availableValue = m.totalIssuedQuantity - m.totalReceivedQuantity;
      }

      if (transactionType === "return") {
        availableValue = m.totalReceivedQuantity - m.totalReturnedQuantity;
      }

      return {
        materialId: m.materialId,
        materialName: m.materialName,
        projectMaterialId: m.projectMaterialId,
        totalReceivedQuantity: m.totalReceivedQuantity,
        totalIssuedQuantity: m.totalIssuedQuantity,
        totalReturnedQuantity: m.totalReturnedQuantity,
        availableValue
      }

    });

    return successResponse(
      res,
      "Project material data fetched successfully",
      result
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch material data");
  }
};

exports.getConsumableMaterialsAndTransactionsByProjectIdAndMaterialId = async (req, res) => {
  try {
    const { projectId ,materialId} = req.params;

    if (!projectId) {
      return errorResponse(res, "Project ID is required", 400);
    }
    if (!materialId) {
      return errorResponse(res, "Matertial ID is required", 400);
    }

    const consumableStock = await ProjectMaterial.findOne({
      where: { projectId, materialId },
      attributes: ["id", "projectId", "materialId", "assigned_quantity"],
      include: [
        {
          model: CompanyMaterial,
          as: "material",
          attributes: ["id", "materialName", "available_quantity"],
        },
        {
          model: MaterialTransaction,
          as: "transactions",
          attributes: [
            "id",
            "transactionType",
            "quantity",
            "challanNumber",
            "createdAt",
          ],
          separate: true,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!consumableStock) {
      return successResponse(res, "No data found", {});
    }

    let totalReceived = 0;
    let totalIssued = 0;
    let totalReturned = 0;
    let totalReceiveToStore = 0;

    (consumableStock.transactions || []).forEach((tx) => {
      if (tx.transactionType === "receive") totalReceived += tx.quantity;
      if (tx.transactionType === "issue") totalIssued += tx.quantity;
      if (tx.transactionType === "return") totalReturned += tx.quantity;
      if (tx.transactionType === "received to store") totalReceiveToStore += tx.quantity;
    });

    const totalUsed = totalReceived - totalReturned;

    const result = {
      name: consumableStock?.material?.materialName,
      available_quantity: consumableStock?.material?.available_quantity,
      totals: {
        totalReceived,
        totalIssued,
        totalReturned,
        totalUsed,
        totalReceiveToStore
      },
      transactions: consumableStock.transactions,
    };

    successResponse(res, "Materials and transactions fetched successfully", result);
  } catch (error) {
    console.error(error);
    errorResponse(res, "Failed to fetch project materials", 500);
  }
};