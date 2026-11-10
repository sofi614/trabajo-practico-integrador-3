import { verifyToken } from "../helpers/jwt.helper.js";
import { UserModel } from "../models/user.model.js";
import { EventModel } from "../models/event.model.js";

// Verifica el JWT que viene en la cookie y deja al usuario en req.user
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        msg: "No autenticado: falta el token",
      });
    }

    let payload;

    try {
      payload = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        msg: "Token invalido o expirado",
      });
    }

    // el usuario debe seguir existiendo y no estar eliminado logicamente
    const user = await UserModel.findOne({ _id: payload.id, deletedAt: null });

    if (!user) {
      return res.status(401).json({
        msg: "No autenticado: el usuario no existe",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

// Solo deja pasar a los administradores (se usa despues de authMiddleware)
export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      msg: "No autorizado: se requiere rol de administrador",
    });
  }

  next();
};

// Deja pasar al organizador del evento o a un admin (se usa despues de authMiddleware)
export const ownerOrAdminMiddleware = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await EventModel.findById(id);

    if (!event) {
      return res.status(404).json({
        msg: "Evento no encontrado",
      });
    }

    const isOwner = event.organizer.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        msg: "No autorizado: solo el organizador o un admin pueden modificar este evento",
      });
    }

    // guardamos el evento para no volver a buscarlo en el controlador
    req.event = event;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
