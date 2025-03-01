import jwt
import bcrypt
import string
import secrets
from functools import wraps
from flask import request, jsonify
from configs.config import Config

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token de acesso ausente."}), 401
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
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