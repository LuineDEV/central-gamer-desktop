# Central Gamer - Hub Desktop para Gerenciamento Pessoal de Gamers

![Central Gamer Logo](web/assets/logo.png) ## 🚀 Visão Geral do Projeto

A **Central Gamer** é uma aplicação desktop robusta e interativa, desenvolvida para ser o hub central na gestão da vida digital de qualquer gamer. Construída com uma arquitetura **full-stack**, a aplicação combina o poder do **Python (Eel)** no backend para lógica de negócios e integração com APIs, e uma interface moderna e responsiva desenvolvida com **HTML, CSS e JavaScript**. Os dados são persistidos de forma segura em um banco de dados **MySQL**.

Este projeto demonstra habilidades em desenvolvimento desktop, integração de APIs, gerenciamento de banco de dados, segurança (autenticação e hash de senha), e desenvolvimento frontend dinâmico.

## ✨ Funcionalidades Principais

* **Sistema de Autenticação Completo**: Cadastro e login seguro de usuários com criptografia de senha (`bcrypt`).
* **Gestão de Perfil de Usuário**: Os usuários podem visualizar e atualizar suas informações pessoais, links sociais (Steam, Twitch, Discord) e trocar sua foto de perfil (avatar).
* **Personalização de Tema**: Escolha entre múltiplos temas visuais para customizar a interface do aplicativo ao seu gosto, com persistência da preferência.
* **Acompanhamento de Streamers Favoritos (Twitch)**: Adicione streamers da Twitch à sua lista, visualize seu status (Online/Offline), o jogo atual, título da live e link direto para o canal.
* **Biblioteca de Jogos Pessoal**: Organize seus jogos com detalhes como nome, plataforma, status (jogando, completo, desejo, etc.), horas jogadas, avaliação e observações. Funcionalidades CRUD (Criar, Ler, Atualizar, Deletar) completas.
* **Bloco de Notas Integrado**: Um espaço para salvar anotações rápidas, ideias de builds, lembretes de jogos ou qualquer informação relevante, com gestão CRUD.
* **Feedback Visual Claro**: Spinners de carregamento localizados, mensagens de validação de formulário em tempo real e caixas de diálogo de confirmação personalizadas para uma experiência de usuário fluida.

## 🛠️ Tecnologias Utilizadas

**Backend:**
* **Python 3.x**
* **Eel**: Para conectar o backend Python ao frontend web.
* **bcrypt**: Para hash seguro de senhas.
* **mysql-connector-python**: Driver para conexão com o MySQL.
* **requests**: Para fazer requisições HTTP à API da Twitch.
* **python-dotenv**: Para carregar variáveis de ambiente (`.env`).
* **logging**: Para registro de eventos e erros.

**Frontend:**
* **HTML5**: Estrutura da interface.
* **CSS3**: Estilização e temas dinâmicos via variáveis CSS.
* **JavaScript (ES6+)**: Lógica interativa do lado do cliente, manipulação do DOM e comunicação com o backend via Eel.

**Banco de Dados:**
* **MySQL**

**Ferramentas:**
* **Git**: Sistema de controle de versão.
* **PyInstaller**: Para empacotar a aplicação Python em um executável autônomo (mencionado para futuro empacotamento).
* **Ambientes Virtuais (venv)**: Para isolar as dependências do projeto.

## 🚀 Como Começar (Configuração Local)

Siga estas instruções para configurar e executar a Central Gamer em sua máquina local.

### Pré-requisitos

Certifique-se de ter o seguinte instalado:

* **Python 3.x**: [Download Python](https://www.python.org/downloads/)
* **MySQL Server**: [Download MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
* **pip**: Gerenciador de pacotes do Python (geralmente vem com o Python).
* **Git**: [Download Git](https://git-scm.com/downloads)

### 1. Clonar o Repositório

Abra seu terminal/prompt de comando e clone o projeto:

```bash
git clone [https://github.com/LuineDEV/central-gamer-desktop.git](https://github.com/LuineDEV/central-gamer-desktop.git)
cd central-gamer-desktop
