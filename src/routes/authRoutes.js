import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        mensagem: "E-mail e senha são obrigatórios."
      });
    }

    const [usuarios] = await db.query(
      "SELECT id, nome, email, senha, perfil, ativo FROM usuarios WHERE email = ?",
      [email]
    );

    const usuario = usuarios[0];

    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({
        mensagem: "E-mail ou senha inválidos."
      });
    }

    if (!usuario.ativo || usuario.ativo == false) {
      return res.status(403).json({
        mensagem: "Este e-mail está inativo."
      });
    }

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",
      token: `token-${usuario.id}`,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: Boolean(usuario.ativo)
      }
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao realizar login." });
  }
});

export default router;
