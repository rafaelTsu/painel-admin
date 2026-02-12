# 🚀 Copilot Instructions: Painel Administrativo (Vibe Coding Edition)

Este guia define as regras para o desenvolvimento da feature de Painel Administrativo. O Agent deve consultar este arquivo antes de qualquer geração de código para garantir conformidade com os padrões da equipe.

## 🛠️ Stack Tecnológica
- **Backend:** Node.js 20 LTS (JavaScript/CommonJS)
- **Framework Web:** Express.js
- **ORM:** Sequelize (PostgreSQL 15 via Docker)
- **Frontend:** Vue 3 (Option API)
- **Estilização:** CSS (Conforme protótipo Figma)

## 🏗️ Arquitetura em Camadas (Obrigatório)
Respeite estritamente a direção de dependência: **Routes -> Controller -> Service -> Model**.

```text
src/
  ├── config/          # Configurações de banco (Sequelize) e variáveis de ambiente
  ├── database/
  │   ├── migrations/  # Estrutura de tabelas (Sequelize)
  │   └── seeders/     # Dados iniciais para testes (Categorias/Templates/Usuários)
  ├── models/          # Definições de entidades e regras de domínio (Sequelize.define)
  ├── services/        # Lógica de negócio (Versionamento, Validação de If/Else, Auditoria)
  ├── controllers/     # Manipulação de req/res e validação de entrada
  └── routes/          # Definição de endpoints Express

## ⚖️ Regras de Vibe Coding & Spec-KitSpec-Kit como Fonte da Verdade: 

Toda implementação deve ser baseada nos arquivos em .spec-kit/. Se houver divergência entre o código e a Spec, a Spec deve ser a referência para correção.

## 🎨 UI & Design

Siga rigorosamente os mockups/screenshots em /docs/design.