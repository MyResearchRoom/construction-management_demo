const { Op, where, NOW } = require("sequelize");
const { Labor,Participant,User,LaborHead, sequelize ,LaborHeadPaymentHistory,Sequelize} = require("../../models");
const { errorResponse, successResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");

exports.addPaymentHistory = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { laborHeadId, amount, paymentMode, note } = req.body;

    const head = await LaborHead.findByPk(laborHeadId, { transaction });

    if(amount > head.totalRemaining)
    {
        await transaction.rollback();
        return errorResponse(res, "Amount is greater than remaining amount",401);
    }

    if (!head) {
      await transaction.rollback();
      return errorResponse(res, "Labor head not found");
    }

    const paymentHistory = await LaborHeadPaymentHistory.create(
      {
        laborHeadId,
        amount,
        paymentDate: new Date(),
        paymentMode,
        note: note || null,
        creditedBy: req.user.id,
      },
      { transaction }
    );

    const newTotalPaid = Number(head.totalPaid) + Number(amount);
    const newRemaining = Number(head.totalAmount) - newTotalPaid;

    let status = "pending";

    if (newTotalPaid === 0) status = "pending";
    else if (newRemaining <= 0) status = "paid";
    else status = "partial";

    await head.update(
      {
        totalPaid: newTotalPaid,
        totalRemaining: newRemaining,
        status,
      },
      { transaction }
    );

    await transaction.commit();

    return successResponse(
      res,
      "Head payment added successfully",
      paymentHistory
    );
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return errorResponse(res, "Failed to add payment history");
  }
};

exports.getPaymentHistory = async (req,res) =>{
    try{
        const { page, limit, offset, searchTerm } = validateQueryParams({
        ...req.query,
        });
        const {headId}= req.params;

        if (!headId) {
            return errorResponse(res, "Head ID is required", 400);
        }

        const {paymentMode, month, year } = req.query;

        let whereCondition = {};

        whereCondition.laborHeadId=headId;
        
            if (year && !month) {
              whereCondition.paymentDate = {
                [Op.between]: [
                  new Date(year, 0, 1),
                  new Date(year, 11, 31),
                ],
              };
            }
        
            if (month && year) {
              whereCondition.paymentDate = {
                [Op.between]: [
                  new Date(year, month - 1, 1),
                  new Date(year, month, 0),
                ],
              };
            }
        
            if (!year && month) {
              whereCondition.paymentDate = Sequelize.where(
                Sequelize.fn("MONTH", Sequelize.col("paymentDate")),
                month
              );
            }
        if (paymentMode) {
            whereCondition.paymentMode = paymentMode;
        }

        const { count, rows } = await LaborHeadPaymentHistory.findAndCountAll({
            where: whereCondition,
            include: [
            {
                model: LaborHead,
                as: "laborHead",
                attributes:["id","name"],
            },
            {
                model: User,
                as: "creditedUser",   
                attributes:["id","name","role"],           
            },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        return successResponse(res, "Head Payments fetched successfully", {
        data: rows,
        pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });

    } catch (error) {
    console.log(error);   
    errorResponse(res, "Failed to fetch payemtn history", 500);
  }
};
