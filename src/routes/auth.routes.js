import { Router } from "express";
import {
  getProfile,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  loginValidations,
  registerValidations,
  updateProfileValidations,
} from "../middlewares/validations/auth.validations.js";
import { validateFields } from "../middlewares/validate.middleware.js";

export const authRouter = Router();

// Ruta para registrar un usuario (publica)
authRouter.post(
  "/auth/register",
  registerValidations,
  validateFields,
  register,
);

// Ruta para iniciar sesion (publica)
authRouter.post("/auth/login", loginValidations, validateFields, login);

// Ruta para ver el perfil del usuario autenticado
authRouter.get("/auth/profile", authMiddleware, getProfile);

// Ruta para actualizar el perfil del usuario autenticado
authRouter.put(
  "/auth/profile",
  authMiddleware,
  updateProfileValidations,
  validateFields,
  updateProfile,
);

// Ruta para cerrar sesion
authRouter.post("/auth/logout", authMiddleware, logout);
