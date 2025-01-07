from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from datetime import datetime, timedelta
import mysql.connector
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import secrets, string, smtplib, jwt, bcrypt
import uuid
from functools import wraps


app = Flask(__name__)
CORS(app)
app.config["SECRET_KEY"] = "pets"


db_config = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "petsinn",
}


smtp_server = "smtp.gmail.com"
port = 587
email = "put-your-smtp-email-here"
password = "password"


def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token de acesso ausente."}), 401

        try:
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expirado. Faça login novamente."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token inválido. Faça login novamente."}), 401

        return f(*args, **kwargs)

    return decorated_function


def gerarHash(senha):
    salt = bcrypt.gensalt()
    senhaHash = bcrypt.hashpw(senha.encode("utf-8"), salt)
    return senhaHash


def verificaSenha(senha, senhaHash):
    return bcrypt.checkpw(senha.encode("utf-8"), senhaHash)


def geraToken(length=15):
    message = string.ascii_letters + string.digits
    return "".join(secrets.choice(message) for i in range(length))


def send_email(destinatario, nome, token):

    mensagem = MIMEMultipart()
    mensagem["From"] = email
    mensagem["To"] = destinatario
    mensagem["Subject"] = "Confirmação de E-mail"

    ip = request.remote_addr

    texto = f"""
    Olá {nome},

    Para confirmar seu e-mail, clique no link abaixo:
    http://{ip}:5000/confirmar_email?token={token}

    Obrigado!
    """

    mensagem.attach(MIMEText(texto, "plain"))

    try:
        server = smtplib.SMTP(smtp_server, port)
        server.starttls()
        server.login(email, password)
        texto_email = mensagem.as_string()
        server.sendmail(email, destinatario, texto_email)
        server.quit()
        print("E-mail enviado com sucesso")

    except Exception as e:
        print(f"Erro ao enviar o Email: {str(e)}")


def send_reset_email(destinatario, reset_link):
    mensagem = MIMEMultipart()
    mensagem["From"] = email
    mensagem["To"] = destinatario
    mensagem["Subject"] = "Redefinição de Senha"

    body = f"""
    <html>
        <body>
            <h2>Redefinição de Senha</h2>
            <p>Você solicitou a redefinição de senha. Clique no link abaixo para redefinir sua senha:</p>
            <a href="{reset_link}">Redefinir Senha</a>
            <p>Se você não solicitou essa alteração, por favor, ignore este email.</p>
        </body>
    </html>
    """
    mensagem.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP(smtp_server, port)
        server.starttls()
        server.login(email, password)
        server.sendmail(email, destinatario, mensagem.as_string())
        server.quit()
        print("Email enviado com sucesso!")
    except Exception as e:
        print(f"Erro ao enviar email: {e}")


@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email é obrigatório"}), 400

    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM usuario WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        conn.close()
        return jsonify({"error": "Usuário não encontrado"}), 404

    user_id = user[0]

    token = str(uuid.uuid4())
    created_at = datetime.utcnow()
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


@app.route("/reset-password/<token>", methods=["GET"])
def reset_password(token):
    conn = mysql.connector.connect(**db_config)
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

    if datetime.utcnow() > expires_at:
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


@app.route("/reset-password/<token>", methods=["POST"])
def update_password(token):
    data = request.form
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not password or not confirm_password:
        return jsonify({"error": "Todos os campos são obrigatórios"}), 400

    if password != confirm_password:
        return jsonify({"error": "As senhas não coincidem"}), 400

    conn = mysql.connector.connect(**db_config)
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


@app.route("/confirmar_email", methods=["GET"])
def confirm_email():
    token = request.args.get("token")
    conexao = mysql.connector.connect(**db_config)

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


@app.route("/select-pet", methods=["GET"])
@token_required
def select_pet():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            "SELECT nome, id FROM pets WHERE id_dono = %s",
            (user_id,),
        )
        pets = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(pets)

    except Exception as e:
        return jsonify({"message": f"Erro {str(e)}"})
    
@app.route("/chats-enterprise", methods=["GET"])
@token_required
def chats_enterprise():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            "SELECT DISTINCT "
            "u.id AS usuario_id, "
            "u.nome AS usuario_nome "
            "FROM reservas r "
            "JOIN usuario u "
            "ON r.local_id = %s",
            (user_id,) ,
        )

        empresas = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(empresas), 200

    except Exception as e:
        return jsonify({"message": f"Erro: {str(e)}"})

@app.route("/enable-chats", methods=["GET"])
@token_required
def enable_chats():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            "SELECT DISTINCT "
            "e.id AS empresa_id, "
            "e.nome AS empresa_nome, "
            "e.cidade, "
            "e.estado, "
            "e.logo "
            "FROM reservas r "
            "JOIN empresa e ON r.local_id = e.id "
            "WHERE r.cliente_id = %s",
            (user_id,),
        )

        empresas = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(empresas), 200

    except Exception as e:
        return jsonify({"message": f"Erro: {str(e)}"})


