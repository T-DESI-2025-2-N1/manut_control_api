import { Router } from "express";
import { db } from "../config/db.js";
import { usuarioAutenticado, temPerfil } from "../utils/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    let sql = "SELECT id, codigo, nome, ativo FROM equipamentos";
    const parametros = [];

    if (req.query.ativo === "true" || req.query.ativo === "false") {
      sql += " WHERE ativo = ?";
      parametros.push(req.query.ativo === "true");
    }

    sql += " ORDER BY id";

    const [equipamentos] = await db.query(sql, parametros);
    return res.status(200).json(equipamentos);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao listar equipamentos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    const [equipamentos] = await db.query(
      "SELECT id, codigo, nome, ativo FROM equipamentos WHERE id = ?",
      [req.params.id]
    );

    if (equipamentos.length === 0) {
      return res.status(404).json({ mensagem: "Equipamento não encontrado." });
    }

    return res.status(200).json(equipamentos[0]);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao consultar equipamento." });
  }
});

router.post("/", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Administrador"])) {
      return res.status(403).json({ mensagem: "Acesso permitido somente ao Administrador." });
    }

    const { codigo, nome, ativo = true } = req.body;

    if (!codigo || !nome) {
      return res.status(400).json({ mensagem: "Código e nome são obrigatórios." });
    }

    const [resultado] = await db.query(
      "INSERT INTO equipamentos (codigo, nome, ativo) VALUES (?, ?, ?)",
      [codigo, nome, ativo]
    );

    return res.status(201).json({
      id: resultado.insertId,
      codigo,
      nome,
      ativo
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao cadastrar equipamento." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Administrador"])) {
      return res.status(403).json({ mensagem: "Acesso permitido somente ao Administrador." });
    }

    const [existentes] = await db.query(
      "SELECT * FROM equipamentos WHERE id = ?",
      [req.params.id]
    );

    if (existentes.length === 0) {
      return res.status(404).json({ mensagem: "Equipamento não encontrado." });
    }

    const atual = existentes[0];
    const { codigo, nome, ativo } = req.body;

    await db.query(
      `UPDATE equipamentos
       SET codigo = ?, nome = ?, ativo = ?
       WHERE id = ?`,
      [
        codigo ?? atual.codigo,
        nome ?? atual.nome,
        ativo ?? atual.ativo,
        req.params.id
      ]
    );

    return res.status(200).json({ mensagem: "Equipamento atualizado com sucesso." });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao atualizar equipamento." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Administrador"])) {
      return res.status(403).json({ mensagem: "Acesso permitido somente ao Administrador." });
    }

    const [resultado] = await db.query(
      "DELETE FROM equipamentos WHERE id = ?",
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: "Equipamento não encontrado." });
    }

    return res.status(204).send();
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao excluir equipamento." });
  }
});

export default router;
