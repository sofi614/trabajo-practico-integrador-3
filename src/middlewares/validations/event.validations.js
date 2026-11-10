import { body } from "express-validator";
import { EventModel } from "../../models/event.model.js";
import { CategoryModel } from "../../models/category.model.js";

// custom(): las categorías enviadas deben existir en la base de datos
const categoriesExist = async (categories) => {
  // Si algún ID es inválido lo informa la validación "categories.*"
  const allValid = categories.every((id) => /^[a-f\d]{24}$/i.test(id));
  if (!allValid) return true;

  const uniqueIds = [...new Set(categories)];
  const count = await CategoryModel.countDocuments({ _id: { $in: uniqueIds } });

  if (count !== uniqueIds.length) {
    throw new Error("Una o más categorías no existen");
  }
  return true;
};

export const createEventValidations = [
  body("title")
    .trim()
    .notEmpty().withMessage("El título es obligatorio")
    .isLength({ min: 3, max: 150 }).withMessage("El título debe tener entre 3 y 150 caracteres")
    .custom(async (title) => {
      const exists = await EventModel.findOne({ title });
      if (exists) {
        throw new Error("Ya existe un evento con ese título");
      }
      return true;
    }),

  body("description")
    .trim()
    .notEmpty().withMessage("La descripción es obligatoria")
    .isLength({ min: 20 }).withMessage("La descripción debe tener al menos 20 caracteres"),

  body("startDate")
    .notEmpty().withMessage("La fecha de inicio es obligatoria")
    .isISO8601().withMessage("La fecha de inicio no es válida")
    .toDate(),

  body("endDate")
    .notEmpty().withMessage("La fecha de fin es obligatoria")
    .isISO8601().withMessage("La fecha de fin no es válida")
    .toDate()
    // custom(): endDate debe ser posterior a startDate
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }
      return true;
    }),

  body("capacity")
    .notEmpty().withMessage("La capacidad es obligatoria")
    .isInt({ min: 1 }).withMessage("La capacidad debe ser un número entero mayor o igual a 1")
    .toInt(),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio debe ser un número mayor o igual a 0")
    .toFloat(),

  body("status")
    .optional()
    .isIn(["scheduled", "cancelled", "finished"])
    .withMessage("El estado solo puede ser 'scheduled', 'cancelled' o 'finished'"),

  // Documento embebido location
  body("location.venue")
    .trim()
    .notEmpty().withMessage("El lugar (venue) es obligatorio")
    .isLength({ min: 3, max: 100 }).withMessage("El lugar debe tener entre 3 y 100 caracteres"),

  body("location.address")
    .trim()
    .notEmpty().withMessage("La dirección es obligatoria")
    .isLength({ min: 5, max: 150 }).withMessage("La dirección debe tener entre 5 y 150 caracteres"),

  body("location.city")
    .trim()
    .notEmpty().withMessage("La ciudad es obligatoria")
    .isLength({ min: 2, max: 50 }).withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("categories")
    .optional()
    .isArray().withMessage("Las categorías deben enviarse en un array")
    .bail()
    .custom(categoriesExist),

  body("categories.*").isMongoId().withMessage("Cada categoría debe ser un ObjectId válido"),
];

// En la actualización todo es opcional.
// req.event lo carga ownerOrAdminMiddleware (se ejecuta antes)
export const updateEventValidations = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage("El título debe tener entre 3 y 150 caracteres")
    .custom(async (title, { req }) => {
      const exists = await EventModel.findOne({
        title,
        _id: { $ne: req.params.id },
      });
      if (exists) {
        throw new Error("Ya existe un evento con ese título");
      }
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 20 }).withMessage("La descripción debe tener al menos 20 caracteres"),

  // custom(): si solo se envía startDate, se compara con el endDate guardado
  body("startDate")
    .optional()
    .isISO8601().withMessage("La fecha de inicio no es válida")
    .toDate()
    .custom((startDate, { req }) => {
      if (req.body.endDate) return true; // lo valida endDate
      if (new Date(req.event.endDate) <= new Date(startDate)) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin del evento");
      }
      return true;
    }),

  // custom(): endDate posterior al startDate nuevo o al guardado
  body("endDate")
    .optional()
    .isISO8601().withMessage("La fecha de fin no es válida")
    .toDate()
    .custom((endDate, { req }) => {
      const start = req.body.startDate || req.event.startDate;
      if (new Date(endDate) <= new Date(start)) {
        throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
      }
      return true;
    }),

  body("capacity")
    .optional()
    .isInt({ min: 1 }).withMessage("La capacidad debe ser un número entero mayor o igual a 1")
    .toInt(),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio debe ser un número mayor o igual a 0")
    .toFloat(),

  body("status")
    .optional()
    .isIn(["scheduled", "cancelled", "finished"])
    .withMessage("El estado solo puede ser 'scheduled', 'cancelled' o 'finished'"),

  body("location.venue")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El lugar debe tener entre 3 y 100 caracteres"),

  body("location.address")
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 }).withMessage("La dirección debe tener entre 5 y 150 caracteres"),

  body("location.city")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  body("categories")
    .optional()
    .isArray().withMessage("Las categorías deben enviarse en un array")
    .bail()
    .custom(categoriesExist),

  body("categories.*").isMongoId().withMessage("Cada categoría debe ser un ObjectId válido"),
];
