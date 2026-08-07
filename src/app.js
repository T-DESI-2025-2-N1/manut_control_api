import express from "express";
import authRoutes from "./routes/authRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import equipamentoRoutes from "./routes/equipamentoRoutes.js";
import chamadoRoutes from "./routes/chamadoRoutes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    sistema: "ManutControl",
    status: "online"
  });
});

app.use("/auth", authRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/equipamentos", equipamentoRoutes);
app.use("/chamados", chamadoRoutes);

app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

export default app;
