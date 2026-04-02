const { Vehicle ,VehicleMaintenance,FuelLog} = require("../../models");
const { successResponse, errorResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");
const { Sequelize } = require("sequelize");
const generateVehicleId = async () => {
  const count = await Vehicle.count();
  const next = (count + 1).toString().padStart(3, "0");
  return `VEH-${next}`;
};

exports.addVehicle = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const existingVehicle = await Vehicle.findOne({
      where: { registrationNumber },
    });

    if (existingVehicle) {
      return errorResponse(
        res,
        "Vehicle already exists with this registration number",
        402
      );
    }
    const vehicleId = await generateVehicleId();
    const vehicle = await Vehicle.create({ ...req.body, vehicleId });

    successResponse(res, "Vehicle added successfully", vehicle);
  } catch (error) {
    console.log(error);
    
    errorResponse(res);
  }
};

exports.editVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findOne({ where: { id } });
    if (!vehicle) return errorResponse(res, "Vehicle not found", 404);

    const allowedFields = [
      "vehicleName",
      "type",
      "registrationNumber",
      "targetEfficiency",
      "status",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await vehicle.update(updateData);

    return successResponse(res, "Vehicle updated successfully", vehicle);
  } catch (error) {
    console.error(error);
    return errorResponse(res);
  }
};

// exports.getAllVehicles = async (req, res) => {
//   try {
//     const vehicles = await Vehicle.findAll({ order: [["createdAt", "DESC"]] });
//     successResponse(res, "Vehicles fetched successfully", vehicles);
//   } catch (error) {
//     errorResponse(res);
//   }
// };


//with pagination

// exports.getAllVehicles = async (req, res) => {
//   try {
//     const { page, limit, offset } = validateQueryParams({ ...req.query });
    
//     const queryOptions = {
//       order: [["createdAt", "DESC"]],
//     };

//     if (limit !== null) {
//       queryOptions.limit = limit;
//       queryOptions.offset = offset;
//     }

//     const {count,rows } = await Vehicle.findAndCountAll(queryOptions);

//     successResponse(res, "Vehicles fetched successfully", {
//       data: rows,
//       pagination: {
//         totalRecords: count,
//         totalPages: limit ? Math.ceil(count / limit) : 1,
//         currentPage: limit ? page : 1,
//         itemsPerPage: limit || count,
//       },
//     });
//   } catch (error) {
//     errorResponse(res);
//   }
// };

exports.getAllVehicles = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    
    const queryOptions = {
      order: [["createdAt", "DESC"]],
      subQuery: false, 
      include: [
        {
          model: FuelLog,
          as: "fuelLogs",
          attributes: [], 
        },
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`
              ROUND(
                COALESCE(
                  SUM(fuelLogs.totalKmReading) / 
                  NULLIF(SUM(fuelLogs.litersFilled), 0),
                  0
                ), 2
              )
            `),
            "avgEfficiency",
          ],
        ],
      },
      group: ["Vehicle.id"],
    };

    if (limit !== null) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const {count,rows } = await Vehicle.findAndCountAll(queryOptions);

    successResponse(res, "Vehicles fetched successfully", {
      data: rows,
      pagination: {
        totalRecords: count.length || count,
        totalPages: limit ? Math.ceil((count.length || count) / limit) : 1,
        currentPage: limit ? page : 1,
        itemsPerPage: limit || (count.length || count),
      },
    });
  } catch (error) {
    errorResponse(res);
  }
};

//new by JB
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "Vehicle ID is required", 400);
    }

    const vehicle = await Vehicle.findOne({
      where: { id: id },
    });

    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    return successResponse(
      res,
      "Vehicle details fetched successfully",
      vehicle
    );
  } catch (error) {
    console.error("Get Vehicle By ID Error:", error);
    return errorResponse(res);
  }
};

exports.getVehiclesWithMaintenanceDetails = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    
    const { count, rows } = await Vehicle.findAndCountAll({
      attributes: [
        "id",
        "vehicleId",
        "vehicleName",
        "type",
        "registrationNumber",

        [
          Sequelize.fn("COALESCE",
            Sequelize.fn("SUM", Sequelize.col("maintenances.cost")),
            0
          ),
          "totalMaintenanceCost",
        ],

        [
          Sequelize.fn("COUNT", Sequelize.col("maintenances.id")),
          "totalMaintenanceCount",
        ],
      ],
      include: [
        {
          model: VehicleMaintenance,
          as: "maintenances",
          attributes: [], 
          required: true,
        },
      ],
      group: ["Vehicle.id"],
      offset,
      limit,
      subQuery: false,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    return successResponse(res, "Vehicles fetched successfully", {
      data: rows,
      pagination: {
        totalRecords: count.length, 
        totalPages: Math.ceil(count.length / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch vehicles");
  }
};
