# Guia do aluno — API ManutControl

## 1. Objetivo

Esta API será utilizada para executar os casos de teste elaborados na atividade **Sistema ManutControl — Gestão de chamados de manutenção**.

O sistema pode apresentar comportamentos corretos ou diferentes dos requisitos informados na atividade. O objetivo do teste é comparar o **resultado esperado** com o **resultado obtido**.

## 2. Preparação da API

### Banco de dados

Execute no MySQL:

```text
database/manutcontrol.sql
```

Depois copie:

```text
.env.example
```

para:

```text
.env
```

e ajuste os dados de acesso ao MySQL.

### Iniciar a API

```bash
npm install
npm run dev
```

Endereço padrão:

```text
http://localhost:3001
```

---

## 3. Login

### POST `/auth/login`

Corpo:

```json
{
  "email": "operador@industria.com",  
  "senha": "Operador@123"
}
```

Quando o login for aceito, a  resposta contém um token, por exemplo:

```json
{
  "token": "token-1"
}
```

Para as demais rotas, envie o token no cabeçalho:

```text
Authorization: Bearer token-1
```

---

## 4. Usuários disponíveis

| ID | E-mail | Senha | Perfil | Situação |
|---:|---|---|---|---|
| 1 | `operador@industria.com` | `Operador@123` | Operador | Ativo |
| 2 | `tecnico@industria.com` | `Tecnico@123` | Técnico | Ativo |
| 3 | `bloqueado@industria.com` | `Usuario@123` | Operador | Inativo |
| 4 | `admin@industria.com` | `Admin@123` | Administrador | Ativo |
| 5 | `tecnico2@industria.com` | `Tecnico2@123` | Técnico | Ativo |
| 6 | `operador2@industria.com` | `Operador2@123` | Operador | Ativo |

Os usuários adicionais existem para permitir testes de permissão e de visualização.

---

## 5. Equipamentos iniciais

| ID | Código | Nome | Situação |
|---:|---|---|---|
| 1 | `EQP-001` | Prensa hidráulica | Ativo |
| 2 | `EQP-002` | Esteira transportadora | Inativo |

---

## 6. Rotas de usuários

Estas rotas devem ser utilizadas com o token do Administrador.

| Método | Rota | Finalidade |
|---|---|---|
| GET | `/usuarios` | Listar usuários |
| GET | `/usuarios/:id` | Consultar usuário |
| POST | `/usuarios` | Cadastrar usuário |
| PUT | `/usuarios/:id` | Atualizar usuário |
| DELETE | `/usuarios/:id` | Excluir usuário |

### Exemplo — cadastrar usuário

```json
{
  "nome": "Carlos Souza",
  "email": "carlos@industria.com",
  "senha": "Carlos@123",
  "perfil": "Operador",
  "ativo": true
}
```

Perfis disponíveis:

```text
Operador
Técnico
Administrador
```

---

## 7. Rotas de equipamentos

| Método | Rota | Perfil esperado | Finalidade |
|---|---|---|---|
| GET | `/equipamentos` | Usuário autenticado | Listar equipamentos |
| GET | `/equipamentos?ativo=true` | Usuário autenticado | Listar equipamentos ativos |
| GET | `/equipamentos?ativo=false` | Usuário autenticado | Listar equipamentos inativos |
| GET | `/equipamentos/:id` | Usuário autenticado | Consultar equipamento |
| POST | `/equipamentos` | Administrador | Cadastrar equipamento |
| PUT | `/equipamentos/:id` | Administrador | Atualizar equipamento |
| DELETE | `/equipamentos/:id` | Administrador | Excluir equipamento |

### Exemplo — cadastrar equipamento

```json
{
  "codigo": "EQP-003",
  "nome": "Compressor industrial",
  "ativo": true
}
```

---

## 8. Rotas de chamados

### POST `/chamados`

Perfil esperado: **Operador**

Abre um chamado.

```json
{
  "equipamentoId": 1,
  "descricao": "A prensa apresenta perda de pressão durante o ciclo de operação.",
  "prioridade": "Alta"
}
```

### GET `/chamados/meus`

Perfil esperado: **Operador**

Consulta os chamados do operador.

### GET `/chamados/aguardando`

Perfil esperado: **Técnico**

Lista chamados aguardando atendimento.

### PATCH `/chamados/:id/assumir`

Perfil esperado: **Técnico**

Não necessita de corpo JSON.

Exemplo:

```text
PATCH /chamados/1/assumir
```

### PATCH `/chamados/:id/concluir`

Perfil esperado: **Técnico**

```json
{
  "solucao": "Foi substituído o retentor do cilindro e realizado novo teste operacional."
}
```

### GET `/chamados`

Perfil esperado: **Administrador**

Consulta todos os chamados.

Pode receber filtros:

```text
GET /chamados?status=Aguardando%20atendimento
```

```text
GET /chamados?prioridade=Alta
```

Os filtros podem ser combinados:

```text
GET /chamados?status=Em%20atendimento&prioridade=Média
```

### GET `/chamados/:id`

Consulta um chamado específico.

---

## 9. Prioridades e status

Prioridades previstas na atividade:

```text
Baixa
Média
Alta
Crítica
```

Status previstos:

```text
Aguardando atendimento
Em atendimento
Concluído
```

---

## 10. Dados iniciais úteis

O banco já possui dois chamados:

### Chamado 1

- operador: `operador@industria.com`
- equipamento: `EQP-001`
- prioridade: Alta
- status: Aguardando atendimento

### Chamado 2

- operador: `operador2@industria.com`
- técnico responsável: `tecnico@industria.com`
- equipamento: `EQP-001`
- prioridade: Média
- status: Em atendimento

Esses registros permitem testar consulta por operador, assumir chamado, responsabilidade do técnico, filtros e mudança de status.

---

## 11. Recomendações para execução

Antes de testar, consulte o caso de teste que você elaborou.

Para cada teste:

1. confira as pré-condições;
2. utilize os dados de entrada definidos;
3. execute a rota;
4. registre o código HTTP e a resposta;
5. compare com o resultado esperado;
6. defina o teste como aprovado ou reprovado;
7. registre a evidência.

Quando precisar retornar o banco ao estado original, execute novamente o arquivo:

```text
database/manutcontrol.sql
```
