import eel
import bcrypt
import requests
from db import get_db_connection
import os
import base64
from datetime import datetime
import logging # Importa o módulo de logging

# --- CONFIGURAÇÃO DE LOGGING ---
# Configura o logging para exibir mensagens no console, útil para depuração
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- CONFIGURAÇÃO DAS CREDENCIAIS E CONSTANTES ---
# ATENÇÃO: Em um ambiente de produção, estas credenciais não devem ser expostas diretamente no código.
# Considere usar variáveis de ambiente ou um sistema de configuração seguro.
TWITCH_CLIENT_ID = os.getenv("TWITCH_CLIENT_ID")
TWITCH_CLIENT_SECRET = os.getenv("TWITCH_CLIENT_SECRET")

TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token"
TWITCH_HELIX_URL = "https://api.twitch.tv/helix"

# --- Variável global para simular a sessão do utilizador logado ---
# Em aplicações maiores, isto seria substituído por um sistema de sessão mais robusto (ex: JWT, cookies).
# Para Eel, uma variável global é uma abordagem comum e funcional para manter o estado do usuário.
utilizador_logado: dict or None = None

# Inicia o Eel, apontando para a pasta 'web' onde estão os arquivos da interface
eel.init('web')

# --- Funções Auxiliares de Banco de Dados ---
# (Assumindo que db.py já lida com a conexão e erros de forma básica)

# --- Funções de Autenticação de Usuário ---

