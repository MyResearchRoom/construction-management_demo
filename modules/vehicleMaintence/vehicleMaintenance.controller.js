const { Op } = require("sequelize");
const { Vehicle,VehicleMaintenance, Sequelize } = require("../../models");
const { successResponse, errorResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");

exports.addVehicleMaintenance = async (req, res) => {
  try {
    const {vehicleId,serviceDate,description,cost,garageName,garageContactNumber,nextServiceDate} = req.body;

    const invoice = req.file ? req.file.buffer : null;
    const invoiceContentType = req.file ? req.file.mimetype : null;

    const vehicle = await Vehicle.findOne({
        where: { vehicleId }
    });

    if(!vehicle) {
      return errorResponse(res, "vehicle not found", 400);
    }

    const maintenance = await VehicleMaintenance.create({
        vehicleId,
        serviceDate,
        description,
        cost,
        garageName,
        garageContactNumber,
        nextServiceDate:nextServiceDate? nextServiceDate : null,
        invoice,
        invoiceContentType,
    })

    successResponse(res, "Vehicle maintenance added successfully", maintenance);

  } catch (error) {
      console.log(error);     
      errorResponse(res);
    }
};

// exports.getVehicleMaintenaceListByVehicleId = async (req, res) => {
// try{
//     const { page, limit, offset } = validateQueryParams({ ...req.query });

//     const {vehicleId} = req.params;

//     const vehicle = await Vehicle.findOne({
//         where: { vehicleId },
//         attributes: [
//                 "id",
//                 "vehicleId",
//                 "vehicleName",
//                 "type",
//                 "registrationNumber",
//                 "targetEfficiency",
        
//                 [
//                   Sequelize.fn("COALESCE",
//                     Sequelize.fn("SUM", Sequelize.col("maintenances.cost")),
//                     0
//                   ),
//                   "totalMaintenanceCost",
//                 ],
        
//                 [
//                   Sequelize.fn("COUNT", Sequelize.col("maintenances.id")),
//                   "totalMaintenanceCount",
//                 ],
//         ],
//         include: [
//                 {
//                   model: VehicleMaintenance,
//                   as: "maintenances",
//                   attributes: [], 
//                 },
//         ],
//         group: ["Vehicle.id"],
//     });

//     if(!vehicle) {
//       return errorResponse(res, "vehicle not found", 400);
//     }

//     const { count, rows } = await VehicleMaintenance.findAndCountAll({
//       where: {vehicleId:vehicleId},
//       offset,
//       limit,
//       order: [["updatedAt", "DESC"]],
//     });

//     const maintenanceWithInvoice = rows.map((item) => {
//       const maintenance = item.toJSON();

//       if (maintenance.invoice) {
//         const base64 = maintenance.invoice.toString("base64");
//         maintenance.invoice = `data:${maintenance.invoiceContentType};base64,${base64}`;
//       }

//       return maintenance;
//     });

//     successResponse(res, "Vehicle maintenance fetched successfully", {
//       data: {
//         vehicle:vehicle,
//         vehicleMaintenance: maintenanceWithInvoice,
//       } ,
//       pagination: {
//         totalRecords: count,
//         totalPages: Math.ceil(count / limit),
//         currentPage: page,
//         itemsPerPage: limit,
//       },
//     });

// }catch (error){
//     console.log(error);     
//     errorResponse(res);
// }
// };

exports.getVehicleMaintenaceListByVehicleId = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    const { vehicleId } = req.params;
    const { month, year } = req.query;

    let whereCondition = {
      vehicleId,
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

    const vehicle = await Vehicle.findOne({
      where: { vehicleId },
      attributes: [
        "id",
        "vehicleId",
        "vehicleName",
        "type",
        "registrationNumber",
        "targetEfficiency",
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
          model: VehicleMaintenance,
          as: "maintenances",
          attributes: [],
          // where: dateFilter.serviceDate ? dateFilter : undefined, 
        },
      ],
      group: ["Vehicle.id"],
    });

    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 400);
    }

    const { count, rows } = await VehicleMaintenance.findAndCountAll({
      // where: {
      //   vehicleId,
      //   ...dateFilter,
      // },
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

    return successResponse(res, "Vehicle maintenance fetched successfully", {
      data: {
        vehicle,
        vehicleMaintenance: maintenanceWithInvoice,
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
    return errorResponse(res, "Failed to fetch vehicle maintenance");
  }
};

exports.getAllVehicleMaintenance = async (req, res) => {
  try {
    const maintenance = await VehicleMaintenance.findAll({
      include: ["vehicle"],
    });

    return successResponse(
      res,
      "Vehicle maintenance fetched successfully",
      maintenance
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch vehcle maintenance", 500);
  }
};