import { param } from "express-validator";

// Valida que el id recibido por parametro de la ruta sea un ObjectId valido
export const idParamValidation = param("id")
  .isMongoId()
  .withMessage("El ID no es un ObjectId válido");