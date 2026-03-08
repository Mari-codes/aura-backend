# AURA Backend

## Leia em outros idiomas

- [English](../README.md)

API backend para **AURA**, uma plataforma de e-commerce de maquiagem.

Uma REST API pronta para produção construída com Node.js, Express, TypeScript, Prisma, PostgreSQL e AWS S3.

Este serviço fornece autenticação, gerenciamento de produtos, carrinho de compras, criação de pedidos e upload de imagens para a loja. 
A API segue uma arquitetura modular e utiliza **presigned URLs** para enviar imagens de produtos diretamente para o armazenamento em nuvem.

---

## Stack Tecnológica

| Tecnologia | Finalidade |
|---|---|
| **Node.js + Express** | Servidor da REST API |
| **TypeScript** | Lógica da aplicação e segurança de tipos |
| **Zod** | Validação de requisições |
| **PostgreSQL (Neon)** | Banco de dados em nuvem |
| **Prisma ORM** | Modelagem e consultas ao banco de dados |
| **Prisma Migrate** | Migrations do banco de dados |
| **AWS S3** | Armazenamento de imagens dos produtos |
| **Docker** | Ambiente de desenvolvimento containerizado |
| **Vitest** | Testes unitários e de integração |
| **Supertest** | Testes de endpoints HTTP |
| **Render** | Deploy da aplicação |

---

## Arquitetura

O backend utiliza uma arquitetura em camadas para separar responsabilidades:

```
Controller → Service → Repository
```
Essa estrutura mantém a lógica de negócio isolada da manipulação HTTP e do acesso ao banco de dados.

---

## URL Base da API

```
https://aura-backend-szzx.onrender.com/api/v1
```
---

## Rotas da API

### Autenticação

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

### Produtos

```http
GET /api/v1/products
GET /api/v1/products/:id
POST /api/v1/products
PATCH /api/v1/products/:id
DELETE /api/v1/products/:id
```

### Carrinho

```http
GET /api/v1/cart
POST /api/v1/cart
PATCH /api/v1/cart/:productId
DELETE /api/v1/cart/:productId
```

### Pedidos

```http
GET /api/v1/orders
POST /api/v1/orders
GET /api/v1/orders/:id
```

### Uploads

```http
POST /api/v1/uploads/presign
```
Gera uma URL **pré-assinada** para enviar imagens de produtos diretamente para o AWS S3.

---

## Fluxo de Upload de Imagem

As imagens dos produtos são enviadas utilizando **presigned URLs**.

### Como funciona

1. O cliente envia uma requisição para o backend com:
   - `productId`
   - `filename`
   - `contentType`

2. O backend gera uma URL **pré-assinada** para o AWS S3:

```http
POST /api/v1/uploads/presign
```

O backend retorna um objeto como:

```json
{
  "key": "products/clx123abc/cover-171987123-image.png",
  "uploadUrl": "https://...",
  "publicUrl": "https://..."
}
```

O cliente envia o arquivo diretamente para o S3 usando uploadUrl.

A `publicUrl` retornada pode ser armazenada e utilizada pelo frontend para exibir a imagem do produto.

### Exemplo de requisição

```json
{
  "productId": "clx123abc",
  "filename": "lipstick.png",
  "contentType": "image/png"
}
```

### Exemplo de upload no frontend

```ts
const presignResponse = await fetch(`${API_URL}/uploads/presign`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    productId: "clx123abc",
    filename: file.name,
    contentType: file.type
  })
});

const { uploadUrl, publicUrl } = await presignResponse.json();

await fetch(uploadUrl, {
  method: "PUT",
  headers: {
    "Content-Type": file.type
  },
  body: file
});
```

###  Por que usar essa abordagem

- evita enviar arquivos grandes através do backend

- reduz a carga no servidor

- melhora a escalabilidade

- mantém uploads seguros utilizando URLs temporárias

---

## Funcionalidades

- Autenticação JWT
- Gerenciamento de produtos
- Sistema de carrinho de compras
- Criação de pedidos
- Upload de imagens usando presigned URLs
- Arquitetura modular
- Testes automatizados da API

---

## Segurança

- Validação de requisições utilizando Zod
- Restrição de tipos de arquivo para upload (`png`, `jpeg`, `webp`)
- Sanitização de nomes de arquivos para evitar caracteres inseguros
- Presigned URLs do S3 com tempo de expiração curto
- Validação de variáveis de ambiente na inicialização da aplicação

---

## Tratamento de Erros

A API utiliza uma estratégia centralizada de tratamento de erros através da classe personalizada `AppError`.

Erros operacionais retornam respostas estruturadas com códigos HTTP apropriados.

---

## Configuração de Variáveis de Ambiente

As variáveis de ambiente são gerenciadas através de arquivos de exemplo para manter segredos fora do repositório.

```
.env.example
.env.docker.example
.env.test
```

O arquivo `.env` real é ignorado pelo Git.

---

## Validação de Variáveis de Ambiente

As variáveis de ambiente são validadas na inicialização da aplicação através de um arquivo centralizado de configuração.


```
src/shared/config/env.ts
```
Variáveis obrigatórias são verificadas antes do servidor iniciar.
Se alguma estiver ausente, a aplicação lança um erro e interrompe a execução.

## Desenvolvimento

Crie seu arquivo de ambiente:

```bash
cp .env.example .env
```

### Docker

Ao executar o projeto com Docker:

```bash
cp .env.docker.example .env
```

---

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento com hot reload|
| `npm run build` | Compila TypeScript para JavaScript |
| `npm run start` | Inicia o servidor em produção |
| `npm run test` | Executa testes em modo watch |
| `npm run test:run` | Executa todos os testes uma vez |
| `npm run test:cov` | Executa testes com relatório de cobertura |
| `npm run test:e2e` | Executa testes end-to-end |
| `npm run db:test:migrate` | Executa migrations do Prisma para o banco de testes |
| `npm run db:test:reset` | Reseta o banco de testes |
| `npm run db:test:studio` | Abre o Prisma Studio para o banco de testes |

---

## Fluxo de Desenvolvimento

Fluxo típico de desenvolvimento:

```bash
npm install
npm run dev
```

Build para produção:

```bash
npm run build
npm run start
```

Executar testes:

```bash
npm run test
```

## Banco de Dados (Ambiente de Teste)

Executar migrations para o banco de testes:

```bash
npm run db:test:migrate
```

Resetar o banco de testes:

```bash
npm run db:test:reset
```

Abrir o Prisma Studio:

```bash
npm run db:test:studio
```