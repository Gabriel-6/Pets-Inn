from flask import Blueprint, request, jsonify
from configs.auth import token_required
from configs.config import Config
import mysql.connector
import jwt

signed = Blueprint("signed", __name__)

@signed.route("/select-pet", methods=["GET"])
@token_required
def select_pet():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
        cursor = conexao.cursor(dictionary=True)

        cursor.execute("SELECT nome, id FROM pets WHERE id_dono = %s", (user_id,))
        pets = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(pets)

    except Exception as e:
        return jsonify({"message": f"Erro {str(e)}"}), 500
    
@signed.route("/chats-enterprise", methods=["GET"])
@token_required
def chats_enterprise():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/enable-chats", methods=["GET"])
@token_required
def enable_chats():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/reserva-data", methods=["GET"])
@token_required
def get_reserva():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/date-enterprise", methods=["GET"])
@token_required
def date_enterprise():
    try:
        date_str = request.args.get("date")

        if not date_str:
            return jsonify({"message": "A data é necessária"}), 400

        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/reserva", methods=["POST"])
@token_required
def make_reservation():
    try:
        data = request.json
        datas_reserva = data.get("datas", [])
        local_id = data.get("id")
        pet_id = data.get("pet_id")

        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]
        status = "pendente"

        if not datas_reserva:
            return jsonify({"message": "Nenhuma data foi informada"}), 400

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/updateEnterprise", methods=["PUT"])
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
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/infoEnterprise", methods=["GET"])
@token_required
def infoEnterprise():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/infoClient", methods=["GET"])
@token_required
def infoClient():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/updateClient", methods=["PUT"])
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
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/infoPet", methods=["GET"])
@token_required
def infoPet():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/updatePet", methods=["PUT"])
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

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
        cursor = conexao.cursor()

        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
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
    
@signed.route("/register-pet", methods=["POST"])
@token_required
def register_pet():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]
        print(user_id)

        auth = request.json
        tipo = auth["tipo"]
        nome = auth["nome"]
        data = auth["date"]
        raca = auth["raca"]
        porte = auth["porte"]
        info = auth["adicional"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/reservations-day", methods=["GET"])
@token_required
def reservationDay():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]
        
        conexao = mysql.connector.connect(**Config.Config.DB_CONFIG)
        cursor = conexao.cursor()
        
        cursor.execute("SELECT num_reserva FROM empresa WHERE id = %s", (user_id, ))
        amount = cursor.fetchone()
        
        cursor.close()
        conexao.close()
        
        return jsonify({"message": amount})
        
    except Exception as e:
        return jsonify({"message": f"Error {str(e)}"})
    
@signed.route("/update-days", methods=["PUT"])
@token_required
def updateDays():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]
        
        auth = request.json
        amouth = auth["quantidade"]
        
        conexao = mysql.connector.connect(**Config.Config.DB_CONFIG)
        cursor = conexao.cursor()
        
        cursor.execute("UPDATE empresa SET num_reserva = %s WHERE id = %s", (amouth, user_id, ))
        conexao.commit()
        
        cursor.close()
        conexao.close()
        
        return jsonify({"message": "Quantidade de reservas por dia atualizada"})
        
    except Exception as e:
        return jsonify({"message": f"Error {str(e)}"})
    
@signed.route("/finalize-reservation", methods=["POST"])
@token_required
def finalizeResevation():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        auth = request.json
        id = auth["id_reserva"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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
    
@signed.route("/confirm-reservation", methods=["POST"])
@token_required
def confirmReservation():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        auth = request.json
        id = auth["id_reserva"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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


@signed.route("/cancel-reservation", methods=["POST"])
@token_required
def cancelReservation():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        auth = request.json
        id = auth["id_reserva"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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


@signed.route("/can-review", methods=["GET"])
@token_required
def can_review():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        local_id = request.headers.get("Local")

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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


@signed.route("/submit-review", methods=["POST"])
@token_required
def submit_review():
    try:
        token = request.headers.get("Authorization")
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = payload["id"]

        auth = request.json
        id_empresa = auth["empresaId"]
        rating = auth["rating"]
        titulo = auth["title"]
        comentario = auth["review"]
        anonimo = auth["anonymous"]

        conexao = mysql.connector.connect(**Config.DB_CONFIG)
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