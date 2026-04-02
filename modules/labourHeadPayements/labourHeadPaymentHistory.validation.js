const { body } = require("express-validator");

exports.addPaymentHistoryValidation = [
  body("laborHeadId")
    .notEmpty()
    .withMessage("Labor head ID is required")
    .isInt()
    .withMessage("Labor head ID must be an integer"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),

  body("paymentMode")
    .notEmpty()
    .withMessage("Payment mode is required")
    .isIn(["cash", "bank", "upi"])
    .withMessage("Payment mode must be cash, bank or upi"),

  body("note")
    .optional()
    .isString()
    .withMessage("Note must be a string"),
];