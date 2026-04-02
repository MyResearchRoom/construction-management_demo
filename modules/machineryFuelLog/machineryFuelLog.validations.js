const { body, query } = require("express-validator");

exports.addMachineryFuelLogValidation = [
  body("machineId").notEmpty().withMessage("Machine ID is required"),
  body("startReading")
    .isFloat({ gt: 0 })
    .withMessage("Start reading must be a positive number"),
  body("endReading")
    .isFloat({ gt: 0 })
    .withMessage("End reading must be a positive number"),
  body("litersFilled")
    .isFloat({ gt: 0 })
    .withMessage("Liters filled must be a positive number"),
  body("ratePerLiter")
    .isFloat({ gt: 0 })
    .withMessage("Rate per liter must be a positive number"),
  body("fuelSupplier").notEmpty().withMessage("Fuel supplier is required"),
];
