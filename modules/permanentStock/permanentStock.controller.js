const { Op, where } = require("sequelize");

const { Company,PermanentStockTransaction,PermanentStock,Participant,Project,Vehicle,Dpr,sequelize } = require("../../models");
const { errorResponse, successResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");

exports.savePermanentStock = async(req,res)=>{
 try{
    if (!req.user.companyId) {
      return errorResponse(res, "Company id not found for this user.", 400);
    }

    const { name ,totalQuantity} = req.body;

    if (!name) {
      return errorResponse(res, "Permanent stock name is required.", 400);
    }

    const stockData = {
      companyId: req.user.companyId,
      name,
      totalQuantity,
      available_quantity:totalQuantity,
    };

    const stock=await PermanentStock.create(stockData);

    successResponse(res, "Material added successfully", stock);
  } catch (error) 
  {
    console.log(error);
    
    if (error.name === "SequelizeUniqueConstraintError") {
        return errorResponse(res, "Permanat Stock already exists for this company", 400);
    } else {
        errorResponse(res);
    }
    }
};

exports.getAllPermanentStocks = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { searchTerm } = req.query;

    let whereClause = {};

    if (searchTerm) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${searchTerm}%` } },
      ];
    }

    const { count, rows } = await PermanentStock.findAndCountAll({
      where: whereClause,
      offset,
      limit,
      order: [["updatedAt", "DESC"]],
    });

    successResponse(res, "Permanent stcok data fetched successfully", {
      permanentStcok: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.log(error);
    errorResponse(res);
  }
};

exports.getAllPermanentStockTransactions = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { projectId,stockId ,transactionType} = req.query;
    const { role, id: userId } = req.user;

    const projectWhere = {};
    const stockWhere = {};
    if(stockId)
    {
        stockWhere.stockId=stockId;
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

      stockWhere.projectId = projectIds;
    }

    if (projectId) {
      stockWhere.projectId = projectId;
    }

    const { count, rows } = await PermanentStockTransaction.findAndCountAll({
      where:stockWhere,
      include: [
        {
          model: Dpr,
          as: "dprData",
          // where: Object.keys(projectWhere).length ? projectWhere : undefined,
        },
        {
          model: PermanentStock,
          as: "permanentStock",
        },
        {
            model:Vehicle,
            as:"vehicle",
        },
        {
            model:Project,
            as:"project",
            // where: Object.keys(projectWhere).length ? projectWhere : undefined,
        }
        
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true, 
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

exports.addPermanentStockTransaction = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { projectId, stockId,vehicleId,transactionType, quantity, challanNumber,note } =
      req.body;
    
    const challan = req.file ? req.file.buffer : null;
    const imageContentType = req.file ? req.file.mimetype : null;

    const project = await Project.findByPk(projectId, { transaction: t });
    if(!project) {
      await t.rollback();
      return errorResponse(res, "Project not found", 400);
    }

    let permanentStcok = await PermanentStock.findByPk(stockId, { transaction: t });
    if(!permanentStcok) {
      await t.rollback();
      return errorResponse(res, "Permanent stock not found", 400);
    }

    if(transactionType==="issue"){
    if (permanentStcok.available_quantity < quantity) {
      await t.rollback();
      return errorResponse(res, "Not enough stock", 400);
    }
    }

    if(transactionType === "receive") {
      const transactions = await PermanentStockTransaction.findAll({
        where: { 
          stockId: stockId,
          projectId:projectId,
          transactionType: {
            [Op.in]: ["receive", "issue"]
          }
        },
      });

      if (!transactions || transactions.length === 0) {
        await t.rollback();
        return errorResponse(res, "Permanent stock not issue yet", 400);
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
          `Received quantity is greater than issued quantity (${availableToRecieved})`,
          400
        );
      }
    }

    if(transactionType === "received to store") {
      const transactions = await PermanentStockTransaction.findAll({
        where: { 
          stockId: stockId,
          projectId:projectId,
          transactionType: {
            [Op.in]: ["return", "received to store"]
          }
         },
      });

      if (!transactions || transactions.length === 0) {
        await t.rollback();
        return errorResponse(res, "Permanent stock not return yet", 400);
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

    // if(transactionType === "return") {
    //   const transactions = await MaterialTransaction.findAll({
    //     where: { projectMaterialId: projectMaterial.id }
    //   });

    //   if (!transactions || transactions.length === 0) {
    //     await t.rollback();
    //     return errorResponse(res, "Material not received yet", 400);
    //   }

    //   let totalReceived = 0;
    //   let totalReturned = 0;

    //   transactions.forEach((tx) => {
    //     if (tx.transactionType === "receive") totalReceived += tx.quantity;
    //     if (tx.transactionType === "return") totalReturned += tx.quantity;
    //   });

    //   const availableToReturn = totalReceived - totalReturned;

    //   if (quantity > availableToReturn) {
    //     await t.rollback();
    //     return errorResponse(
    //       res,
    //       `Return material quantity is greater than received quantity (${availableToReturn})`,
    //       400
    //     );
    //   }
    // }

    const transaction = await PermanentStockTransaction.create(
      {
      projectId,
      stockId: stockId,
      
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
      await permanentStcok.decrement(
        {available_quantity: quantity},
        { transaction: t }
      );
      await permanentStcok.increment(
        {totalUsed: quantity},
        { transaction: t }
      );
    }

    if(transactionType==="received to store"){
      await permanentStcok.increment(
        {available_quantity: quantity},
        { transaction: t }
      );
      await permanentStcok.decrement(
        {totalUsed: quantity},
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

exports.editPermanentStock = async (req, res) => {
  try {
    const { id } = req.params;

    const stock = await PermanentStock.findOne({ where: { id } });
    if (!stock) return errorResponse(res, "Permanent stock not found", 404);

    const allowedFields = [
      "name",
      "totalQuantity",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.totalQuantity !== undefined) {
      updateData.available_quantity =
        Number(updateData.totalQuantity) - Number(stock.totalUsed);
    }

    await stock.update(updateData);

    return successResponse(res, "Permanent stock updated successfully", stock);
  } catch (error) {
    console.error(error);
    return errorResponse(res);
  }
};

exports.getPermanentStockById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "Permanent stock ID is required", 400);
    }

    const stock = await PermanentStock.findOne({
      where: { id: id },
    });

    if (!stock) {
      return errorResponse(res, "stock not found", 404);
    }

    return successResponse(
      res,
      "stock details fetched successfully",
      stock
    );
  } catch (error) {
    console.error("Get stock By ID Error:", error);
    return errorResponse(res);
  }
};

exports.getTransactionsById = async (req,res) =>{
try{
  const {id} = req.params;
  if (!id) {
    return errorResponse(res, "ID is required", 400);
  }

  const transaction = await PermanentStockTransaction.findOne({
      where:{id:id},
      include: [
        {
          model: Dpr,
          as: "dprData",
        },
        {
          model: PermanentStock,
          as: "permanentStock",
        },
        {
            model:Vehicle,
            as:"vehicle",
        },
        {
            model:Project,
            as:"project",
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

// exports.getProjectPermanentStockIssues = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     if (!projectId) {
//       return errorResponse(res, "Project ID is required", 400);
//     }

//     const transactions = await PermanentStockTransaction.findAll({
//       where: {
//         projectId,
//         transactionType: {
//           [Op.in]: ["receive", "issue"],
//         },
//       },
//       attributes: {
//         exclude: ["challan"],
//       },
//       include: [
//         {
//           model: PermanentStock,
//           as: "permanentStock",
//           attributes: ["id", "name"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     const stockMap = {};

//     transactions.forEach((t) => {
//       const stockId = t.stockId;
//       const stockName = t.permanentStock.name;

//       if (!stockMap[stockId]) {
//         stockMap[stockId] = {
//           stockId,
//           stockName,
//           totalReceivedQuantity: 0,
//           totalIssuedQuantity: 0,
//           availableToReceive: 0,
//         };
//       }

//       if (t.transactionType === "receive") {
//         stockMap[stockId].totalReceivedQuantity += Number(t.quantity || 0);
//       }

//       if (t.transactionType === "issue") {
//         stockMap[stockId].totalIssuedQuantity += Number(t.quantity || 0);
//       }
//     });

//     Object.values(stockMap).forEach((s) => {
//       s.availableToReceive =
//         s.totalIssuedQuantity - s.totalReceivedQuantity;
//     });

//     const result = Object.values(stockMap);

//     return successResponse(
//       res,
//       "Project permanent stock data fetched successfully",
//       result
//     );
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, "Failed to fetch stock data");
//   }
// };

exports.getProjectPermanentStockIssues = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { transactionType } = req.query;

    if (!projectId) {
      return errorResponse(res, "Project ID is required", 400);
    }

    const transactions = await PermanentStockTransaction.findAll({
      where: {
        projectId,
        transactionType: {
          [Op.in]: ["receive", "issue", "return"],
        },
      },
      attributes: {
        exclude: ["challan"],
      },
      include: [
        {
          model: PermanentStock,
          as: "permanentStock",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const stockMap = {};

    transactions.forEach((t) => {
      const stockId = t.stockId;
      const stockName = t.permanentStock.name;

      if (!stockMap[stockId]) {
        stockMap[stockId] = {
          stockId,
          stockName,
          totalReceivedQuantity: 0,
          totalIssuedQuantity: 0,
          totalReturnedQuantity: 0,
        };
      }

      if (t.transactionType === "receive") {
        stockMap[stockId].totalReceivedQuantity += Number(t.quantity || 0);
      }

      if (t.transactionType === "issue") {
        stockMap[stockId].totalIssuedQuantity += Number(t.quantity || 0);
      }

      if (t.transactionType === "return") {
        stockMap[stockId].totalReturnedQuantity += Number(t.quantity || 0);
      }
    });

    const result = Object.values(stockMap).map((s) => {
      let availableValue = 0;

      if (transactionType === "receive") {
        availableValue = s.totalIssuedQuantity - s.totalReceivedQuantity;
      }

      if (transactionType === "return") {
        availableValue = s.totalReceivedQuantity - s.totalReturnedQuantity;
      }

      return {
        stockId: s.stockId,
        stockName: s.stockName,
        totalReceivedQuantity: s.totalReceivedQuantity,
        totalIssuedQuantity: s.totalIssuedQuantity,
        totalReturnedQuantity: s.totalReturnedQuantity,
        availableValue
      };
    });

    return successResponse(
      res,
      "Project permanent stock data fetched successfully",
      result
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch stock data");
  }
};

exports.getPermanantMaterialsAndTransactionsByProjectIdAndStcokId = async (req, res) => {
  try {
    const { projectId ,stockId} = req.params;

    if (!projectId) {
      return errorResponse(res, "Project ID is required", 400);
    }
    if (!stockId) {
      return errorResponse(res, "Stock ID is required", 400);
    }

    const permanentStock = await PermanentStock.findOne({
      
      attributes: ["id", "name", "available_quantity"],
      include:[
        {
          model:PermanentStockTransaction,
          where: { projectId,stockId },
          as:"transactions",
          attributes: ["id", "projectId","stockId", "quantity", "transactionType","challanNumber","createdAt",],
          required: true,
          
        },  
      ]
    });
    if (!permanentStock) {
      return successResponse(res, "No data found", {});
    }

    let totalReceived = 0;
    let totalIssued = 0;
    let totalReturned = 0;
    let totalReceiveToStore = 0;

    (permanentStock.transactions || []).forEach((tx) => {
      if (tx.transactionType === "receive") totalReceived += tx.quantity;
      if (tx.transactionType === "issue") totalIssued += tx.quantity;
      if (tx.transactionType === "return") totalReturned += tx.quantity;
      if (tx.transactionType === "received to store") totalReceiveToStore += tx.quantity;
    });

    const totalUsed = totalReceived - totalReturned;

    const result = {
      name: permanentStock?.name,
      available_quantity: permanentStock?.available_quantity,
      totals: {
        totalReceived,
        totalIssued,
        totalReturned,
        totalUsed,
        totalReceiveToStore,
      },
      transactions: permanentStock.transactions,
    };

    successResponse(res, "Materials and transactions fetched successfully", result);
  } catch (error) {
    console.error(error);
    errorResponse(res, "Failed to fetch project materials", 500);
  }
};