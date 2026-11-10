import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/auth.middleware.js";
import {
  createCategoryValidations,
  updateCategoryValidations,
} from "../middlewares/validations/category.validations.js";
import { idParamValidation } from "../middlewares/validations/common.validations.js";
import { validateFields } from "../middlewares/validate.middleware.js";

export const categoryRouter = Router();

// Ruta para crear una categoria (solo admin)
categoryRouter.post(
  "/categories",
  authMiddleware,
  adminMiddleware,
  createCategoryValidations,
  validateFields,
  createCategory,
);

// Ruta para traer todas las categorias
categoryRouter.get("/categories", authMiddleware, getAllCategories);

// Ruta para traer una categoria por id con sus eventos
categoryRouter.get(
  "/categories/:id",
  authMiddleware,
  idParamValidation,
  validateFields,
  getCategoryById,
);

// Ruta para actualizar una categoria (solo admin)
categoryRouter.put(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  idParamValidation,
  updateCategoryValidations,
  validateFields,
  updateCategory,
);

// Ruta para eliminar una categoria (solo admin)
categoryRouter.delete(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  idParamValidation,
  validateFields,
  deleteCategory,
);