# ManutControl — API para atividade de Teste de Sistemas

Projeto didático em Node.js, JavaScript, Express e MySQL.

A organização foi mantida simples, próxima ao padrão trabalhado em aula:
rotas com a lógica HTTP e SQL no mesmo arquivo, conexão separada e poucos arquivos auxiliares.

## Estrutura

```text
manutcontrol-api-atividade-1-sasse/
├── database/
│   └── manutcontrol.sql
├── src/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── equipamentoRoutes.js
│   │   └── chamadoRoutes.js
│   ├── utils/
│   │   └── auth.js
│   ├── app.js
│   └── server.js
├── .env.example
├── GUIA-DO-ALUNO.md
└── package.json
```

## Preparação

1. Execute o arquivo `database/manutcontrol.sql` no MySQL.
2. Copie `.env.example` para `.env`.
3. Ajuste usuário, senha, porta e nome do banco.
4. Execute:

```bash
npm install
npm run dev
```
