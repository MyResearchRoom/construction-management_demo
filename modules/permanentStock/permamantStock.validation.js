const { body } = require("express-validator");

exports.addTransactionValidation = [
  body("projectId").notEmpty().withMessage("Project ID is required"),
  body("vehicleId").notEmpty().withMessage("Vehicle ID is required"),
  body("stockId").notEmpty().withMessage("Stock id is required"),
  body("transactionType")
    .isIn(["receive", "issue", "return","received to store"])
    .withMessage("Invalid transaction type"),
  body("quantity")
    .isFloat({ gt: 0 })
    .withMessage("Quantity must be greater than 0"),
  body("challanNumber").optional().isString(),
];
