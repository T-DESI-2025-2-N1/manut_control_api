import { Router } from "express";
import { db } from "../config/db.js";
import { usuarioAutenticado, temPerfil } from "../utils/auth.js";

const router = Router();

async function validarAdministrador(req, res) {
  const usuario = await usuarioAutenticado(req);

  if (!usuario) {
    res.status(401).json({ mensagem: "Usuário não autenticado." });
    return null;
  }

  if (!temPerfil(usuario, ["Administrador"])) {
    res.status(403).json({ mensagem: "Acesso permitido somente ao Administrador." });
    return null;
  }

  return usuario;
}

router.get("/", async (req, res) => {
  try {
    if (!(await validarAdministrador(req, res))) return;

    const [usuarios] = await db.query(
      "SELECT id, nome, email, perfil, ativo FROM usuarios ORDER BY id"
    );

    return res.status(200).json(usuarios);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao listar usuários." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!(await validarAdministrador(req, res))) return;

    const [usuarios] = await db.query(
      "SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = ?",
      [req.params.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    return res.status(200).json(usuarios[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao consultar usuário." });
  }
});

router.post("/", async (req, res) => {
  try {
    if (!(await validarAdministrador(req, res))) return;

    const { nome, email, senha, perfil, ativo = true } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ mensagem: "Dados obrigatórios não informados." });
    }

    const perfis = ["Operador", "Técnico", "Administrador"];

    if (!perfis.includes(perfil)) {
      return res.status(400).json({ mensagem: "Perfil inválido." });
    }

    const [resultado] = await db.query(
      `INSERT INTO usuarios (nome, email, senha, perfil, ativo)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, email, senha, perfil, ativo]
    );

    return res.status(201).json({
      id: resultado.insertId,
      nome,
      email,
      perfil,
      ativo
    });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "E-mail já cadastrado." });
    }

    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao cadastrar usuário." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!(await validarAdministrador(req, res))) return;

    const { nome, email, senha, perfil, ativo } = req.body;

    const [existentes] = await db.query(
      "SELECT * FROM usuarios WHERE id = ?",
      [req.params.id]
    );

    if (existentes.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    const atual = existentes[0];

    await db.query(
      `UPDATE usuarios
       SET nome = ?, email = ?, senha = ?, perfil = ?, ativo = ?
       WHERE id = ?`,
      [
        nome ?? atual.nome,
        email ?? atual.email,
        senha ?? atual.senha,
        perfil ?? atual.perfil,
        ativo ?? atual.ativo,
        req.params.id
      ]
    );

    return res.status(200).json({ mensagem: "Usuário atualizado com sucesso." });
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensagem: "E-mail já cadastrado." });
    }

    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao atualizar usuário." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!(await validarAdministrador(req, res))) return;

    const [resultado] = await db.query(
      "DELETE FROM usuarios WHERE id = ?",
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." });
    }

    return res.status(204).send();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao excluir usuário." });
  }
});

export default router;
