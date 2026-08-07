import { db } from "../config/db.js";

export async function usuarioAutenticado(req) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace("Bearer ", "").trim();

  if (!token.startsWith("token-")) {
    return null;
  }

  const id = Number(token.replace("token-", ""));

  if (!Number.isInteger(id)) {
    return null;
  }

  const [usuarios] = await db.query(
    "SELECT id, nome, email, perfil, ativo FROM usuarios WHERE id = ?",
    [id]
  );

  return usuarios[0] ?? null;
}

export function temPerfil(usuario, perfis) {
  return usuario && perfis.includes(usuario.perfil);
}
