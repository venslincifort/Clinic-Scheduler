import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import { authRouter } from "./routes/auth";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));