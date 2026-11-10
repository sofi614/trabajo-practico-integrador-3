import { body } from "express-validator";
import {
  emailValidation,
  passwordValidation,
  profileValidations,
  usernameValidation,
} from "./auth.validations.js";
import { idParamValidation } from "./common.validations.js";

export const updateUserValidations = [
  idParamValidation,
  usernameValidation(true),
  emailValidation(true),
  passwordValidation(true),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("El rol solo puede ser 'user' o 'admin'"),
  ...profileValidations("profile.", false),
];
