import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import "dotenv/config";
import { startDB } from "./src/config/database.js";
import { authRouter } from "./src/routes/auth.routes.js";
import { userRouter } from "./src/routes/user.routes.js";
import { categoryRouter } from "./src/routes/category.routes.js";
import { eventRouter } from "./src/routes/event.routes.js";

const app = express();
const PORT = process.env.PORT || 3003;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

//rutas
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", categoryRouter);
app.use("/api", eventRouter);

app.listen(PORT, async () => {
  await startDB();
  console.log(`Servidor listo en el puerto ${PORT}`);
});
