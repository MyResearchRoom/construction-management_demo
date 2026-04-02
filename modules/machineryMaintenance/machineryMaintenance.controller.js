const { Op } = require("sequelize");
const { Machinery,MachineryMaintenance, Sequelize } = require("../../models");
const { successResponse, errorResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");

exports.addMachineryMaintenance = async (req, res) => {
  try {
    const {machineId,serviceDate,description,cost,garageName,garageContactNumber,nextServiceDate} = req.body;

    const invoice = req.file ? req.file.buffer : null;
    const invoiceContentType = req.file ? req.file.mimetype : null;

    const machine = await Machinery.findOne({
        where: { machineId }
    });

    if(!machine) {
      return errorResponse(res, "Machine not found", 400);
    }

    const maintenance = await MachineryMaintenance.create({
        machineId,
        serviceDate,
        description,
        cost,
        garageName,
        garageContactNumber,
        nextServiceDate:nextServiceDate ? nextServiceDate : null,
        invoice,
        invoiceContentType,
    })

    successResponse(res, "Machinery maintenance added successfully", maintenance);

  } catch (error) {
      console.log(error);     
      errorResponse(res);
    }
};

exports.getMachineryMaintenaceListByMachineId = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { machineId } = req.params;
    const { month, year } = req.query;

    let whereCondition = {
        machineId,
    };

    if (year && !month) {
        const parsedYear = parseInt(year);

        whereCondition.serviceDate = {
        [Op.between]: [
            new Date(parsedYear, 0, 1),
            new Date(parsedYear, 11, 31),
        ],
        };
    }

    if (month && year) {
        const parsedMonth = parseInt(month);
        const parsedYear = parseInt(year);

        whereCondition.serviceDate = {
        [Op.between]: [
            new Date(parsedYear, parsedMonth - 1, 1),
            new Date(parsedYear, parsedMonth, 0),
        ],
    };
    }

    if (!year && month) {
        const parsedMonth = parseInt(month);

        whereCondition = {
            ...whereCondition,
            [Op.and]: [
            Sequelize.where(
                Sequelize.fn("MONTH", Sequelize.col("serviceDate")),
                parsedMonth
            ),
            ],
        };
    }

    const machine = await Machinery.findOne({
      where: { machineId },
      attributes: [
        "id",
        "machineId",
        "machineName",
        "type",
        "registrationNumber",
        "targetEfficiency",
        "capacity",
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.fn("SUM", Sequelize.col("maintenances.cost")),
            0
          ),
          "totalMaintenanceCost",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.col("maintenances.id")
          ),
          "totalMaintenanceCount",
        ],
      ],
      include: [
        {
          model: MachineryMaintenance,
          as: "maintenances",
          attributes: [], 
        },
      ],
      group: ["Machinery.id"],
    });

    if (!machine) {
      return errorResponse(res, "Machine not found", 400);
    }

    const { count, rows } = await MachineryMaintenance.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: [["updatedAt", "DESC"]],
    });

    const maintenanceWithInvoice = rows.map((item) => {
      const maintenance = item.toJSON();

      if (maintenance.invoice) {
        const base64 = maintenance.invoice.toString("base64");

        maintenance.invoice = `data:${maintenance.invoiceContentType};base64,${base64}`;
      }

      return maintenance;
    });

    return successResponse(res, "Machine maintenance fetched successfully", {
      data: {
        machine,
        machineryMaintenance: maintenanceWithInvoice,
      },
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch machine maintenance");
  }
};

exports.getAllMAchineryMaintenance = async (req, res) => {
  try {
    const maintenance = await MachineryMaintenance.findAll({
      include: ["machine"],
    });

    return successResponse(
      res,
      "Machine maintenance fetched successfully",
      maintenance
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch machine maintenance", 500);
  }
};