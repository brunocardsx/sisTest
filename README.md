# CONSTRUTECH - Sistema de Gestão

<p align="center">
    <img src="frontend/src/images/logo.png" width="200px" alt="CONSTRUTECH Logo">
</p>

<p align="center">
    <strong>Sistema completo de gestão para empreendimentos imobiliários</strong>
</p>

<p align="center">
    <a href="https://github.com/brunocardsx/sisTest">
        <img src="https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github" alt="GitHub Repository">
    </a>
    <a href="http://localhost:3000">
        <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" alt="Frontend">
    </a>
    <a href="http://localhost:8081">
        <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js" alt="Backend">
    </a>
    <a href="http://localhost:3001">
        <img src="https://img.shields.io/badge/Documentação-Docusaurus-purple?style=for-the-badge&logo=docusaurus" alt="Documentação">
    </a>
</p>

---

## 📋 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar](#-como-executar)
- [Documentação](#-documentação)
- [API](#-api)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🏗️ Sobre

O **CONSTRUTECH** é um sistema completo de gestão desenvolvido especificamente para empreendimentos imobiliários. O sistema oferece controle total sobre obras, produtos, estoque, vendas e notas fiscais, proporcionando uma solução integrada para o gerenciamento de negócios imobiliários.

### 🎯 Objetivos

- **Centralizar** todas as operações de gestão em uma única plataforma
- **Automatizar** processos de controle de estoque e vendas
- **Facilitar** a emissão e controle de notas fiscais
- **Fornecer** relatórios e dashboards em tempo real
- **Otimizar** a gestão de obras e empreendimentos

---

## ⚙️ Funcionalidades

### 🏠 Dashboard
- **Visão Geral** - Métricas principais em tempo real
- **Gráficos Interativos** - Visualização de dados com Chart.js
- **Filtros por Obra** - Análise específica por empreendimento
- **Relatórios Mensais** - Distribuição de compras por período

### 🏗️ Gestão de Obras
- **Cadastro Completo** - Informações detalhadas do empreendimento
- **Listagem e Edição** - Controle total das obras
- **Exclusão Segura** - Remoção com confirmação

### 📦 Controle de Estoque
- **Cadastro de Produtos** - Nome, marca, custo e preço de revenda
- **Movimentação** - Adição e remoção de itens
- **Histórico** - Acompanhamento de todas as movimentações
- **Alertas** - Notificações de estoque baixo

### 🧾 Notas Fiscais
- **Emissão** - Criação de notas fiscais completas
- **Consulta** - Busca por número ou período
- **Detalhamento** - Visualização completa dos itens
- **Controle** - Exclusão e edição

### 💰 Sistema de Vendas
- **Interface Intuitiva** - Seleção fácil de produtos
- **Cálculo Automático** - Totais e descontos
- **Finalização** - Processo completo de pagamento
- **Histórico** - Acompanhamento de vendas

### 👥 Gestão de Clientes
- **Cadastro** - Informações pessoais e de contato
- **Relacionamento** - Gestão de relacionamento
- **Histórico** - Acompanhamento de compras

---

## 🛠️ Tecnologias

### Frontend
- **React 17.0.2** - Biblioteca principal para interface
- **React Router 6.1.1** - Roteamento da aplicação
- **Axios 1.10.0** - Cliente HTTP para comunicação
- **Chart.js 3.9.1** - Gráficos e visualizações
- **React Select 5.2.1** - Componentes de seleção

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **CORS** - Cross-Origin Resource Sharing

### Documentação
- **Docusaurus** - Framework de documentação
- **TypeScript** - Tipagem estática
- **Markdown** - Formatação de conteúdo

---

## 📁 Estrutura do Projeto

```
sisTest/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── dashboard/        # Página do dashboard
│   │   ├── login/           # Página de login
│   │   ├── menu/            # Menu lateral
│   │   ├── product/         # Gestão de produtos
│   │   ├── sale/            # Sistema de vendas
│   │   ├── stock/           # Controle de estoque
│   │   ├── nota-fiscal/     # Notas fiscais
│   │   ├── obras/           # Gestão de obras
│   │   ├── services/        # Serviços e API
│   │   └── images/          # Imagens e assets
│   └── package.json
├── backend/                  # API Node.js
│   ├── config/              # Configurações
│   ├── controllers/         # Controladores
│   ├── database/            # Configuração do banco
│   ├── middleware/          # Middlewares
│   ├── models/              # Modelos de dados
│   ├── routes/              # Rotas da API
│   └── index.js             # Arquivo principal
├── docs/                    # Documentação (Docusaurus)
│   ├── docs/                # Páginas de documentação
│   ├── static/              # Assets estáticos
│   └── src/                 # Componentes da documentação
└── README.md                # Este arquivo
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL** - [Download](https://www.postgresql.org/)
- **npm** ou **yarn** - Gerenciador de pacotes

### 1. Clone o Repositório
```bash
git clone https://github.com/brunocardsx/sisTest.git
cd sisTest
```

### 2. Configure o Backend
```bash
cd backend
npm install
```

Configure as variáveis de ambiente:
```env
PORT=8081
DB_HOST=localhost
DB_PORT=5432
DB_NAME=construtech
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=seu_jwt_secret
```

### 3. Configure o Frontend
```bash
cd frontend
npm install
```

Configure as variáveis de ambiente:
```env
REACT_APP_API_URL=http://localhost:8081
REACT_APP_MOCK_MODE=false
```

### 4. Execute o Sistema
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start

# Terminal 3 - Documentação (opcional)
cd docs
npm start
```

### 5. Acesse o Sistema
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8081
- **Documentação**: http://localhost:3001

---

## 📚 Documentação

A documentação completa do sistema está disponível em:

- **Local**: http://localhost:3001
- **GitHub Pages**: https://brunocardsx.github.io/sisTest/

### Seções da Documentação
- **Introdução** - Visão geral do sistema
- **Funcionalidades** - Lista completa de funcionalidades
- **Frontend** - Documentação da aplicação React
- **Backend** - Documentação da API Node.js
- **API** - Documentação dos endpoints

---

## 🔌 API

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/register` - Registro de usuário

#### Obras
- `GET /api/obras` - Listar obras
- `POST /api/obras` - Criar obra
- `PUT /api/obras/:id` - Atualizar obra
- `DELETE /api/obras/:id` - Excluir obra

#### Produtos
- `GET /api/produto` - Listar produtos
- `POST /api/produto` - Criar produto
- `PUT /api/produto/:id` - Atualizar produto
- `DELETE /api/produto/:id` - Excluir produto

#### Notas Fiscais
- `GET /api/notas-fiscais` - Listar notas
- `POST /api/notas-fiscais` - Criar nota
- `GET /api/notas-fiscais/:id` - Buscar por ID
- `DELETE /api/notas-fiscais/:id` - Excluir nota

Para documentação completa da API, acesse: http://localhost:3001/docs/api

---

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código
- Use **ESLint** e **Prettier** para formatação
- Siga as convenções do **React** e **Node.js**
- Escreva **testes** para novas funcionalidades
- Documente **APIs** e **componentes** importantes

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Bruno Cardoso**

- **GitHub**: [@brunocardsx](https://github.com/brunocardsx)
- **Email**: [bruno.cards1@gmail.com]

---

## 🙏 Agradecimentos

- **React Team** - Pela excelente biblioteca
- **Node.js Community** - Pelo ecossistema robusto
- **PostgreSQL** - Pelo banco de dados confiável
- **Docusaurus** - Pela documentação incrível

---

<p align="center">
    <strong>Desenvolvido com ❤️ para empreendimentos imobiliários</strong>
</p>