@app.route("/reserva-data", methods=["GET"])
@token_required
def get_reserva():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)

        query = (
            "SELECT r.id AS reserva_id, r.local_id, e.nome AS local_nome, e.logo, r.status, d.data_reserva "
            "FROM reservas r "
            "JOIN data_reserva d ON r.id = d.reserva_id "
            "JOIN empresa e ON r.local_id = e.id "
            "WHERE r.cliente_id = %s "
            "ORDER BY r.id"
        )

        cursor.execute(query, (user_id,))

        reservas_datas = {}

        for row in cursor.fetchall():
            reserva_id = row["reserva_id"]
            local_id = row["local_id"]
            local_nome = row["local_nome"]
            logo = row["logo"]
            status = row["status"]
            data_reserva = row["data_reserva"]

            if reserva_id not in reservas_datas:
                reservas_datas[reserva_id] = {
                    "reserva_id": reserva_id,
                    "local_id": local_id,
                    "local_nome": local_nome,
                    "logo": logo,
                    "status": status,
                    "datas_reserva": [],
                }

            data_reserva_formatada = data_reserva.strftime("%Y-%m-%d")
            reservas_datas[reserva_id]["datas_reserva"].append(data_reserva_formatada)

        cursor.close()
        conexao.close()

        reservas_list = list(reservas_datas.values())

        return jsonify(reservas_list), 200

    except Exception as e:
        return (
            jsonify({"message": "Erro ao obter as datas de reserva.", "error": str(e)}),
            500,
        )


@app.route("/date-enterprise", methods=["GET"])
@token_required
def date_enterprise():
    try:
        date_str = request.args.get("date")

        if not date_str:
            return jsonify({"message": "A data é necessária"}), 400

        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.secret_key, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor(dictionary=True)

        cursor.execute(
            """
        SELECT
            r.id AS reserva_id,
            r.status as status,
            u.nome AS cliente_nome,
            p.nome AS pet_nome,
            p.tipo AS pet_tipo,
            p.porte AS pet_porte,
            p.raca AS pet_raca,
            p.adicional AS pet_adicional
        FROM
            data_reserva d
        JOIN
            reservas r ON d.reserva_id = r.id
        JOIN
            usuario u ON r.cliente_id = u.id
        JOIN
            pets p ON r.pet_id = p.id
        WHERE
            r.local_id = %s AND d.data_reserva = %s
        """,
            (
                user_id,
                date_str,
            ),
        )

        reservas = cursor.fetchall()
        cursor.close()
        conexao.close()

        if not reservas:
            return jsonify({"message": "Não há reservas para a data fornecida."}), 404

        return jsonify({"reservas": reservas}), 200

    except Exception as e:
        return jsonify({"message": f"Erro {str(e)}"})


