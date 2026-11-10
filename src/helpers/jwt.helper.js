import jwt from "jsonwebtoken";

//genera un token firmado con JWT_SECRET, expira según JWT_EXPIRES_IN
export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

//verifica el token: devuelve el payload o lanza un error si es inválido o expiró
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};