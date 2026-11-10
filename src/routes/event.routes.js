import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
} from "../controllers/event.controller.js";
import {
  authMiddleware,
  ownerOrAdminMiddleware,
} from "../middlewares/auth.middleware.js";
import { idParamValidation } from "../middlewares/validations/common.validations.js";
import {
  createEventValidations,
  updateEventValidations,
} from "../middlewares/validations/event.validations.js";
import { validateFields } from "../middlewares/validate.middleware.js";

export const eventRouter = Router();

// Ruta para crear un evento
eventRouter.post(
  "/events",
  authMiddleware,
  createEventValidations,
  validateFields,
  createEvent,
);

// Ruta para traer todos los eventos
eventRouter.get("/events", authMiddleware, getAllEvents);

// Ruta para traer los eventos del usuario logueado
eventRouter.get("/events/my", authMiddleware, getMyEvents);

// Ruta para traer un evento por id
eventRouter.get(
  "/events/:id",
  authMiddleware,
  idParamValidation,
  validateFields,
  getEventById,
);

// Ruta para actualizar un evento (solo organizador o admin)
// ownerOrAdminMiddleware va antes de las validaciones porque deja el evento en req.event
eventRouter.put(
  "/events/:id",
  authMiddleware,
  idParamValidation,
  validateFields,
  ownerOrAdminMiddleware,
  updateEventValidations,
  validateFields,
  updateEvent,
);

// Ruta para eliminar un evento (solo organizador o admin)
eventRouter.delete(
  "/events/:id",
  authMiddleware,
  idParamValidation,
  validateFields,
  ownerOrAdminMiddleware,
  deleteEvent,
);