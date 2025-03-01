from flask import Blueprint, request, jsonify, render_template_string
from configs.utils import *
from configs.config import Config
from configs.auth import *
import mysql.connector
import uuid
from datetime import datetime, timedelta


unsigned = Blueprint("unsigned", __name__)

@unsigned.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email é obrigatório"}), 400

    conn = mysql.connector.connect(**Config.DB_CONFIG)
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM usuario WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        conn.close()
        return jsonify({"error": "Usuário não encontrado"}), 404

    user_id = user[0]

    token = str(uuid.uuid4())
    created_at = datetime.now()
    expires_at = created_at + timedelta(hours=1)

    cursor.execute(
        "INSERT INTO password_reset (token, user_id, created_at, expires_at) VALUES (%s, %s, %s, %s)",
        (token, user_id, created_at, expires_at),
    )
    conn.commit()
    cursor.close()
    conn.close()

    ip = request.remote_addr
    reset_link = f"http://{ip}:5000/reset-password/{token}"
    send_reset_email(email, reset_link)

    return jsonify({"message": "Email enviado com sucesso"}), 200

@unsigned.route("/reset-password/<token>", methods=["GET"])
def reset_password(token):
    conn = mysql.connector.connect(**Config.DB_CONFIG)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT user_id, expires_at FROM password_reset WHERE token = %s", (token,)
    )
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        return jsonify({"error": "Token inválido"}), 404

    user_id, expires_at = result

    if datetime.now() > expires_at:
        cursor.close()
        conn.close()
        return jsonify({"error": "Token expirado"}), 400

    cursor.close()
    conn.close()

    return render_template_string(
        """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Redefinição de Senha</title>
    </head>
    <body>
        <h2>Redefinição de Senha</h2>
        <form action="/reset-password/{{ token }}" method="POST">
            <label for="password">Nova Senha:</label><br>
            <input type="password" id="password" name="password"><br>
            <label for="confirm_password">Confirme a Nova Senha:</label><br>
            <input type="password" id="confirm_password" name="confirm_password"><br><br>
            <input type="submit" value="Redefinir Senha">
        </form>
    </body>
    </html>
    """,
        token=token,
    )

