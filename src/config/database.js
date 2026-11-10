import mongoose from "mongoose";

export const startDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Conectado a la base de datos");
    } catch (error) {
        console.log("Error al conectar a la base de datos", error);
        process.exit(1);
    }
};
