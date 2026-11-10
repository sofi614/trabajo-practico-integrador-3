import { body } from "express-validator";
import { UserModel } from "../../models/user.model.js";

const onlyLetters = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

export const profileValidations = (prefix = "profile.", required = true) => {
  const field = (name) =>
    required ? body(`${prefix}${name}`) : body(`${prefix}${name}`).optional();

  return [
    field("firstName")
      .trim()
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 2, max: 50 })
      .withMessage("El nombre debe tener entre 2 y 50 caracteres")
      .matches(onlyLetters)
      .withMessage("El nombre solo puede contener letras"),

    field("lastName")
      .trim()
      .notEmpty()
      .withMessage("El apellido es obligatorio")
      .isLength({ min: 2, max: 50 })
      .withMessage("El apellido debe tener entre 2 y 50 caracteres")
      .matches(onlyLetters)
      .withMessage("El apellido solo puede contener letras"),

    body(`${prefix}birthDate`)
      .optional()
      .isISO8601()
      .withMessage("La fecha de nacimiento no es válida (formato AAAA-MM-DD)")
      .custom((value) => {
        if (new Date(value) > new Date()) {
          throw new Error("La fecha de nacimiento no puede ser futura");
        }
        return true;
      })
      .toDate(),

    body(`${prefix}phone`)
      .optional()
      .matches(/^\d{8,15}$/)
      .withMessage("El teléfono debe tener solo números, entre 8 y 15 dígitos"),
  ];
};

// "optional" = true cuando el campo no es obligatorio (actualización de usuario)
export const usernameValidation = (optional = false) => {
  const chain = optional ? body("username").optional() : body("username");

  return chain
    .trim()
    .notEmpty()
    .withMessage("El username es obligatorio")
    .isLength({ min: 3, max: 20 })
    .withMessage("El username debe tener entre 3 y 20 caracteres")
    .isAlphanumeric()
    .withMessage("El username solo puede tener letras y números")
    .toLowerCase()
    .custom(async (username, { req }) => {
      // al actualizar, se excluye al propio usuario de la búsqueda
      const filter = { username };
      if (req.params.id) filter._id = { $ne: req.params.id };

      const exists = await UserModel.findOne(filter);
      if (exists) {
        throw new Error("El username ya está en uso");
      }
      return true;
    });
};

export const emailValidation = (optional = false) => {
  const chain = optional ? body("email").optional() : body("email");

  return chain
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .toLowerCase()
    .custom(async (email, { req }) => {
      const filter = { email };
      if (req.params.id) filter._id = { $ne: req.params.id };

      const exists = await UserModel.findOne(filter);
      if (exists) {
        throw new Error("El email ya está registrado");
      }
      return true;
    });
};

export const passwordValidation = (optional = false) => {
  const chain = optional ? body("password").optional() : body("password");

  return chain
    .notEmpty()
    .withMessage("La contraseña es obligatoria")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número",
    );
};

export const registerValidations = [
  usernameValidation(),
  emailValidation(),
  passwordValidation(),

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("El rol solo puede ser 'user' o 'admin'"),

  ...profileValidations("profile.", true),
];

export const loginValidations = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("El email es obligatorio")
    .isEmail()
    .withMessage("El email no tiene un formato válido")
    .toLowerCase(),

  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];

// PUT /auth/profile: los campos del perfil vienen sueltos en el body (sin "profile.")
export const updateProfileValidations = [...profileValidations("", false)];
