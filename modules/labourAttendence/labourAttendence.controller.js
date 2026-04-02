const { Op, where } = require("sequelize");
const { Labor, Project,Participant,LaborHead,LaborAttendence, sequelize ,Sequelize} = require("../../models");
const { errorResponse, successResponse } = require("../../utils/response");
const { validateQueryParams } = require("../../utils/validateQueryParams");

// exports.getLaborHeadData = async (req, res) => {
//   try {
//     const { page, limit, offset, searchTerm } = validateQueryParams({
//       ...req.query,
//     });

//     const {projectId} = req.params;

//     const { role, id: userId } = req.user; 
//     const whereClause = {};

//     if(projectId){
//       whereClause.projectId=projectId;
//     }

//     if (role === "PROJECT_MANAGER" || role ==="SITE_MANAGER" || role ==="FINANCE_MANAGER") {
//       const participantProjects = await Participant.findAll({
//         where: { userId },
//         attributes: ["projectId"],
//       });
//       const projectIds = participantProjects.map((p) => p.projectId);

//       whereClause.projectId = projectIds;
//     }

//     // const attendance = await LaborHead.findAll({
//     //   order: [["date", "DESC"]],
//     // });

//     const { count, rows } = await LaborHead.findAndCountAll({
//       where: whereClause,
//       include: [
//         {
//           model: Project,
//           as: "project",
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//       limit,
//       offset,
//     });

//     return successResponse(
//       res,
//       "Labor head fetched successfully",
//       {
//       data: rows,
//       pagination: {
//         totalRecords: count,
//         totalPages: Math.ceil(count / limit),
//         currentPage: page,
//         itemsPerPage: limit,
//       },
//     }
//     );
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, "Failed to fetch labor head");
//   }
// };

// exports.getLaborAttendenceData = async (req, res) => {
//   try {
//     const { page, limit, offset, searchTerm } = validateQueryParams({
//       ...req.query,
//     });

//     const { month, year } = req.query;

//     let whereCondition = {};

//         if (year && !month) {
//             const parsedYear = parseInt(year);
    
//             whereCondition.date = {
//             [Op.between]: [
//                 new Date(parsedYear, 0, 1),
//                 new Date(parsedYear, 11, 31),
//             ],
//             };
//         }
    
//         if (month && year) {
//             const parsedMonth = parseInt(month);
//             const parsedYear = parseInt(year);
    
//             whereCondition.date = {
//             [Op.between]: [
//                 new Date(parsedYear, parsedMonth - 1, 1),
//                 new Date(parsedYear, parsedMonth, 0),
//             ],
//         };
//         }
    
//         if (!year && month) {
//             const parsedMonth = parseInt(month);
    
//             whereCondition = {
//                 ...whereCondition,
//                 [Op.and]: [
//                 Sequelize.where(
//                     Sequelize.fn("MONTH", Sequelize.col("date")),
//                     parsedMonth
//                 ),
//                 ],
//             };
//         }

//     const { role, id: userId } = req.user; 
//     const whereClause = {};

//     if (role === "PROJECT_MANAGER" || role ==="SITE_MANAGER" || role ==="FINANCE_MANAGER") {
//       const participantProjects = await Participant.findAll({
//         where: { userId },
//         attributes: ["projectId"],
//       });
//       const projectIds = participantProjects.map((p) => p.projectId);

//       whereClause.projectId = projectIds;
//     }

//     const { count, rows } = await LaborAttendence.findAndCountAll({
//       where:whereCondition,
//       include: [
//         {
//           model: LaborHead,
//           as: "head",
//           where: whereClause,
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//       limit,
//       offset,
//     });

