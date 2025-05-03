import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

dotenv.config();

// 1) Pegamos o caminho do arquivo atual
const __filename = fileURLToPath(import.meta.url);

// 2) Derivamos o "diretório" atual (substituindo o __dirname do CommonJS)
const __dirname = dirname(__filename);

const app = express();

app.use("/", express.static(resolve(__dirname, "dist")));

app.listen(process.env.PORT || 3001, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Rodando...");
});
