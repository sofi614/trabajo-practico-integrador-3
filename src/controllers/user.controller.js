import { matchedData } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { EventModel } from "../models/event.model.js";
import { hashPassword } from "../helpers/bcrypt.helper.js";

export const getAllUsers = async (req, res) => {
  try {
    // deletedAt: null -> ignoramos a los usuarios eliminados logicamente
    const users = await UserModel.find({ deletedAt: null }).populate("events");

    return res.status(200).json({
      data: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findOne({ _id: id, deletedAt: null }).populate(
      "events",
    );

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { profile, password, ...rest } = matchedData(req, {
      locations: ["body"],
    });

    // verificamos que el usuario exista (y este activo) antes de editarlo
    const user = await UserModel.findOne({ _id: id, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    const fields = { ...rest };

    if (password) {
      fields.password = await hashPassword(password);
    }

    // para el perfil embebido usamos "profile.campo" y asi no pisamos los demas
    if (profile) {
      for (const [key, value] of Object.entries(profile)) {
        fields[`profile.${key}`] = value;
      }
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({
        msg: "No se enviaron datos para actualizar",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: fields },
      { returnDocument: "after", runValidators: true },
    ).populate("events");

    return res.status(200).json({
      msg: "Usuario actualizado correctamente",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findOne({ _id: id, deletedAt: null });

    if (!user) {
      return res.status(404).json({
        msg: "Usuario no encontrado",
      });
    }

    // eliminacion logica: no se borra el documento, $currentDate guarda la fecha actual en deletedAt
    await UserModel.updateOne({ _id: id }, { $currentDate: { deletedAt: true } });

    // eliminacion en cascada: se borran todos los eventos que organizaba
    const deletedEvents = await EventModel.deleteMany({ organizer: id });

    return res.status(200).json({
      msg: "Usuario eliminado correctamente",
      eventsDeleted: deletedEvents.deletedCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
