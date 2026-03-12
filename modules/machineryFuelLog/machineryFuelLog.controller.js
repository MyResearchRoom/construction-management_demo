const { Op, fn, col, where } = require("sequelize");
const { MachineryFuelLog ,Machinery} = require("../../models");
const { successResponse, errorResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");

exports.addMachineryFuelLog = async (req, res) => {
  try {
    const fuelLogData = {
      ...req.body,
      billPhoto: req.file ? req.file.buffer : null,
      imageContentType: req.file ? req.file.mimetype : null,
    };
    const fuelLog = await MachineryFuelLog.create(fuelLogData);
    successResponse(res, "Machinery fuel log added successfully", fuelLog);
  } catch (error) {
    errorResponse(res);
  }
};

exports.getAllMachineryFuelLogs = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { searchTerm, machineId, month, year } = req.query;

    const whereCondition = {};
    const machineWhereCondition = {};

    if(machineId){
      machineWhereCondition.machineId=machineId;
    }

    if (month && year) {
      whereCondition[Op.and] = [
        where(fn("MONTH", col("MachineryFuelLog.createdAt")), month),
        where(fn("YEAR", col("MachineryFuelLog.createdAt")), year),
      ];
    } else if (year) {
      whereCondition[Op.and] = [
        where(fn("YEAR", col("MachineryFuelLog.createdAt")), year),
      ];
    } else if (month) {
      whereCondition[Op.and] = [
        where(fn("MONTH", col("MachineryFuelLog.createdAt")), month),
      ];
    }

    const machineInclude = {
      model: Machinery,
      as: "machine",
      attributes: ["id", "machineName", "registrationNumber", "type", "targetEfficiency", "machineId","capacity"],
      where:machineWhereCondition,
      required:Object.keys(machineWhereCondition).length>0,
    };

    if (searchTerm) {
      machineInclude.where = {
        [Op.or]: [
          { machineName: { [Op.like]: `%${searchTerm}%` } },
          { registrationNumber: { [Op.like]: `%${searchTerm}%` } },
          { type: { [Op.like]: `%${searchTerm}%` } },
        ],
      };
      
      machineInclude.required = true;
    }

    const { count, rows } = await MachineryFuelLog.findAndCountAll({
      where: whereCondition,
      include: [machineInclude],
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    successResponse(res, "Fuel logs fetched successfully", {
      logs: rows,
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

exports.deleteMachineFuelLog = async (req,res) => {
  try{
    const {id}=req.params;
    if(!id){
      return errorResponse(res, "Machine id is required", 400);
    }
    const fuelLog = await MachineryFuelLog.findByPk(id);

    if (!fuelLog) {
      return errorResponse(res, "fuel entry not found", 404);
    }

    await fuelLog.destroy();

    return successResponse(res, "Fuel entry deleted successfully");

  }catch (error) {
    console.log(error); 
    errorResponse(res, "Failed to delete fuel entry", 500);
  }
}
