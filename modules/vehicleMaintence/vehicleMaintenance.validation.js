const { body } = require("express-validator");

exports.addVehicleMaintenanceValidation = [
  body("vehicleId")
    .notEmpty()
    .withMessage("Vehicle id is required"),

  body("serviceDate")
    .notEmpty()
    .withMessage("Service date is required"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters long"),

  body("cost")
    .notEmpty()
    .withMessage("Cost is required")
    .custom((value) => parseFloat(value) > 0)
    .withMessage("Cost must be greater than 0"),

  body("garageName")
    .notEmpty()
    .withMessage("Garage name is required"),

  body("garageContactNumber")
    .notEmpty()
    .withMessage("Garage contact number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Garage contact number must be 10 digits"),


];

