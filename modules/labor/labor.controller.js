const { Op, where } = require("sequelize");
const { Labor, Project,Participant,LaborHead, sequelize } = require("../../models");
const { errorResponse, successResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");

exports.addLaborSummary = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      contractorName,
      maleWorkersCount,
      femaleWorkersCount,
      wageType,
      headDailyWage,
      maleWorkersWage,
      femaleWorkersWage,
    } = req.body;

    const existingLabor = await LaborHead.findOne({
      where: {
      name: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("name")),
        contractorName.toLowerCase()
      ),
      },
      transaction,
    });

    if (existingLabor) {
      await transaction.rollback();
      return errorResponse(
        res,
        "This head already exists",
        400
      );
    }

    const laborHead = await LaborHead.create(
      {
        name: contractorName,
      },
      { transaction }
    );

    const labor = await Labor.create(
      {
        contractorName,
        laborHeadId:laborHead.id,
        maleWorkersCount,
        femaleWorkersCount,
        wageType,
        headDailyWage,
        maleDailyWage: maleWorkersWage,
        femaleDailyWage: femaleWorkersWage,
      },
      { transaction }
    );

    await transaction.commit();

    return successResponse(res, "Labor summary added successfully", {
      labor,
      laborHead,
    });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return errorResponse(res, "Failed to add labor summary");
  }
};

exports.getAllLaborSummaries = async (req, res) => {
  try {
    const { page, limit, offset, searchTerm } = validateQueryParams({
      ...req.query,
    });
    const whereClause = {};

    if (searchTerm) {
      whereClause[Op.or] = [
        { contractorName: { [Op.like]: `%${searchTerm}%` } },
        { wageType: { [Op.like]: `%${searchTerm}%` } },
      ];
    }
    const { count, rows } = await Labor.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: LaborHead,
          as: "laborHead",
          attributes: ["name","id"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    successResponse(res, "Labor summaries fetched successfully", {
      summery: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.log(error);   
    errorResponse(res, "Failed to fetch labor summaries", 500);
  }
};

exports.getLabors = async (req, res) => {
  try {
    const labors = await Labor.findAll({
      order: [["createdAt", "DESC"]],
    });

    if (!labors.length) {
      return errorResponse(res, "No labor data found for this project");
    }

    return successResponse(res, "Labors fetched successfully", labors);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch labors");
  }
};

exports.getLaborById = async (req, res) => {
  try {
    const { id } = req.params;

    const labor = await Labor.findOne({
      where: {
        laborHeadId: id,
      },
    });
    if (!labor) {
      return errorResponse(res, "Labor data not found");
    }

    return successResponse(res, "Labor fetched successfully", labor);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch labor");
  }
};