import { matchedData } from "express-validator";
import { CategoryModel } from "../models/category.model.js";
import { EventModel } from "../models/event.model.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = matchedData(req, { locations: ["body"] });

    const newCategory = await CategoryModel.create({
      name,
      description,
    });

    return res.status(201).json({
      msg: "Categoría creada correctamente",
      data: newCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();

    return res.status(200).json({
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // virtual populate: trae los eventos que tienen esta categoría
    const category = await CategoryModel.findById(id).populate("events");

    if (!category) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    return res.status(200).json({
      data: category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = matchedData(req, { locations: ["body"] });

    // verificamos que la categoría exista antes de editarla
    const category = await CategoryModel.findById(id);

    if (!category) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    const updatedCategory = await CategoryModel.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json({
      msg: "Categoría actualizada correctamente",
      data: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CategoryModel.findById(id);

    if (!category) {
      return res.status(404).json({
        msg: "Categoría no encontrada",
      });
    }

    // eliminación en cascada: se quita la categoría de todos los eventos que la tenían
    const updatedEvents = await EventModel.updateMany(
      { categories: id },
      { $pull: { categories: id } },
    );

    await CategoryModel.findByIdAndDelete(id);

    return res.status(200).json({
      msg: "Categoría eliminada correctamente",
      eventsUpdated: updatedEvents.modifiedCount,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};