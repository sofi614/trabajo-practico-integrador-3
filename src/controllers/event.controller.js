import { matchedData } from "express-validator";
import { EventModel } from "../models/event.model.js";

export const createEvent = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });

    // el organizador no viene en el body: es el usuario autenticado
    const newEvent = await EventModel.create({
      ...data,
      organizer: req.user._id,
    });

    return res.status(201).json({
      msg: "Evento creado correctamente",
      data: newEvent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await EventModel.find()
      .populate("organizer", "username email")
      .populate("categories", "name description");

    return res.status(200).json({
      data: events,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await EventModel.find({ organizer: req.user._id })
      .populate("organizer", "username email")
      .populate("categories", "name description");

    return res.status(200).json({
      data: events,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await EventModel.findById(id)
      .populate("organizer", "username email")
      .populate("categories", "name description");

    if (!event) {
      return res.status(404).json({
        msg: "Evento no encontrado",
      });
    }

    return res.status(200).json({
      data: event,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, ...rest } = matchedData(req, { locations: ["body"] });

    const fields = { ...rest };

    // para el documento embebido usamos "location.campo" y así no pisamos los demás campos
    if (location) {
      for (const [key, value] of Object.entries(location)) {
        fields[`location.${key}`] = value;
      }
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({
        msg: "No se enviaron datos para actualizar",
      });
    }

    // ownerOrAdminMiddleware ya verifico que el evento existe y que el usuario puede editarlo
    const updatedEvent = await EventModel.findByIdAndUpdate(
      id,
      { $set: fields },
      { returnDocument: "after", runValidators: true },
    )
      .populate("organizer", "username email")
      .populate("categories", "name description");

    return res.status(200).json({
      msg: "Evento actualizado correctamente",
      data: updatedEvent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // eliminacion fisica: el documento se borra de la base de datos
    await EventModel.findByIdAndDelete(id);

    return res.status(200).json({
      msg: "Evento eliminado correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};