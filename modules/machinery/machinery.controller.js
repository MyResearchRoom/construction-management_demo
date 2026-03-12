const { Machinery,MachineryMaintenance} = require("../../models");
const { successResponse, errorResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");
const { Sequelize } = require("sequelize");

const generateMachineId = async () => {
  const count = await Machinery.count();
  const next = (count + 1).toString().padStart(3, "0");
  return `MACH-${next}`;
};

exports.addMachine = async (req, res) => {
  try {
    const { registrationNumber } = req.body;

    const existingMachine = await Machinery.findOne({
      where: { registrationNumber },
    });

    if (existingMachine) {
      return errorResponse(
        res,
        "Machine already exists with this registration number",
        402
      );
    }
    const machineId = await generateMachineId();
    const machine = await Machinery.create({ ...req.body, machineId });

    successResponse(res, "Machine added successfully", machine);
  } catch (error) {
    console.log(error);
    errorResponse(res);
  }
};

exports.getMachineById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return errorResponse(res, "Machine ID is required", 400);
    }

    const machine = await Machinery.findOne({
      where: { id: id },
    });

    if (!machine) {
      return errorResponse(res, "Machine not found", 404);
    }

    return successResponse(
      res,
      "machine details fetched successfully",
      machine
    );
  } catch (error) {
    console.error("Get machine By ID Error:", error);
    return errorResponse(res);
  }
};

exports.editMachine = async (req, res) => {
  try {
    const { id } = req.params;

    const machine = await Machinery.findOne({ where: { id } });
    if (!machine) return errorResponse(res, "Machine not found", 404);

    const allowedFields = [
      "machineName",
      "type",
      "registrationNumber",
      "targetEfficiency",
      "capacity",
      "status",
    ];

    // console.log(
    //   "reqbody data",req.body
    // );
    

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await machine.update(updateData);

    // console.log(
    //   "updated data",updateData
    // );

    return successResponse(res, "Machine updated successfully", machine);
  } catch (error) {
    console.error(error);
    return errorResponse(res);
  }
};

exports.getAllMachinary = async (req,res)=>{
  try{
    const { page, limit, offset } = validateQueryParams({ ...req.query });

    const queryOptions = {
      order: [["createdAt", "DESC"]],
    };

    if (limit !== null) {
      queryOptions.limit = limit;
      queryOptions.offset = offset;
    }

    const {count,rows } = await Machinery.findAndCountAll(queryOptions);

    successResponse(res,"Machinery fetched successfully",{
      data:rows ,
      pagination: {
        totalRecords: count,
        totalPages: limit ? Math.ceil(count / limit) : 1,
        currentPage: limit ? page : 1,
        itemsPerPage: limit || count,
      },
    });
  } catch(error){
    errorResponse(res);
  }
}

exports.getMachineryWithMaintenanceDetails = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({ ...req.query });
    
    const { count, rows } = await Machinery.findAndCountAll({
      attributes: [
        "id",
        "machineId",
        "machineName",
        "type",
        "registrationNumber",
        "capacity",
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
          model: MachineryMaintenance,
          as: "maintenances",
          attributes: [], 
          required: true,
        },
      ],
      group: ["Machinery.id"],
      offset,
      limit,
      subQuery: false,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    return successResponse(res, "Machinery fetched successfully", {
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
    return errorResponse(res, "Failed to fetch machinery");
  }
};