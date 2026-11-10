import bcrypt from "bcrypt";

//convierte la contraseña en un hash
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

//compara la contraseña ingresada con la guardada
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
