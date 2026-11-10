import { body } from "express-validator";
import { CategoryModel } from "../../models/category.model.js";

export const createCategoryValidations = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre debe tener entre 2 y 30 caracteres")
    .custom(async (name) => {
      const exists = await CategoryModel.findOne({ name });
      if (exists) {
        throw new Error("Ya existe una categoría con ese nombre");
      }
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La descripción puede tener como máximo 200 caracteres"),
];

export const updateCategoryValidations = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("El nombre debe tener entre 2 y 30 caracteres")
    .custom(async (name, { req }) => {
      const exists = await CategoryModel.findOne({
        name,
        _id: { $ne: req.params.id },
      });
      if (exists) {
        throw new Error("Ya existe una categoría con ese nombre");
      }
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La descripción puede tener como máximo 200 caracteres"),
];
