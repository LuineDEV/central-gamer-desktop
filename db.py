import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import logging

# Configura o logging para este módulo
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')

# Carrega as variáveis de ambiente do arquivo .env
# Certifique-se de que o arquivo .env está na raiz do seu projeto.
load_dotenv()

def get_db_connection() -> tuple[mysql.connector.connection.MySQLConnection | None, str | None]:
    """
    Tenta estabelecer uma conexão com o banco de dados MySQL
    usando credenciais carregadas de variáveis de ambiente.

    Returns:
        tuple[mysql.connector.connection.MySQLConnection | None, str | None]:
        Uma tupla contendo o objeto de conexão (ou None em caso de erro)
        e uma mensagem de erro (ou None em caso de sucesso).
    """
    try:
        conn = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_DATABASE'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=int(os.getenv('DB_PORT', 3306)) # O port pode ser opcional ou string
        )
        if conn.is_connected():
            return conn, None
    except Error as e:
        # Registra o erro de conexão, mas não expõe detalhes sensíveis
        logging.error(f"Erro ao conectar ao banco de dados: {e}")
        return None, "Não foi possível conectar ao banco de dados. Por favor, tente mais tarde."
    except ValueError:
        logging.error("Erro: A variável de ambiente DB_PORT não é um número inteiro válido.")
        return None, "Erro de configuração do banco de dados (porta inválida)."
    except Exception as e:
        # Captura outras exceções inesperadas durante a conexão
        logging.critical(f"Um erro crítico ocorreu ao tentar conectar ao DB: {e}", exc_info=True)
        return None, "Um erro inesperado ocorreu ao tentar conectar ao banco de dados."
    
    return None, "Um erro desconhecido ocorreu na conexão com o banco de dados."