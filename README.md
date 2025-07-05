# Central Gamer - Seu Universo Gaming em um Clique 🎮

## 🚀 Visão Geral

A **Central Gamer** é uma inovadora aplicação desktop projetada para ser o **hub definitivo** para entusiastas de jogos. Unificando gerenciamento de perfis, acompanhamento de streamers favoritos da Twitch, uma biblioteca de jogos pessoal e um bloco de notas integrado, o projeto oferece uma experiência de usuário rica e centralizada.

Este projeto demonstra proficiência em desenvolvimento de software desktop com Python, gerenciamento de banco de dados com MySQL e criação de interfaces de usuário web modernas e interativas com HTML, CSS e JavaScript, tudo conectado pela biblioteca Eel.

## ✨ Destaques e Funcionalidades

* **Autenticação Segura**: Gerenciamento completo de usuários com sistema de cadastro e login.
* **Interface Personalizável**: Adapte o aplicativo ao seu estilo com **múltiplos temas visuais** (claro e escuro).
* **Dashboards Interativos**:
    * **Visão Geral**: Estatísticas rápidas da sua biblioteca e streamers, com atalhos para as principais funcionalidades.
    * **Streamers Favoritos (Twitch)**: Acompanhe seus streamers preferidos em tempo real, vendo status online/offline, o jogo atual e o título da transmissão.
    * **Biblioteca de Jogos**: Organize sua coleção de jogos com detalhes como nome, plataforma, status, horas jogadas, avaliação e observações.
    * **Bloco de Notas Pessoal**: Um espaço prático para registrar ideias, builds, dicas ou qualquer anotação relacionada aos seus jogos, com suporte a CRUD completo.
* **Experiência do Usuário Aprimorada**: Feedback visual claro em formulários (validações), spinners de carregamento localizados para ações assíncronas e modais de confirmação personalizados para ações destrutivas (como exclusão de dados).

  🎨 Personalização e Empacotamento
Personalização de Temas
A Central Gamer permite que você personalize a interface. No seu Perfil, vá em "Configurações" para alternar entre os temas disponíveis.

Empacotamento (Criar Executável)
Para transformar o aplicativo em um único executável (para Windows, por exemplo), você pode usar o PyInstaller. No terminal, na raiz do projeto, execute:

pyinstaller --noconfirm --onefile --windowed --add-data "web;web" --icon="web/assets/icon.ico" app.py

## 🛠️ Tecnologias Utilizadas

### **Backend:**

* **Python 3.x**: Linguagem principal para toda a lógica da aplicação.
* **Eel**: Para criar aplicações desktop híbridas, conectando Python e tecnologias web.
* **bcrypt**: Criptografia de senhas para garantir a segurança dos usuários.
* **mysql-connector-python**: Driver oficial para a comunicação com o banco de dados MySQL.
* **requests**: Para realizar requisições HTTP à API da Twitch.
* **python-dotenv**: Para gerenciamento de variáveis de ambiente.
* **logging**: Implementação de logs para depuração e monitoramento.

### **Frontend:**

* **HTML5**: Estrutura semântica da interface.
* **CSS3**: Estilização avançada, incluindo o uso de variáveis CSS para a implementação de temas dinâmicos.
* **JavaScript (ES6+)**: Interatividade, manipulação do DOM e comunicação com o backend Python.

### **Banco de Dados:**

* **MySQL**: Sistema de gerenciamento de banco de dados relacional para armazenar todos os dados da aplicação.

### **Ferramentas:**

* **Git**: Sistema de controle de versão.
* **PyInstaller**: Para empacotar a aplicação em um executável independente.
* **Ambientes Virtuais (venv)**: Para isolamento de dependências do projeto.


Desenvolvido por: LuineDEV

GitHub: https://github.com/LuineDEV

## 💻 Como Executar Localmente

```bash
# PASSO 1: CLONE O PROJETO E ACESSE A PASTA
git clone [https://github.com/LuineDEV/central-gamer-desktop.git](https://github.com/LuineDEV/central-gamer-desktop.git)
cd central-gamer-desktop

# PASSO 2: CRIE E ATIVE O AMBIENTE VIRTUAL
# (Escolha o comando para o seu sistema operacional)
# Para macOS/Linux:
python3 -m venv venv && source venv/bin/activate
# Para Windows (execute no CMD ou PowerShell):
# python -m venv venv && .\venv\Scripts\activate

# PASSO 3: INSTALE AS DEPENDÊNCIAS
pip install mysql-connector-python bcrypt requests eel python-dotenv

# PASSO 4: CONFIGURE O BANCO DE DADOS
# As linhas abaixo são um guia. Você deve executar os comandos SQL
# no seu programa de gerenciamento de MySQL (HeidiSQL, DBeaver, etc.).
# --------------------------------------------------------------------
# CREATE DATABASE central_gamer_db;
# USE central_gamer_db;
# CREATE TABLE usuarios (id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, senha VARCHAR(255) NOT NULL, avatar_url VARCHAR(255) DEFAULT 'assets/default-avatar.png', data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, tema_preferido VARCHAR(50) DEFAULT 'dark-blue');
# CREATE TABLE streamers_favoritos (id INT AUTO_INCREMENT PRIMARY KEY, id_usuario INT NOT NULL, nome_streamer VARCHAR(255) NOT NULL, FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE, UNIQUE (id_usuario, nome_streamer));
# CREATE TABLE jogos (id INT AUTO_INCREMENT PRIMARY KEY, id_usuario INT NOT NULL, nome_jogo VARCHAR(255) NOT NULL, plataforma VARCHAR(100), status_jogo VARCHAR(50), horas_jogadas DECIMAL(10, 2) DEFAULT 0.00, avaliacao INT DEFAULT NULL CHECK (avaliacao >= 1 AND avaliacao <= 5), observacoes TEXT, data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE);
# CREATE TABLE notas (id INT AUTO_INCREMENT PRIMARY KEY, id_usuario INT NOT NULL, titulo VARCHAR(255) NOT NULL, conteudo TEXT, data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, data_modificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE);
# --------------------------------------------------------------------

# PASSO 5: CRIE O ARQUIVO DE AMBIENTE (.env)
# Na raiz do projeto, crie um arquivo chamado '.env' e cole o texto abaixo nele,
# substituindo os placeholders com suas credenciais.
# --------------------------------------------------------------------
# DB_HOST=localhost
# DB_DATABASE=central_gamer_db
# DB_USER=seu_usuario_mysql
# DB_PASSWORD=sua_senha_mysql
# DB_PORT=3306
# TWITCH_CLIENT_ID=SUA_TWITCH_CLIENT_ID
# TWITCH_CLIENT_SECRET=SEU_TWITCH_CLIENT_SECRET
# --------------------------------------------------------------------

# PASSO 6: EXECUTE A APLICAÇÃO
python app.py
