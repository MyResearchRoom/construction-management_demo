const { body } = require("express-validator");

exports.addMachineValidation = [
  body("machineName").notEmpty().withMessage("Machine name is required"),
  body("type").notEmpty().withMessage("Machine type is required"),
  body("registrationNumber")
    .notEmpty()
    .withMessage("Registration number is required"),
  body("targetEfficiency")
    .isFloat({ gt: 0 })
    .withMessage("Target efficiency must be a positive number"),
  body("capacity")
    .notEmpty()
    .withMessage("Capacity is required"),
];

exports.editMachineValidation = [
  body("machineName")
    .optional()
    .notEmpty()
    .withMessage("MAchine name cannot be empty"),
  body("type")
    .optional()
    .notEmpty()
    .withMessage("Machine type cannot be empty"),
  body("registrationNumber")
    .optional()
    .notEmpty()
    .withMessage("Registration number cannot be empty"),
  body("targetEfficiency")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Target efficiency must be a positive number"),
  body("capacity")
    .optional()
    .notEmpty()
    .withMessage("Capacity cannot be empty"),
];