@eel.expose
def cadastrar_usuario(nome: str, email: str, senha: str) -> dict:
    """
    Cadastra um novo usuário no banco de dados.

    Args:
        nome (str): Nome do usuário.
        email (str): Endereço de e-mail do usuário (deve ser único).
        senha (str): Senha do usuário (será criptografada).

    Returns:
        dict: Um dicionário com 'status' ('sucesso' ou 'erro') e uma 'message'.
    """
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao banco de dados para cadastro: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor()
        # Verifica se o e-mail já está em uso para evitar duplicatas
        cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            return {'status': 'erro', 'message': 'Este e-mail já está em uso. Por favor, use outro.'}
        
        # Criptografa a senha usando bcrypt para armazenamento seguro
        senha_bytes = senha.encode('utf-8')
        sal = bcrypt.gensalt() # Gera um sal único para cada senha
        senha_hash = bcrypt.hashpw(senha_bytes, sal)
        
        # Insere o novo usuário com o tema padrão
        sql = "INSERT INTO usuarios (nome, email, senha, tema_preferido) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (nome, email, senha_hash.decode('utf-8'), 'dark-blue')) # Tema padrão 'dark-blue'
        conn.commit() # Confirma a transação
        logging.info(f"Usuário '{email}' cadastrado com sucesso.")
        return {'status': 'sucesso', 'message': 'Utilizador cadastrado com sucesso! Por favor, faça login.'}
    except Exception as e:
        conn.rollback() # Desfaz a operação em caso de erro
        logging.error(f"Erro inesperado ao cadastrar usuário '{email}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Um erro inesperado ocorreu ao cadastrar. Tente novamente. Detalhes: {e}'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def verificar_login(email: str, senha: str) -> dict:
    """
    Verifica as credenciais de login do usuário.

    Args:
        email (str): E-mail do usuário.
        senha (str): Senha em texto claro.

    Returns:
        dict: Um dicionário com 'status', 'message' e 'user' (se sucesso).
    """
    global utilizador_logado
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao banco de dados para login: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor(dictionary=True) # Retorna resultados como dicionários
        # Seleciona todos os dados do usuário, incluindo tema_preferido
        cursor.execute("SELECT *, tema_preferido FROM usuarios WHERE email = %s", (email,))
        usuario = cursor.fetchone()

        # Verifica se o usuário existe e se a senha fornecida corresponde ao hash armazenado
        if usuario and bcrypt.checkpw(senha.encode('utf-8'), usuario['senha'].encode('utf-8')):
            # Converte o objeto datetime para string ISO para ser serializável em JSON
            if usuario.get('data_cadastro') and isinstance(usuario['data_cadastro'], datetime):
                usuario['data_cadastro'] = usuario['data_cadastro'].isoformat()
            
            # Remove a senha do dicionário antes de armazenar na sessão/enviar para o frontend
            usuario.pop('senha', None) 
            utilizador_logado = usuario # Define o usuário logado globalmente
            logging.info(f"Usuário '{email}' logado com sucesso.")
            return {'status': 'sucesso', 'user': usuario}
        else:
            logging.warning(f"Tentativa de login falha para '{email}'.")
            return {'status': 'erro', 'message': 'E-mail ou senha inválidos.'}
    except Exception as e:
        logging.error(f"Erro inesperado ao verificar login de '{email}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Um erro inesperado ocorreu ao fazer login. Detalhes: {e}'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def fazer_logout() -> dict:
    """
    Realiza o logout do usuário, limpando a variável global 'utilizador_logado'.

    Returns:
        dict: Um dicionário com 'status' de sucesso.
    """
    global utilizador_logado
    if utilizador_logado:
        logging.info(f"Usuário '{utilizador_logado.get('email', 'N/A')}' deslogado.")
    utilizador_logado = None
    return {'status': 'sucesso'}

@eel.expose
def get_current_user() -> dict or None:
    """
    Retorna os dados do usuário atualmente logado para o frontend.

    Returns:
        dict or None: Um dicionário com os dados do usuário (sem a senha) ou None se não houver.
    """
    global utilizador_logado
    if utilizador_logado:
        user_data = utilizador_logado.copy()
        # Garante que a URL do avatar é formatada corretamente para o frontend
        if user_data.get('avatar_url') and not user_data['avatar_url'].startswith(('assets/', 'uploads/')):
            user_data['avatar_url'] = f"uploads/avatars/{os.path.basename(user_data['avatar_url'])}"
        
        # Garante que o tema_preferido é incluído nos dados do usuário, com um fallback.
        user_data['tema_preferido'] = utilizador_logado.get('tema_preferido', 'dark-blue')
        return user_data
    return None

# --- Funções de Perfil do Utilizador ---

@eel.expose
def get_dados_perfil() -> dict:
    """
    Obtém e retorna os dados completos do perfil do usuário logado.

    Returns:
        dict: Um dicionário com 'status' e 'data' (dados do perfil).
    """
    if not utilizador_logado:
        logging.warning("Tentativa de obter dados do perfil sem usuário logado.")
        return {'status': 'erro', 'message': 'Utilizador não está logado.'}
    # Como 'utilizador_logado' já contém os dados, apenas os retorna.
    # Se você precisar de dados mais atualizados do DB, faria uma nova consulta aqui.
    return {'status': 'sucesso', 'data': utilizador_logado}

@eel.expose
def atualizar_avatar(image_data_url: str) -> dict:
    """
    Atualiza o avatar do usuário logado. Decodifica a imagem base64,
    salva no servidor e atualiza o caminho no banco de dados.

    Args:
        image_data_url (str): String base64 da imagem do avatar.

    Returns:
        dict: Um dicionário com 'status', 'message' e 'new_avatar_url'.
    """
    global utilizador_logado
    if not utilizador_logado:
        logging.warning("Tentativa de atualizar avatar sem usuário logado.")
        return {'status': 'erro', 'message': 'Utilizador não está logado.'}
    
    avatar_dir = os.path.join('web', 'uploads', 'avatars')
    os.makedirs(avatar_dir, exist_ok=True) # Cria o diretório se não existir

    try:
        # Extrai o cabeçalho e os dados da imagem base64
        header, encoded_data = image_data_url.split(',', 1)
        image_data = base64.b64decode(encoded_data)
        file_extension = header.split(';')[0].split('/')[1] # Ex: 'png', 'jpeg'
        
        user_id = utilizador_logado['id']
        timestamp = int(datetime.now().timestamp()) # Garante nome de arquivo único
        filename = f"user_{user_id}_{timestamp}.{file_extension}"
        save_path = os.path.join(avatar_dir, filename) # Caminho completo para salvar no servidor

        with open(save_path, "wb") as f:
            f.write(image_data)
        
        # Deleta o avatar antigo do servidor, se não for o avatar padrão
        old_avatar_path_db = utilizador_logado.get('avatar_url')
        if old_avatar_path_db and 'default-avatar.png' not in old_avatar_path_db:
            old_avatar_full_path = os.path.join('web', old_avatar_path_db)
            if os.path.exists(old_avatar_full_path):
                os.remove(old_avatar_full_path)
                logging.info(f"Avatar antigo '{old_avatar_full_path}' deletado.")

        # Atualiza o caminho do avatar no banco de dados
        db_path = f"uploads/avatars/{filename}" # Caminho relativo para o frontend
        conn, error = get_db_connection()
        if error:
            logging.error(f"Erro ao conectar ao DB para atualizar avatar: {error}")
            return {'status': 'erro', 'message': f'Erro de conexão ao banco de dados: {error}'}
        cursor = conn.cursor()
        cursor.execute("UPDATE usuarios SET avatar_url = %s WHERE id = %s", (db_path, user_id))
        conn.commit()
        
        # Atualiza a variável global do usuário logado
        utilizador_logado['avatar_url'] = db_path
        logging.info(f"Avatar do usuário '{utilizador_logado.get('email', 'N/A')}' atualizado para '{db_path}'.")
        return {'status': 'sucesso', 'message': 'Avatar atualizado!', 'new_avatar_url': db_path}
    except Exception as e:
        logging.error(f"Erro inesperado ao processar/salvar avatar para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao processar imagem do avatar: {e}. Certifique-se de que é um arquivo de imagem válido.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def atualizar_perfil(novo_nome: str, novo_email: str, sobre_mim: str,
                     steam_url: str, twitch_url: str, discord_id: str) -> dict:
    """
    Atualiza as informações do perfil do usuário logado no banco de dados.

    Args:
        novo_nome (str): Novo nome do usuário.
        novo_email (str): Novo e-mail do usuário.
        sobre_mim (str): Nova biografia.
        steam_url (str): Nova URL do perfil Steam.
        twitch_url (str): Nova URL do canal Twitch.
        discord_id (str): Novo ID do Discord.

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    global utilizador_logado
    if not utilizador_logado:
        logging.warning("Tentativa de atualizar perfil sem usuário logado.")
        return {'status': 'erro', 'message': 'Utilizador não está logado.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para atualizar perfil: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        
        # Opcional: Verificar se o novo e-mail já está em uso por outro usuário
        cursor.execute("SELECT id FROM usuarios WHERE email = %s AND id != %s", (novo_email, id_do_utilizador))
        if cursor.fetchone():
            return {'status': 'erro', 'message': 'Este novo e-mail já está em uso por outra conta.'}

        sql = """
            UPDATE usuarios SET 
                nome = %s, email = %s, sobre_mim = %s, 
                steam_url = %s, twitch_url = %s, discord_id = %s 
            WHERE id = %s
        """
        valores = (novo_nome, novo_email, sobre_mim, steam_url, twitch_url, discord_id, id_do_utilizador)
        cursor.execute(sql, valores)
        conn.commit()
        
        # Atualiza a variável global do usuário logado com os novos dados
        utilizador_logado.update({
            'nome': novo_nome,
            'email': novo_email,
            'sobre_mim': sobre_mim,
            'steam_url': steam_url,
            'twitch_url': twitch_url,
            'discord_id': discord_id
        })
        logging.info(f"Perfil do usuário '{utilizador_logado.get('email', 'N/A')}' atualizado.")
        return {'status': 'sucesso', 'message': 'Perfil atualizado com sucesso!'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao atualizar perfil para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao atualizar o perfil: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def atualizar_senha(senha_atual: str, nova_senha: str) -> dict:
    """
    Permite ao usuário logado alterar sua senha, verificando a senha atual.

    Args:
        senha_atual (str): Senha atual do usuário em texto claro.
        nova_senha (str): Nova senha do usuário em texto claro.

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    if not utilizador_logado:
        logging.warning("Tentativa de atualizar senha sem usuário logado.")
        return {'status': 'erro', 'message': 'Utilizador não está logado.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para atualizar senha: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor(dictionary=True)
        id_do_utilizador = utilizador_logado['id']
        cursor.execute("SELECT senha FROM usuarios WHERE id = %s", (id_do_utilizador,))
        usuario_db = cursor.fetchone()

        # Verifica se a senha atual fornecida corresponde ao hash armazenado
        if usuario_db and bcrypt.checkpw(senha_atual.encode('utf-8'), usuario_db['senha'].encode('utf-8')):
            nova_senha_hash = bcrypt.hashpw(nova_senha.encode('utf-8'), bcrypt.gensalt())
            cursor.execute("UPDATE usuarios SET senha = %s WHERE id = %s", (nova_senha_hash.decode('utf-8'), id_do_utilizador))
            conn.commit()
            logging.info(f"Senha do usuário '{utilizador_logado.get('email', 'N/A')}' atualizada com sucesso.")
            return {'status': 'sucesso', 'message': 'Senha alterada com sucesso!'}
        else:
            logging.warning(f"Tentativa de atualização de senha falha para '{utilizador_logado.get('email', 'N/A')}': Senha atual incorreta.")
            return {'status': 'erro', 'message': 'A senha atual está incorreta.'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao atualizar senha para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao alterar a senha: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def deletar_conta(senha: str) -> dict:
    """
    Deleta a conta do usuário logado e todos os dados associados (streamers, jogos, notas, avatar).
    Requer a senha atual para confirmação.

    Args:
        senha (str): Senha do usuário para confirmação.

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    global utilizador_logado
    if not utilizador_logado:
        logging.warning("Tentativa de deletar conta sem usuário logado.")
        return {'status': 'erro', 'message': 'Utilizador não está logado.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para deletar conta: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor(dictionary=True)
        user_id = utilizador_logado['id']
        cursor.execute("SELECT senha, avatar_url FROM usuarios WHERE id = %s", (user_id,))
        usuario_db = cursor.fetchone()
        
        # Verifica a senha antes de proceder com a exclusão
        if not (usuario_db and bcrypt.checkpw(senha.encode('utf-8'), usuario_db['senha'].encode('utf-8'))):
            logging.warning(f"Tentativa de deleção de conta falha para '{utilizador_logado.get('email', 'N/A')}': Senha incorreta.")
            return {'status': 'erro', 'message': 'Senha incorreta. A conta não foi deletada.'}
        
        # Inicia a transação de exclusão de dados relacionados
        cursor.execute("DELETE FROM streamers_favoritos WHERE id_usuario = %s", (user_id,))
        cursor.execute("DELETE FROM jogos WHERE id_usuario = %s", (user_id,)) 
        cursor.execute("DELETE FROM notas WHERE id_usuario = %s", (user_id,))
        cursor.execute("DELETE FROM usuarios WHERE id = %s", (user_id,)) # Por último, deleta o usuário
        conn.commit()

        # Deleta o arquivo de avatar do servidor, se não for o avatar padrão
        avatar_path = usuario_db.get('avatar_url')
        if avatar_path and 'default-avatar.png' not in avatar_path:
            full_avatar_path = os.path.join('web', avatar_path)
            if os.path.exists(full_avatar_path):
                os.remove(full_avatar_path)
                logging.info(f"Avatar '{full_avatar_path}' do usuário deletado junto com a conta.")
        
        logging.info(f"Conta do usuário '{utilizador_logado.get('email', 'N/A')}' (ID: {user_id}) deletada com sucesso.")
        utilizador_logado = None # Limpa o usuário logado
        return {'status': 'sucesso', 'message': 'Sua conta e todos os dados foram deletados com sucesso.'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao deletar conta para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Um erro inesperado ocorreu ao deletar a conta: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# --- Funções de Tema de Interface ---

@eel.expose
def set_user_theme(theme_name: str) -> dict:
    """
    Atualiza o tema preferido do usuário logado no banco de dados.

    Args:
        theme_name (str): O nome do tema a ser salvo (ex: 'dark-blue', 'theme-forest-green').

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    global utilizador_logado
    if not utilizador_logado:
        logging.warning("Tentativa de definir tema sem usuário logado.")
        return {'status': 'erro', 'message': 'Utilizador não está logado.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para definir tema: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    
    try:
        cursor = conn.cursor()
        user_id = utilizador_logado['id']
        sql = "UPDATE usuarios SET tema_preferido = %s WHERE id = %s"
        cursor.execute(sql, (theme_name, user_id))
        conn.commit()
        utilizador_logado['tema_preferido'] = theme_name # Atualiza a variável global de sessão
        logging.info(f"Tema do usuário '{utilizador_logado.get('email', 'N/A')}' atualizado para '{theme_name}'.")
        return {'status': 'sucesso', 'message': f'Tema atualizado para {theme_name}!'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao salvar tema para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao salvar tema: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# --- Funções de Integração com Twitch e Gerenciamento de Streamers ---

def get_twitch_access_token() -> str or None:
    """
    Obtém um token de acesso de aplicação da API da Twitch usando as credenciais de cliente.

    Returns:
        str or None: O token de acesso se bem-sucedido, None caso contrário.
    """
    url = f"{TWITCH_AUTH_URL}"
    payload = {
        'client_id': TWITCH_CLIENT_ID,
        'client_secret': TWITCH_CLIENT_SECRET,
        'grant_type': 'client_credentials'
    }
    try:
        response = requests.post(url, data=payload)
        response.raise_for_status() # Levanta HTTPError para status de erro (4xx ou 5xx)
        token = response.json().get('access_token')
        if not token:
            logging.error("Token de acesso da Twitch não encontrado na resposta.")
        return token
    except requests.exceptions.RequestException as e:
        logging.error(f"Erro de requisição ao obter token da Twitch: {e}", exc_info=True)
        return None

def get_twitch_stream_info(user_logins: list[str], token: str) -> dict:
    """
    Busca informações de streams ao vivo (incluindo jogo e título) para uma lista de logins da Twitch.

    Args:
        user_logins (list[str]): Uma lista de logins de usuário da Twitch (nomes de canal).
        token (str): Token de acesso da API da Twitch.

    Returns:
        dict: Um dicionário mapeando login para os dados da stream (is_live, game_name, title).
    """
    if not user_logins or not token:
        return {}
    
    url = f"{TWITCH_HELIX_URL}/streams"
    headers = {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': f'Bearer {token}'
    }
    params = [('user_login', login) for login in user_logins]
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        streams_data = response.json().get('data', [])
        
        # Mapeia os dados da stream por login para fácil acesso
        stream_info = {
            stream['user_login'].lower(): {
                'is_live': True,
                'game_name': stream.get('game_name'),
                'title': stream.get('title')
            } for stream in streams_data
        }
        return stream_info
    except requests.exceptions.RequestException as e:
        logging.error(f"Erro de requisição ao buscar informações de stream da Twitch para {user_logins}: {e}", exc_info=True)
        return {}

def get_twitch_users_info(user_logins: list[str], token: str) -> dict:
    """
    Busca informações de usuários da Twitch (incluindo URL do avatar) para uma lista de logins.

    Args:
        user_logins (list[str]): Uma lista de logins de usuário da Twitch.
        token (str): Token de acesso da API da Twitch.

    Returns:
        dict: Um dicionário mapeando login para os dados do usuário (profile_image_url).
    """
    if not user_logins or not token:
        return {}
    
    url = f"{TWITCH_HELIX_URL}/users"
    headers = {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': f'Bearer {token}'
    }
    params = [('login', login) for login in user_logins]
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        users_data = response.json().get('data', [])
        
        # Mapeia os dados do usuário por login para fácil acesso
        user_info = {
            user['login'].lower(): {
                'profile_image_url': user.get('profile_image_url', 'assets/default-avatar.png')
            } for user in users_data
        }
        return user_info
    except requests.exceptions.RequestException as e:
        logging.error(f"Erro de requisição ao buscar informações de usuários da Twitch para {user_logins}: {e}", exc_info=True)
        return {}

@eel.expose
def get_streamers_favoritos() -> dict:
    """
    Obtém a lista de streamers favoritos do usuário logado,
    buscando seus avatares e status de live (com jogo e título) da Twitch.

    Returns:
        dict: Um dicionário com 'status', 'message' (se erro) e 'streamers' (lista de dicionários).
    """
    if not utilizador_logado:
        logging.warning("Tentativa de obter streamers sem usuário logado.")
        return {'status': 'erro', 'message': 'Nenhum utilizador logado.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para obter streamers: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    
    streamers_com_info: list[dict] = []
    try:
        cursor = conn.cursor(dictionary=True)
        id_do_utilizador = utilizador_logado['id']
        
        sql = "SELECT id, nome_streamer FROM streamers_favoritos WHERE id_usuario = %s"
        cursor.execute(sql, (id_do_utilizador,))
        streamers_db = cursor.fetchall()
        
        if not streamers_db:
            return {'status': 'sucesso', 'streamers': []}

        streamer_logins = [s['nome_streamer'].lower() for s in streamers_db]
        
        token = get_twitch_access_token()
        if not token:
            logging.warning("Não foi possível obter token da Twitch. Retornando streamers sem dados de live/avatar.")
            # Retorna streamers com dados padrão se não houver token
            for streamer in streamers_db:
                streamer['is_live'] = False
                streamer['avatar_url'] = 'assets/default-avatar.png'
                streamer['game_name'] = None
                streamer['title'] = None
            return {'status': 'sucesso', 'streamers': streamers_db, 'message': 'Dados da Twitch não disponíveis.'}

        stream_info_map = get_twitch_stream_info(streamer_logins, token)
        user_info_map = get_twitch_users_info(streamer_logins, token)
        
        for streamer in streamers_db:
            nome_lower = streamer['nome_streamer'].lower()
            stream_data = stream_info_map.get(nome_lower, {})
            user_data = user_info_map.get(nome_lower, {}) # Obter info do user (avatar)

            streamer['is_live'] = stream_data.get('is_live', False)
            streamer['game_name'] = stream_data.get('game_name', None)
            streamer['title'] = stream_data.get('title', None)
            streamer['avatar_url'] = user_data.get('profile_image_url', 'assets/default-avatar.png')
            streamer['login'] = nome_lower # Garante que o login esteja presente para o link do frontend
            
            streamers_com_info.append(streamer)
            
        logging.info(f"Streamers favoritos para '{utilizador_logado.get('email', 'N/A')}' carregados.")
        return {'status': 'sucesso', 'streamers': streamers_com_info}

    except Exception as e:
        logging.error(f"Erro inesperado ao buscar dados dos streamers para '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        # Em caso de erro, retorna a lista com dados padrão para não quebrar a interface
        for streamer in streamers_db: # streamers_db deve estar definido aqui do fetchall()
            streamer['is_live'] = False
            streamer['avatar_url'] = 'assets/default-avatar.png'
            streamer['game_name'] = None
            streamer['title'] = None
            streamer['login'] = streamer['nome_streamer'].lower() # Adiciona o login fallback
        return {'status': 'sucesso', 'streamers': streamers_db, 'message': f'Erro ao carregar dados dos streamers: {e}'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def adicionar_streamer(nome_streamer: str) -> dict:
    """
    Adiciona um novo streamer favorito para o usuário logado.

    Args:
        nome_streamer (str): O nome de usuário do streamer na Twitch.

    Returns:
        dict: Um dicionário com 'status' e 'message', e 'streamer' (se sucesso).
    """
    if not utilizador_logado:
        logging.warning("Tentativa de adicionar streamer sem usuário logado.")
        return {'status': 'erro', 'message': 'Precisa estar logado para adicionar streamers.'}
    if not nome_streamer:
        return {'status': 'erro', 'message': 'O nome do streamer não pode ser vazio.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para adicionar streamer: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        # Verifica se o streamer já está na lista do usuário
        cursor.execute("SELECT id FROM streamers_favoritos WHERE id_usuario = %s AND nome_streamer = %s", 
                       (id_do_utilizador, nome_streamer))
        if cursor.fetchone():
            return {'status': 'erro', 'message': f'"{nome_streamer}" já está na sua lista de favoritos.'}
        
        sql = "INSERT INTO streamers_favoritos (id_usuario, nome_streamer) VALUES (%s, %s)"
        cursor.execute(sql, (id_do_utilizador, nome_streamer))
        conn.commit()
        novo_id = cursor.lastrowid
        logging.info(f"Streamer '{nome_streamer}' adicionado por '{utilizador_logado.get('email', 'N/A')}'.")
        return {'status': 'sucesso', 'message': 'Streamer adicionado com sucesso!', 'streamer': {'id': novo_id, 'nome_streamer': nome_streamer}}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao adicionar streamer '{nome_streamer}' para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao adicionar streamer: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def remover_streamer(id_streamer: int) -> dict:
    """
    Remove um streamer favorito da lista do usuário logado.

    Args:
        id_streamer (int): O ID do streamer a ser removido.

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    if not utilizador_logado:
        logging.warning("Tentativa de remover streamer sem usuário logado.")
        return {'status': 'erro', 'message': 'Nenhum utilizador logado.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para remover streamer: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        # Garante que apenas o streamer do usuário logado seja removido
        sql = "DELETE FROM streamers_favoritos WHERE id = %s AND id_usuario = %s"
        cursor.execute(sql, (id_streamer, id_do_utilizador))
        conn.commit()
        if cursor.rowcount > 0:
            logging.info(f"Streamer com ID {id_streamer} removido por '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'sucesso', 'message': 'Streamer removido com sucesso!'}
        else:
            logging.warning(f"Tentativa de remover streamer com ID {id_streamer} falhou. Não encontrado ou não pertence ao usuário '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'erro', 'message': 'Streamer não encontrado ou não pertence a este utilizador.'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao remover streamer com ID {id_streamer} para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao remover streamer: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# --- Funções da Biblioteca de Jogos ---

@eel.expose
def adicionar_jogo(nome_jogo: str, plataforma: str, status_jogo: str, 
                   horas_jogadas: float = 0.0, avaliacao: int or None = None, observacoes: str or None = None) -> dict:
    """
    Adiciona um novo jogo à biblioteca do usuário logado.

    Args:
        nome_jogo (str): Nome do jogo.
        plataforma (str): Plataforma do jogo (PC, PS5, etc.).
        status_jogo (str): Status do jogo (Jogando, Completo, etc.).
        horas_jogadas (float, optional): Horas jogadas. Padrão para 0.0.
        avaliacao (int, optional): Avaliação de 1 a 5. Padrão para None.
        observacoes (str, optional): Anotações sobre o jogo. Padrão para None.

    Returns:
        dict: Um dicionário com 'status', 'message' e 'jogo_id' (se sucesso).
    """
    if not utilizador_logado:
        logging.warning("Tentativa de adicionar jogo sem usuário logado.")
        return {'status': 'erro', 'message': 'Precisa estar logado para adicionar jogos.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para adicionar jogo: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        
        # Verifica se o jogo já existe para este usuário na mesma plataforma
        cursor.execute("SELECT id FROM jogos WHERE id_usuario = %s AND nome_jogo = %s AND plataforma = %s", 
                       (id_do_utilizador, nome_jogo, plataforma))
        if cursor.fetchone():
            return {'status': 'erro', 'message': f'"{nome_jogo}" nesta plataforma já está na sua biblioteca.'}

        sql = """
            INSERT INTO jogos (id_usuario, nome_jogo, plataforma, status_jogo, horas_jogadas, avaliacao, observacoes)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        valores = (id_do_utilizador, nome_jogo, plataforma, status_jogo, horas_jogadas, avaliacao, observacoes)
        cursor.execute(sql, valores)
        conn.commit()
        novo_id = cursor.lastrowid
        logging.info(f"Jogo '{nome_jogo}' adicionado por '{utilizador_logado.get('email', 'N/A')}' (ID: {novo_id}).")
        return {'status': 'sucesso', 'message': 'Jogo adicionado com sucesso!', 'jogo_id': novo_id}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao adicionar jogo '{nome_jogo}' para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao adicionar jogo: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def get_jogos_usuario() -> dict:
    """
    Obtém a lista de todos os jogos do usuário logado.

    Returns:
        dict: Um dicionário com 'status', 'message' (se erro) e 'jogos' (lista de dicionários).
    """
    if not utilizador_logado:
        logging.warning("Tentativa de obter jogos sem usuário logado.")
        return {'status': 'erro', 'message': 'Nenhum utilizador logado.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para obter jogos: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor(dictionary=True)
        id_do_utilizador = utilizador_logado['id']
        sql = "SELECT id, nome_jogo, plataforma, status_jogo, horas_jogadas, avaliacao, observacoes, data_adicao FROM jogos WHERE id_usuario = %s ORDER BY nome_jogo"
        cursor.execute(sql, (id_do_utilizador,))
        jogos_db = cursor.fetchall()
        
        # Converte objetos datetime para string ISO formatável para JSON
        for jogo in jogos_db:
            if 'data_adicao' in jogo and isinstance(jogo['data_adicao'], datetime):
                jogo['data_adicao'] = jogo['data_adicao'].isoformat()
        
        logging.info(f"Jogos para '{utilizador_logado.get('email', 'N/A')}' carregados.")
        return {'status': 'sucesso', 'jogos': jogos_db}
    except Exception as e:
        logging.error(f"Erro inesperado ao obter jogos do usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao obter jogos: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def atualizar_jogo(id_jogo: int, nome_jogo: str, plataforma: str, status_jogo: str,
                   horas_jogadas: float, avaliacao: int or None, observacoes: str or None) -> dict:
    """
    Atualiza as informações de um jogo específico na biblioteca do usuário logado.

    Args:
        id_jogo (int): ID do jogo a ser atualizado.
        nome_jogo (str): Novo nome do jogo.
        plataforma (str): Nova plataforma.
        status_jogo (str): Novo status.
        horas_jogadas (float): Novas horas jogadas.
        avaliacao (int or None): Nova avaliação.
        observacoes (str or None): Novas observações.

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    if not utilizador_logado:
        logging.warning("Tentativa de atualizar jogo sem usuário logado.")
        return {'status': 'erro', 'message': 'Precisa estar logado para atualizar jogos.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para atualizar jogo: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        sql = """
            UPDATE jogos SET 
                nome_jogo = %s, plataforma = %s, status_jogo = %s, 
                horas_jogadas = %s, avaliacao = %s, observacoes = %s 
            WHERE id = %s AND id_usuario = %s
        """
        valores = (nome_jogo, plataforma, status_jogo, horas_jogadas, avaliacao, observacoes, id_jogo, id_do_utilizador)
        cursor.execute(sql, valores)
        conn.commit()
        if cursor.rowcount > 0:
            logging.info(f"Jogo com ID {id_jogo} atualizado por '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'sucesso', 'message': 'Jogo atualizado com sucesso!'}
        else:
            logging.warning(f"Tentativa de atualizar jogo com ID {id_jogo} falhou. Não encontrado ou não pertence ao usuário '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'erro', 'message': 'Jogo não encontrado ou não pertence a este utilizador.'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao atualizar jogo com ID {id_jogo} para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao atualizar jogo: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def remover_jogo(id_jogo: int) -> dict:
    """
    Remove um jogo da biblioteca do usuário logado.

    Args:
        id_jogo (int): O ID do jogo a ser removido.

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    if not utilizador_logado:
        logging.warning("Tentativa de remover jogo sem usuário logado.")
        return {'status': 'erro', 'message': 'Precisa estar logado para remover jogos.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para remover jogo: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}
    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        sql = "DELETE FROM jogos WHERE id = %s AND id_usuario = %s"
        cursor.execute(sql, (id_jogo, id_do_utilizador))
        conn.commit()
        if cursor.rowcount > 0:
            logging.info(f"Jogo com ID {id_jogo} removido por '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'sucesso', 'message': 'Jogo removido com sucesso!'}
        else:
            logging.warning(f"Tentativa de remover jogo com ID {id_jogo} falhou. Não encontrado ou não pertence ao usuário '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'erro', 'message': 'Jogo não encontrado ou não pertence a este utilizador.'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao remover jogo com ID {id_jogo} para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao remover jogo: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

# --- Funções do Bloco de Notas ---

@eel.expose
def adicionar_nota(titulo: str, conteudo: str) -> dict:
    """
    Adiciona uma nova nota para o usuário logado.

    Args:
        titulo (str): Título da nota.
        conteudo (str): Conteúdo da nota.

    Returns:
        dict: Um dicionário com 'status', 'message' e 'nota_id' (se sucesso).
    """
    if not utilizador_logado:
        logging.warning("Tentativa de adicionar nota sem usuário logado.")
        return {'status': 'erro', 'message': 'Precisa estar logado para adicionar notas.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para adicionar nota: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}

    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        
        sql = "INSERT INTO notas (id_usuario, titulo, conteudo) VALUES (%s, %s, %s)"
        valores = (id_do_utilizador, titulo, conteudo)
        cursor.execute(sql, valores)
        conn.commit()
        novo_id = cursor.lastrowid
        logging.info(f"Nota '{titulo}' adicionada por '{utilizador_logado.get('email', 'N/A')}' (ID: {novo_id}).")
        return {'status': 'sucesso', 'message': 'Nota adicionada com sucesso!', 'nota_id': novo_id}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao adicionar nota '{titulo}' para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao adicionar nota: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def get_notas_usuario() -> dict:
    """
    Obtém a lista de todas as notas do usuário logado.

    Returns:
        dict: Um dicionário com 'status', 'message' (se erro) e 'notas' (lista de dicionários).
    """
    if not utilizador_logado:
        logging.warning("Tentativa de obter notas sem usuário logado.")
        return {'status': 'erro', 'message': 'Nenhum utilizador logado.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para obter notas: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}

    try:
        cursor = conn.cursor(dictionary=True)
        id_do_utilizador = utilizador_logado['id']
        sql = "SELECT id, titulo, conteudo, data_criacao, data_atualizacao FROM notas WHERE id_usuario = %s ORDER BY data_atualizacao DESC"
        cursor.execute(sql, (id_do_utilizador,))
        notas_db = cursor.fetchall()

        for nota in notas_db:
            if 'data_criacao' in nota and isinstance(nota['data_criacao'], datetime):
                nota['data_criacao'] = nota['data_criacao'].isoformat()
            if 'data_atualizacao' in nota and isinstance(nota['data_atualizacao'], datetime):
                nota['data_atualizacao'] = nota['data_atualizacao'].isoformat()
        
        logging.info(f"Notas para '{utilizador_logado.get('email', 'N/A')}' carregadas.")
        return {'status': 'sucesso', 'notas': notas_db}
    except Exception as e:
        logging.error(f"Erro inesperado ao obter notas do usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao obter notas: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def atualizar_nota(id_nota: int, titulo: str, conteudo: str) -> dict:
    """
    Atualiza o título e/ou conteúdo de uma nota existente.

    Args:
        id_nota (int): ID da nota a ser atualizada.
        titulo (str): Novo título da nota.
        conteudo (str): Novo conteúdo da nota.

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    if not utilizador_logado:
        logging.warning("Tentativa de atualizar nota sem usuário logado.")
        return {'status': 'erro', 'message': 'Precisa estar logado para atualizar notas.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para atualizar nota: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}

    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        sql = """
            UPDATE notas SET 
                titulo = %s, conteudo = %s 
            WHERE id = %s AND id_usuario = %s
        """
        valores = (titulo, conteudo, id_nota, id_do_utilizador)
        cursor.execute(sql, valores)
        conn.commit()
        if cursor.rowcount > 0:
            logging.info(f"Nota com ID {id_nota} atualizada por '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'sucesso', 'message': 'Nota atualizada com sucesso!'}
        else:
            logging.warning(f"Tentativa de atualizar nota com ID {id_nota} falhou. Não encontrada ou não pertence ao usuário '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'erro', 'message': 'Nota não encontrada ou não pertence a este utilizador.'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao atualizar nota com ID {id_nota} para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao atualizar nota: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

@eel.expose
def remover_nota(id_nota: int) -> dict:
    """
    Remove uma nota específica do usuário logado.

    Args:
        id_nota (int): ID da nota a ser removida.

    Returns:
        dict: Um dicionário com 'status' e 'message'.
    """
    if not utilizador_logado:
        logging.warning("Tentativa de remover nota sem usuário logado.")
        return {'status': 'erro', 'message': 'Precisa estar logado para remover notas.'}
    
    conn, error = get_db_connection()
    if error:
        logging.error(f"Erro ao conectar ao DB para remover nota: {error}")
        return {'status': 'erro', 'message': f'Erro de conexão: {error}'}

    try:
        cursor = conn.cursor()
        id_do_utilizador = utilizador_logado['id']
        sql = "DELETE FROM notas WHERE id = %s AND id_usuario = %s"
        cursor.execute(sql, (id_nota, id_do_utilizador))
        conn.commit()
        if cursor.rowcount > 0:
            logging.info(f"Nota com ID {id_nota} removida por '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'sucesso', 'message': 'Nota removida com sucesso!'}
        else:
            logging.warning(f"Tentativa de remover nota com ID {id_nota} falhou. Não encontrada ou não pertence ao usuário '{utilizador_logado.get('email', 'N/A')}'.")
            return {'status': 'erro', 'message': 'Nota não encontrada ou não pertence a este utilizador.'}
    except Exception as e:
        conn.rollback()
        logging.error(f"Erro inesperado ao remover nota com ID {id_nota} para o usuário '{utilizador_logado.get('email', 'N/A')}': {e}", exc_info=True)
        return {'status': 'erro', 'message': f'Erro ao remover nota: {e}. Tente novamente.'}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()


# --- INICIALIZAÇÃO DA APLICAÇÃO ---
if __name__ == "__main__":
    logging.info("Iniciando Central Gamer v1.3...") # Atualizado a versão
    try:
        # Verifica se o diretório de avatares existe ou o cria
        avatar_dir = os.path.join('web', 'uploads', 'avatars')
        if not os.path.exists(avatar_dir):
            os.makedirs(avatar_dir)
            logging.info(f"Diretório de avatares criado: {avatar_dir}")

        eel.start('main.html', size=(800, 700))
    except Exception as e:
        logging.critical(f"Erro fatal ao iniciar a aplicação Eel: {e}", exc_info=True)
    finally:
        logging.info("Aplicação fechada.")