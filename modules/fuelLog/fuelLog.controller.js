const { FuelLog ,Vehicle} = require("../../models");
const { successResponse, errorResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");
const { Op, fn, col, where } = require("sequelize");

exports.addFuelLog = async (req, res) => {
  try {
    const fuelLogData = {
      ...req.body,
      billPhoto: req.file ? req.file.buffer : null,
      imageContentType: req.file ? req.file.mimetype : null,
    };
    const fuelLog = await FuelLog.create(fuelLogData);
    successResponse(res, "Fuel log added successfully", fuelLog);
  } catch (error) {
    errorResponse(res);
  }
};

// exports.getAllFuelLogs = async (req, res) => {
//   try {
//     const { page, limit, offset } = validateQueryParams({ ...req.query });
//     const { searchTerm } = req.query;

//     const whereCondition = {};

//     const vehicleInclude = {
//       model: Vehicle,
//       as: "vehicle",
//       attributes: ["id", "vehicleName", "registrationNumber", "type", "targetEfficiency", "vehicleId"],
//     };

//     if (searchTerm) {
//       vehicleInclude.where = {
//         [Op.or]: [
//           { vehicleName: { [Op.like]: `%${searchTerm}%` } },
//           { registrationNumber: { [Op.like]: `%${searchTerm}%` } },
//           { type: { [Op.like]: `%${searchTerm}%` } },
//         ],
//       };
      
//       vehicleInclude.required = true;
//     }

//     const { count, rows } = await FuelLog.findAndCountAll({
//       where: whereCondition,
//       include: [vehicleInclude],
//       offset,
//       limit,
//       order: [["createdAt", "DESC"]],
//     });

//     successResponse(res, "Fuel logs fetched successfully", {
//       logs: rows,
//       pagination: {
//         totalRecords: count,
//         totalPages: Math.ceil(count / limit),
//         currentPage: page,
//         itemsPerPage: limit,
//       },
//     });
//   } catch (error) {
//     errorResponse(res);
//   }
// };

exports.getAllFuelLogs = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { searchTerm, vehicleId, month, year } = req.query;

    const whereCondition = {};
    const vehicleWhereCondition = {};

    if (vehicleId) {
      vehicleWhereCondition.vehicleId = vehicleId;
    }

    if (month && year) {
      whereCondition[Op.and] = [
        where(fn("MONTH", col("FuelLog.createdAt")), month),
        where(fn("YEAR", col("FuelLog.createdAt")), year),
      ];
    } else if (year) {
      whereCondition[Op.and] = [
        where(fn("YEAR", col("FuelLog.createdAt")), year),
      ];
    } else if (month) {
      whereCondition[Op.and] = [
        where(fn("MONTH", col("FuelLog.createdAt")), month),
      ];
    }

    const vehicleInclude = {
      model: Vehicle,
      as: "vehicle",
      attributes: [
        "id",
        "vehicleName",
        "registrationNumber",
        "type",
        "targetEfficiency",
        "vehicleId",
      ],
      where: vehicleWhereCondition,
      required: Object.keys(vehicleWhereCondition).length > 0,
    };

    if (searchTerm) {
      vehicleInclude.where = {
        ...vehicleInclude.where,
        [Op.or]: [
          { vehicleName: { [Op.like]: `%${searchTerm}%` } },
          { registrationNumber: { [Op.like]: `%${searchTerm}%` } },
          { type: { [Op.like]: `%${searchTerm}%` } },
        ],
      };
      vehicleInclude.required = true;
    }

    const { count, rows } = await FuelLog.findAndCountAll({
      where: whereCondition,
      include: [vehicleInclude],
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
    console.error(error);
    errorResponse(res);
  }
};

exports.deleteVehicleFuelLog = async (req,res) => {
  try{
    const {id}=req.params;
    if(!id){
      return errorResponse(res, "Fuel id is required", 400);
    }
    const fuelLog = await FuelLog.findByPk(id);

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

exports.getVehicleFuelLogByVehicleId = async (req,res) =>{
  try {
    const { month, year } = req.query;
    const{vehicleId}=req.params;

    if(!vehicleId){
      return errorResponse(res, "Vehicle id is required", 400);
    }
    const whereCondition = {};

    if(vehicleId){
      whereCondition.vehicleId=vehicleId;
    }

    if (month && year) {
      whereCondition[Op.and] = [
        where(fn("MONTH", col("FuelLog.createdAt")), month),
        where(fn("YEAR", col("FuelLog.createdAt")), year),
      ];
    } else if (year) {
      whereCondition[Op.and] = [
        where(fn("YEAR", col("FuelLog.createdAt")), year),
      ];
    } else if (month) {
      whereCondition[Op.and] = [
        where(fn("MONTH", col("FuelLog.createdAt")), month),
      ];
    }

    const vehcileFuelData = await FuelLog.findAll({
      where: whereCondition,
      attributes: {
        exclude: ["billPhoto"],
      },
      include: [
        {
          model: Vehicle,
          as: "vehicle",
        },
      ],
    });

    return successResponse(res, "Fuel entry fetch successfully",vehcileFuelData);

  }catch (error) {
    console.log(error);
    
    errorResponse(res);
  }
};