@unsigned.route("/reset-password/<token>", methods=["POST"])
def update_password(token):
    data = request.form
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not password or not confirm_password:
        return jsonify({"error": "Todos os campos são obrigatórios"}), 400

    if password != confirm_password:
        return jsonify({"error": "As senhas não coincidem"}), 400

    conn = mysql.connector.connect(**Config.DB_CONFIG)
    cursor = conn.cursor()

    cursor.execute("SELECT user_id FROM password_reset WHERE token = %s", (token,))
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        return jsonify({"error": "Token inválido"}), 404

    user_id = result[0]
    new_password = gerarHash(password)
    cursor.execute(
        "UPDATE usuario SET senha = %s WHERE id = %s", (new_password, user_id)
    )
    conn.commit()

    cursor.execute("DELETE FROM password_reset WHERE token = %s", (token,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Senha redefinida com sucesso"}), 200

@unsigned.route("/confirmar_email", methods=["GET"])
def confirm_email():
    token = request.args.get("token")
    conexao = mysql.connector.connect(**Config.DB_CONFIG)

    cursor = conexao.cursor()
    cursor.execute("SELECT * FROM usuario WHERE token_confirmacao = %s", (token,))
    code_exists = cursor.fetchone()
    cursor.close()

    if code_exists:
        cursor = conexao.cursor()
        cursor.execute(
            "UPDATE usuario SET confirmado = 1 WHERE token_confirmacao = %s", (token,)
        )
        conexao.commit()

        cursor.close()
        conexao.close()
        return "<H1>Email confirmado com sucesso.</H1>"

    return "<H1>Erro ao confirmar o email.</H1>"

@unsigned.route("/getEnterprise/<id>", methods=["GET"])
def getEnterprise(id):
    try:
        conexao = mysql.connector.connect(**Config.DB_CONFIG)
        cursor = conexao.cursor()

        cursor.execute(
            "SELECT nome, servico, cidade, estado, logo, logradouro, descricao, preco, id  FROM empresa WHERE id = %s",
            (id,),
        )
        empresa = cursor.fetchone()

        cursor.close()
        conexao.close()

        formatReturn = [
            {
                "nome": empresa[0],
                "servico": empresa[1],
                "cidade": empresa[2],
                "estado": empresa[3],
                "logo": empresa[4],
                "logradouro": empresa[5],
                "descricao": empresa[6],
                "preco": empresa[7],
                "id": empresa[8],
            }
        ]

        return jsonify(formatReturn)

    except:
        return jsonify({"message": "Erro ao validar informações da empresa"})

@unsigned.route("/register", methods=["POST"])
def register():
    try:
        auth = request.json
        conexao = mysql.connector.connect(**Config.DB_CONFIG)

        email = auth["email"]
        senha = auth["senha"]
        nome = auth["nome"]
        telefone = auth["telefone"]
        cep = auth["cep"]
        bairro = auth["bairro"]
        logradouro = auth["logradouro"]
        numero = auth["numero"]
        cidade = auth["cidade"]
        estado = auth["estado"]
        complemento = auth["complemento"]
        role = auth["role"]

        hash_senha = gerarHash(senha)

        if not email or not senha:
            return jsonify({"message": "Email e senha são obrigatórios"}), 400

        cursor = conexao.cursor()
        cursor.execute("SELECT * FROM usuario WHERE email = %s", (email,))
        usuario_existente = cursor.fetchone()
        cursor.close()

        if usuario_existente:
            return jsonify({"message": "Email ja cadastrado"}), 400

        token_confirmação = geraToken()
        cursor = conexao.cursor()

        cursor.execute(
            "INSERT INTO usuario (email, senha, nome, telefone, cep, bairro, logradouro, numero, cidade, estado, complemento, role, token_confirmacao) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                email,
                hash_senha,
                nome,
                telefone,
                cep,
                bairro,
                logradouro,
                numero,
                cidade,
                estado,
                complemento,
                role,
                token_confirmação,
            ),
        )
        conexao.commit()

        cursor.close()

        send_email(email, nome, token_confirmação)

        return jsonify({"message": "Usuario cadastrado com sucesso"})
    except Exception as e:
        return jsonify({"message": f"Erro ao cadastrar pessoa {str(e)}"}), 500
    
@unsigned.route("/company-list", methods=["GET"])
def listCompany():
    try:

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
        cursor = conexao.cursor()

        cursor.execute(
            "SELECT id, nome, servico, cidade, estado, logo, logradouro FROM empresa"
        )
        empresas = cursor.fetchall()

        cursor.close()
        conexao.close()

        empresa_formatada = [
            {
                "id": empresa[0],
                "nome": empresa[1],
                "servico": empresa[2],
                "cidade": empresa[3],
                "estado": empresa[4],
                "logo": empresa[5],
            }
            for empresa in empresas
        ]

        return jsonify(empresa_formatada)
    except Exception as e:
        return jsonify({"message": f"Ocorreu um erro: {str(e)}"})
    
@unsigned.route("/register-company", methods=["POST"])
def registercompany():
    try:
        auth = request.json
        conexao = mysql.connector.connect(**Config.DB_CONFIG)
        cnpj = auth["cnpj"]
        nome = auth["nome"]
        email = auth["email"]
        senha = auth["senha"]
        ie = auth["ie"]
        servico = auth["servico"]
        cep = auth["cep"]
        bairro = auth["bairro"]
        logradouro = auth["logradouro"]
        numero = auth["numero"]
        complemento = auth["complemento"]
        cidade = auth["cidade"]
        estado = auth["estado"]
        role = "provider"

        hash_senha = gerarHash(senha)
        print(hash_senha)

        cursor = conexao.cursor()

        cursor.execute(
            "INSERT INTO empresa (cnpj, nome, email, senha, ie, servico, cep, bairro, logradouro, numero, complemento, cidade, estado, role) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                cnpj,
                nome,
                email,
                hash_senha,
                ie,
                servico,
                cep,
                bairro,
                logradouro,
                numero,
                complemento,
                cidade,
                estado,
                role,
            ),
        )
        conexao.commit()

        cursor.close()

        return jsonify({"message": "Empresa Registrada com sucesso"})
    except Exception as e:
        return jsonify({"message": f"Erro ao cadastrar empresa {str(e)}"}), 500
    
@unsigned.route("/login", methods=["POST"])
def login():
    try:
        auth = request.json
        user = auth["username"]
        pswr = auth["password"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
        cursor = conexao.cursor()

        cursor.execute("SELECT * FROM usuario WHERE email = %s", (user,))
        usuario_existente = cursor.fetchone()
        type = "usuario"

        if not usuario_existente:
            cursor.execute("SELECT * FROM empresa WHERE cnpj = %s", (user,))
            usuario_existente = cursor.fetchone()
            type = "empresa"

        if usuario_existente:
            if verificaSenha(pswr, usuario_existente[3].encode("utf-8")):
                payload = {
                    "id": usuario_existente[0],
                    "exp": datetime.now() + timedelta(days=30),
                }
                token = jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
                return (
                    jsonify(
                        {
                            "message": "Login realizado com sucesso",
                            "token": token,
                            "user": type,
                        }
                    ),
                    200,
                )
            else:
                return jsonify({"message": "Nome de usuário ou senha incorreto."}), 401

        else:
            return jsonify({"message": f"Nome de usuário ou senha incorreto."}), 404

    except Exception as e:
        return jsonify({"message": f"Erro ao realizar login"}), 400
    
@unsigned.route("/get-reviews/<id>", methods=["GET"])
def get_reviews(id):
    try:
        conexao = mysql.connector.connect(**Config.DB_CONFIG)
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT CASE WHEN a.anonimo THEN 'Anônimo' 
            ELSE SUBSTRING_INDEX(u.nome, ' ', 1) 
            END AS id_usuario, a.rating, a.titulo, a.comentario, a.anonimo 
            FROM avaliacoes a LEFT JOIN usuario u ON a.id_usuario = u.id 
            WHERE a.id_empresa = %s;
            """,
            (id,),
        )

        reviews = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(reviews)
    except Exception as e:
        return jsonify({"message": f"Erro: {str(e)}"}), 500