@app.route("/reserva", methods=["POST"])
@token_required
def make_reservation():
    try:
        data = request.json
        datas_reserva = data.get("datas", [])
        local_id = data.get("id")
        pet_id = data.get("pet_id")

        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]
        status = "pendente"

        if not datas_reserva:
            return jsonify({"message": "Nenhuma data foi informada"}), 400

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "SELECT num_reserva FROM empresa WHERE id = %s",
            (local_id,)
        )
        result = cursor.fetchone()
        if not result:
            return jsonify({"message": "Empresa não encontrada"}), 404
        num_reserva_max = result[0]

        for data_reserva in datas_reserva:
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM data_reserva dr
                JOIN reservas r ON dr.reserva_id = r.id
                WHERE r.local_id = %s AND dr.data_reserva = %s
                """,
                (local_id, data_reserva)
            )
            count_result = cursor.fetchone()
            if count_result[0] >= num_reserva_max:
                return jsonify({"message": f"Reservas lotadas para a data {data_reserva}"}), 400

        cursor.execute(
            "INSERT INTO reservas (cliente_id, local_id, pet_id, status) VALUES (%s, %s, %s, %s)",
            (user_id, local_id, pet_id, status),
        )
        reserva_id = cursor.lastrowid

        for data_reserva in datas_reserva:
            cursor.execute(
                "INSERT INTO data_reserva (reserva_id, data_reserva) VALUES (%s, %s)",
                (reserva_id, data_reserva),
            )

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"message": "Reserva realizada com sucesso."}), 200
    except Exception as e:
        return (
            jsonify(
                {"message": f"Erro ao processar a reserva. {str(e)}", "error": str(e)}
            ),
            500,
        )



@app.route("/updateEnterprise", methods=["PUT"])
@token_required
def updateEnterprise():
    try:
        auth = request.json

        nome = auth["nome"]
        servico = auth["servico"]
        cidade = auth["cidade"]
        estado = auth["estado"]
        logradouro = auth["logradouro"]
        descricao = auth["descricao"]
        preco = auth["preco"]

        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "UPDATE empresa SET nome = %s, servico = %s, cidade = %s, estado = %s, logradouro = %s, descricao = %s, preco = %s WHERE id = %s",
            (
                nome,
                servico,
                cidade,
                estado,
                logradouro,
                descricao,
                preco,
                user_id,
            ),
        )

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"message": "Usuario alterado com sucesso"})

    except Exception as e:
        return jsonify({"message": f"erro {str(e)}"})


@app.route("/infoEnterprise", methods=["GET"])
@token_required
def infoEnterprise():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "SELECT nome, servico, cidade, estado, logo, logradouro, descricao, preco, id FROM empresa WHERE id = %s",
            (user_id,),
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


@app.route("/infoClient", methods=["GET"])
@token_required
def infoClient():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "SELECT nome, telefone, cep, bairro, logradouro, numero, cidade, estado FROM usuario WHERE id = %s",
            (user_id,),
        )
        usuario = cursor.fetchone()

        cursor.close()
        conexao.close()

        formatReturn = [
            {
                "nome": usuario[0],
                "telefone": usuario[1],
                "cep": usuario[2],
                "bairro": usuario[3],
                "logradouro": usuario[4],
                "numero": usuario[5],
                "cidade": usuario[6],
                "estado": usuario[7],
            }
        ]

        return jsonify(formatReturn)

    except:
        return jsonify({"message": "Erro ao validar informações da empresa"})


@app.route("/updateClient", methods=["PUT"])
@token_required
def updateClient():
    try:
        auth = request.json

        nome = auth["nome"]
        telefone = auth["telefone"]
        cep = auth["cep"]
        bairro = auth["bairro"]
        logradouro = auth["logradouro"]
        numero = auth["numero"]
        cidade = auth["cidade"]
        estado = auth["estado"]
        complemento = auth.get("complemento")

        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "UPDATE usuario SET nome = %s, telefone = %s, cep = %s, bairro = %s, logradouro = %s, numero = %s, cidade = %s, estado = %s, complemento = %s WHERE id = %s",
            (
                nome,
                telefone,
                cep,
                bairro,
                logradouro,
                numero,
                cidade,
                estado,
                complemento,
                user_id,
            ),
        )

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"message": "Usuario alterado com sucesso"})

    except Exception as e:
        return jsonify({"message": f"erro {str(e)}"})


@app.route("/infoPet", methods=["GET"])
@token_required
def infoPet():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "SELECT tipo, nome, raca, porte, adicional, id FROM pets WHERE id_dono = %s",
            (user_id,),
        )
        animais = cursor.fetchall()

        cursor.close()
        conexao.close()

        formatReturn = [
            {
                "tipo": animal[0],
                "nome": animal[1],
                "raca": animal[2],
                "porte": animal[3],
                "adicional": animal[4],
                "id": animal[5],
            }
            for animal in animais
        ]

        return jsonify(formatReturn)

    except Exception as e:
        return jsonify({"message": f"Erro ao validar informações do pet {str(e)} "})


@app.route("/updatePet", methods=["PUT"])
@token_required
def updatePet():
    try:
        auth = request.json

        nome = auth["nome"]
        porte = auth["porte"]
        raca = auth["raca"]
        tipo = auth["tipo"]
        adicional = auth["adicional"]
        pet_id = auth["id"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        cursor.execute(
            "UPDATE pets SET nome = %s, porte = %s, raca = %s, tipo = %s, adicional = %s WHERE id = %s AND id_dono = %s",
            (nome, porte, raca, tipo, adicional, pet_id, user_id),
        )

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"message": "Usuario alterado com sucesso"}), 200

    except Exception as e:
        return jsonify({"message": f"erro {str(e)}"}), 500


@app.route("/getEnterprise/<id>", methods=["GET"])
def getEnterprise(id):
    try:
        conexao = mysql.connector.connect(**db_config)
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


@app.route("/register", methods=["POST"])
def register():

    try:
        auth = request.json
        conexao = mysql.connector.connect(**db_config)

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


@app.route("/company-list", methods=["GET"])
def listCompany():
    try:

        conexao = mysql.connector.connect(**db_config)
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


@app.route("/register-company", methods=["POST"])
def registercompany():
    try:
        auth = request.json
        conexao = mysql.connector.connect(**db_config)
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


@app.route("/login", methods=["POST"])
def login():
    try:
        auth = request.json
        user = auth["username"]
        pswr = auth["password"]

        conexao = mysql.connector.connect(**db_config)
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
                    "exp": datetime.utcnow() + timedelta(days=30),
                }
                token = jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")
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


@app.route("/register-pet", methods=["POST"])
@token_required
def register_pet():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]
        print(user_id)

        auth = request.json
        tipo = auth["tipo"]
        nome = auth["nome"]
        data = auth["date"]
        raca = auth["raca"]
        porte = auth["porte"]
        info = auth["adicional"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "INSERT INTO pets (id_dono, tipo, nome, nascimento, raca, porte, adicional) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (user_id, tipo, nome, data, raca, porte, info),
        )

        conexao.commit()
        cursor.close()

        return jsonify({"message": "Pet incluido com sucesso"}), 200

    except Exception as e:
        return jsonify({"message": f"Erro: {str(e)}"}), 404
    
@app.route("/reservations-day", methods=["GET"])
@token_required
def reservationDay():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]
        
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()
        
        cursor.execute("SELECT num_reserva FROM empresa WHERE id = %s", (user_id, ))
        amount = cursor.fetchone()
        
        cursor.close()
        conexao.close()
        
        return jsonify({"message": amount})
        
    except Exception as e:
        return jsonify({"message": f"Error {str(e)}"})
    
@app.route("/update-days", methods=["PUT"])
@token_required
def updateDays():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]
        
        auth = request.json
        amouth = auth["quantidade"]
        
        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()
        
        cursor.execute("UPDATE empresa SET num_reserva = %s WHERE id = %s", (amouth, user_id, ))
        conexao.commit()
        
        cursor.close()
        conexao.close()
        
        return jsonify({"message": "Quantidade de reservas por dia atualizada"})
        
    except Exception as e:
        return jsonify({"message": f"Error {str(e)}"})
    
@app.route("/finalize-reservation", methods=["POST"])
@token_required
def finalizeResevation():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        auth = request.json
        id = auth["id_reserva"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "UPDATE reservas SET status = 'finalizada' WHERE id = %s AND local_id = %s",
            (
                id,
                user_id,
            ),
        )

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"message": "Sua reserva agora esta finalizada"})
    except Exception as e:
        return jsonify({"erro": f"{str(e)}"})
    
@app.route("/confirm-reservation", methods=["POST"])
@token_required
def confirmReservation():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        auth = request.json
        id = auth["id_reserva"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "UPDATE reservas SET status = 'confirmada' WHERE id = %s AND cliente_id = %s",
            (
                id,
                user_id,
            ),
        )

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"message": "Sua reserva agora esta confirmada"})
    except Exception as e:
        return jsonify({"erro": f"{str(e)}"})


@app.route("/cancel-reservation", methods=["POST"])
@token_required
def cancelReservation():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        auth = request.json
        id = auth["id_reserva"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "UPDATE reservas SET status = 'cancelada' WHERE id = %s AND cliente_id = %s",
            (
                id,
                user_id,
            ),
        )

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({"message": "Sua reserva agora esta cancelada"})
    except Exception as e:
        return jsonify({"erro": f"{str(e)}"})


@app.route("/can-review", methods=["GET"])
@token_required
def can_review():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        local_id = request.headers.get("Local")

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "SELECT COUNT(*) FROM reservas WHERE cliente_id = %s AND status = 'finalizada' AND local_id = %s",
            (
                user_id,
                local_id,
            ),
        )
        result = cursor.fetchone()

        cursor.close()
        conexao.close()

        if result[0] > 0:
            return jsonify({"can_review": True})
        else:
            return jsonify({"can_review": False})
    except Exception as e:
        return jsonify({"message": f"Erro {str(e)}"})


@app.route("/submit-review", methods=["POST"])
@token_required
def submit_review():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_id = payload["id"]

        auth = request.json
        id_empresa = auth["empresaId"]
        rating = auth["rating"]
        titulo = auth["title"]
        comentario = auth["review"]
        anonimo = auth["anonymous"]

        conexao = mysql.connector.connect(**db_config)
        cursor = conexao.cursor()

        cursor.execute(
            "INSERT INTO avaliacoes (id_empresa, id_usuario, rating, titulo, comentario, anonimo) VALUES (%s, %s, %s, %s, %s, %s)",
            (id_empresa, user_id, rating, titulo, comentario, anonimo),
        )

        conexao.commit()
        cursor.close()
        conexao.close()

        return jsonify({"message": "Avaliação enviada com sucesso!"})
    except Exception as e:
        return jsonify({"message": f"Erro: {str(e)}"}), 500


@app.route("/get-reviews/<id>", methods=["GET"])
def get_reviews(id):
    try:
        conexao = mysql.connector.connect(**db_config)
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


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