//     return successResponse(
//       res,
//       "Labor Attendence fetched successfully",
//       {
//       data: rows,
//       pagination: {
//         totalRecords: count,
//         totalPages: Math.ceil(count / limit),
//         currentPage: page,
//         itemsPerPage: limit,
//       },
//     }
//     );
//   } catch (error) {
//     console.error(error);
//     return errorResponse(res, "Failed to fetch labor head");
//   }
// };
exports.getLaborHeadData = async (req, res) => {
  try {
    const { page, limit, offset,searchTerm } = validateQueryParams({
      ...req.query,
    });

    const whereCondition = {};

    if (searchTerm) {
      whereCondition.name = {
        [Op.like]: `%${searchTerm}%`,
      };
    }

    const { count, rows } = await LaborHead.findAndCountAll({
      where:whereCondition,
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return successResponse(res, "Labor head fetched successfully", {
      data: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch labor head");
  }
};

exports.getLaborAttendenceData = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({
      ...req.query,
    });

    const {projectId,month, year } = req.query;

    let whereCondition = {};

    if (year && !month) {
      whereCondition.date = {
        [Op.between]: [
          new Date(year, 0, 1),
          new Date(year, 11, 31),
        ],
      };
    }

    if (month && year) {
      whereCondition.date = {
        [Op.between]: [
          new Date(year, month - 1, 1),
          new Date(year, month, 0),
        ],
      };
    }

    if (!year && month) {
      whereCondition.date = Sequelize.where(
        Sequelize.fn("MONTH", Sequelize.col("date")),
        month
      );
    }

    const { role, id: userId } = req.user; 

    if (role === "PROJECT_MANAGER" || role ==="SITE_MANAGER" || role ==="FINANCE_MANAGER" || role ==="SUPERVISOR") {
      const participantProjects = await Participant.findAll({
        where: { userId },
        attributes: ["projectId"],
      });
      const projectIds = participantProjects.map((p) => p.projectId);

      whereCondition.projectId = projectIds;
    }

    if(projectId)
    {
      whereCondition.projectId=projectId;
    }

    const { count, rows } = await LaborAttendence.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: LaborHead,
          as: "head",
        },
        {
          model:Project,
          as:"project",
          attributes:["projectId","projectName","id"],
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return successResponse(res, "Labor Attendence fetched successfully", {
      data: rows,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch labor head");
  }
};

exports.getAttedanceDataByHeadId = async (req, res) => {
  try {
    const { page, limit, offset } = validateQueryParams({
      ...req.query,
    });

    const {headId}=req.params;

    if (!headId) {
      return errorResponse(res, "Head ID is required", 400);
    }

    const { month, year } = req.query;

    let whereCondition = {};

    if (headId) {
      whereCondition.headId = headId;
    }

    if (year && !month) {
      whereCondition.date = {
        [Op.between]: [
          new Date(year, 0, 1),
          new Date(year, 11, 31),
        ],
      };
    }

    if (month && year) {
      whereCondition.date = {
        [Op.between]: [
          new Date(year, month - 1, 1),
          new Date(year, month, 0),
        ],
      };
    }

    if (!year && month) {
      whereCondition.date = Sequelize.where(
        Sequelize.fn("MONTH", Sequelize.col("date")),
        month
      );
    }

    const { count, rows } = await LaborAttendence.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: LaborHead,
          as: "head",
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const head = await LaborHead.findByPk(headId, {
    });

    if (!head || !rows) {
      return errorResponse(res, "Data not found", 400);
    }

    return successResponse(res, "Labor Attendence fetched successfully", {
      data: {
        attendance:rows,
        head:head,
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
    return errorResponse(res, "Failed to fetch labor head");
  }
};

exports.getLabourHeadById = async (req,res) =>{
  try{
    const {headId}=req.params;
    if (!headId) {
      return errorResponse(res, "Head ID is required", 400);
    }

    const head = await LaborHead.findByPk(headId, {
    });

    return successResponse(res, "Labor Attendence fetched successfully", head);

  } catch (error) {
    console.error(error);
    return errorResponse(res, "Failed to fetch labor head data");
  }
}
