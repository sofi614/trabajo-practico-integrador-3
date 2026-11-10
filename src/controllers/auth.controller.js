import { matchedData } from "express-validator";
import { UserModel } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

// httpOnly: el JavaScript del navegador no puede leer la cookie
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role, profile } = matchedData(req, {
      locations: ["body"],
    });

    // la contraseña se guarda hasheada con bcrypt
    const hashedPassword = await hashPassword(password);

    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role,
      profile,
    });

    // no devolvemos la contraseña en la respuesta
    newUser.password = undefined;

    return res.status(201).json({
      msg: "Usuario registrado correctamente",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = matchedData(req, { locations: ["body"] });

    // el password tiene select: false, por eso se pide con "+password"
    const user = await UserModel.findOne({ email, deletedAt: null }).select(
      "+password",
    );

    // mismo mensaje si falla el email o la contraseña (no revelamos cual es)
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({
        msg: "Credenciales inválidas",
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60,
    });

    user.password = undefined;

    return res.status(200).json({
      msg: "Login exitoso",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // req.user lo carga authMiddleware
    return res.status(200).json({
      data: req.user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const data = matchedData(req, { locations: ["body"] });

    // usamos "profile.campo" para no pisar los demás campos del perfil embebido
    const fields = {};
    for (const [key, value] of Object.entries(data)) {
      fields[`profile.${key}`] = value;
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({
        msg: "No se enviaron datos para actualizar",
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { $set: fields },
      { returnDocument: "after", runValidators: true },
    );

    return res.status(200).json({
      msg: "Perfil actualizado correctamente",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);

    return res.status(200).json({
      msg: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Error interno del servidor",
    });
  }
};
