import { Router } from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/auth.middleware.js";
import { idParamValidation } from "../middlewares/validations/common.validations.js";
import { updateUserValidations } from "../middlewares/validations/user.validations.js";
import { validateFields } from "../middlewares/validate.middleware.js";

export const userRouter = Router();

// Ruta para traer todos los usuarios activos (solo admin)
userRouter.get("/users", authMiddleware, adminMiddleware, getAllUsers);

// Ruta para traer un usuario por id (solo admin)
userRouter.get(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  idParamValidation,
  validateFields,
  getUserById,
);

// Ruta para actualizar un usuario (solo admin)
userRouter.put(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  updateUserValidations,
  validateFields,
  updateUser,
);

// Ruta para eliminar un usuario (solo admin)
userRouter.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  idParamValidation,
  validateFields,
  deleteUser,
);