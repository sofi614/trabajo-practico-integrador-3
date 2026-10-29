import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import "dotenv/config";
import { startDB } from './src/config/database';

const app = express();
const PORT = process.env.PORT || 30000 ; 

app.listen(PORT , async () => {
    await startDB();
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});