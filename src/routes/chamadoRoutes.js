import { Router } from "express";
import { db } from "../config/db.js";
import { usuarioAutenticado, temPerfil } from "../utils/auth.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Operador"])) {
      return res.status(403).json({ mensagem: "Somente Operador pode abrir chamado." });
    }

    const { equipamentoId, descricao, prioridade } = req.body;

    if (!equipamentoId || !descricao || !prioridade) {
      return res.status(400).json({
        mensagem: "Equipamento, descrição e prioridade são obrigatórios."
      });
    }

    if (descricao.length < 20 || descricao.length > 300) {
      return res.status(400).json({
        mensagem: "A descrição deve possuir entre 20 e 300 caracteres."
      });
    }

    const prioridades = ["Baixa", "Média", "Alta", "Crítica"];

    if (!prioridades.includes(prioridade)) {
      return res.status(400).json({ mensagem: "Prioridade inválida." });
    }

    const [equipamentos] = await db.query(
      "SELECT id, ativo FROM equipamentos WHERE id = ?",
      [equipamentoId]
    );

    if (equipamentos.length === 0) {
      return res.status(404).json({ mensagem: "Equipamento não encontrado." });
    }

    if(!equipamentos[0].ativo){
      return res.status(400).json({ mensagem: "Equipamento INATIVO. Não é possível abrir o chamado" });
    }

    const [resultado] = await db.query(
      `INSERT INTO chamados
       (equipamento_id, operador_id, descricao, prioridade, status, data_abertura)
       VALUES (?, ?, ?, ?, 'Aguardando atendimento', NOW())`,
      [equipamentoId, usuario.id, descricao, prioridade]
    );

    return res.status(201).json({
      id: resultado.insertId,
      equipamentoId,
      operadorId: usuario.id,
      descricao,
      prioridade,
      status: "Aguardando atendimento"
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao abrir chamado." });
  }
});

router.get("/meus", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Operador"])) {
      return res.status(403).json({ mensagem: "Somente Operador pode usar esta consulta." });
    }

    const [chamados] = await db.query(`
      SELECT
        c.id,
        c.descricao,
        c.prioridade,
        c.status,
        c.data_abertura,
        c.data_conclusao,
        e.codigo AS equipamento_codigo,
        e.nome AS equipamento_nome,
        c.operador_id,
        c.tecnico_id
      FROM chamados c 
      INNER JOIN equipamentos e ON e.id = c.equipamento_id WHERE c.operador_id = ?
      ORDER BY c.id
    `, usuario.id);

    return res.status(200).json(chamados);

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao consultar chamados." });
  }
});

router.get("/aguardando", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Técnico"])) {
      return res.status(403).json({ mensagem: "Somente Técnico pode consultar esta lista." });
    }

    const [chamados] = await db.query(`
      SELECT
        c.id,
        c.descricao,
        c.prioridade,
        c.status,
        e.codigo AS equipamento_codigo,
        e.nome AS equipamento_nome
      FROM chamados c
      INNER JOIN equipamentos e ON e.id = c.equipamento_id
      WHERE c.status = 'Aguardando atendimento'
      ORDER BY c.id
    `);

    return res.status(200).json(chamados);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao listar chamados." });
  }
});

router.get("/", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Administrador"])) {
      return res.status(403).json({ mensagem: "Somente Administrador pode consultar todos os chamados." });
    }

    let sql = `
      SELECT
        c.id,
        c.descricao,
        c.prioridade,
        c.status,
        c.solucao,
        c.data_abertura,
        c.data_conclusao,
        e.codigo AS equipamento_codigo,
        e.nome AS equipamento_nome,
        op.nome AS operador_nome,
        tec.nome AS tecnico_nome
      FROM chamados c
      INNER JOIN equipamentos e ON e.id = c.equipamento_id
      INNER JOIN usuarios op ON op.id = c.operador_id
      LEFT JOIN usuarios tec ON tec.id = c.tecnico_id
      WHERE 1 = 1
    `;

    const parametros = [];

    if (req.query.status) {
      sql += " AND c.status = ?";
      parametros.push(req.query.status);
    }

    if (req.query.prioridade) {
      sql += " AND c.prioridade = ?";
      parametros.push(req.query.prioridade);
    }

    sql += " ORDER BY c.id";

    const [chamados] = await db.query(sql, parametros);
    return res.status(200).json(chamados);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao consultar chamados." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    const [chamados] = await db.query(
      `SELECT c.*, e.codigo AS equipamento_codigo, e.nome AS equipamento_nome
       FROM chamados c
       INNER JOIN equipamentos e ON e.id = c.equipamento_id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (chamados.length === 0) {
      return res.status(404).json({ mensagem: "Chamado não encontrado." });
    }

    const chamado = chamados[0];

    if (
      usuario.perfil === "Operador" &&
      chamado.operador_id !== usuario.id
    ) {
      return res.status(403).json({
        mensagem: "O operador não pode visualizar chamado de outro usuário."
      });
    }

    return res.status(200).json(chamado);
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao consultar chamado." });
  }
});

router.patch("/:id/assumir", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Técnico"])) {
      return res.status(403).json({ mensagem: "Somente Técnico pode assumir chamado." });
    }

    const [chamados] = await db.query(
      "SELECT id, status FROM chamados WHERE id = ?",
      [req.params.id]
    );

    if (chamados.length === 0) {
      return res.status(404).json({ mensagem: "Chamado não encontrado." });
    }

    if (chamados[0].status !== "Aguardando atendimento") {
      return res.status(400).json({
        mensagem: "Somente chamado aguardando atendimento pode ser assumido."
      });
    }

    await db.query(
      `UPDATE chamados
       SET tecnico_id = ?, status = 'Em atendimento'
       WHERE id = ?`,
      [usuario.id, req.params.id]
    );

    return res.status(200).json({
      mensagem: "Chamado assumido com sucesso.",
      status: "Em atendimento",
      tecnicoId: usuario.id
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao assumir chamado." });
  }
});

router.patch("/:id/concluir", async (req, res) => {
  try {
    const usuario = await usuarioAutenticado(req);

    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não autenticado." });
    }

    if (!temPerfil(usuario, ["Técnico"])) {
      return res.status(403).json({ mensagem: "Somente Técnico pode concluir chamado." });
    }

    const { solucao } = req.body;

    if (!solucao) {
      return res.status(400).json({ mensagem: "A solução aplicada é obrigatória." });
    }

    if (solucao.length < 29) {
      return res.status(400).json({
        mensagem: "A solução deve possuir no mínimo 30 caracteres."
      });
    }

    const [chamados] = await db.query(
      "SELECT id, status, tecnico_id FROM chamados WHERE id = ?",
      [req.params.id]
    );

    if (chamados.length === 0) {
      return res.status(404).json({ mensagem: "Chamado não encontrado." });
    }

    const chamado = chamados[0];

    if (chamado.status !== "Em atendimento") {
      return res.status(400).json({
        mensagem: "Somente chamado em atendimento pode ser concluído."
      });
    }

    await db.query(
      `UPDATE chamados
       SET solucao = ?, status = 'Concluído', data_conclusao = NOW()
       WHERE id = ?`,
      [solucao, req.params.id]
    );

    return res.status(200).json({
      mensagem: "Chamado concluído com sucesso.",
      status: "Concluído"
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ mensagem: "Erro ao concluir chamado." });
  }
});

export default router;
