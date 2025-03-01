from flask import Flask
from flask_cors import CORS
from configs.config import Config


app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

from configs.routes.signed_routes import signed
from configs.routes.unsigned_routes import unsigned
app.register_blueprint(signed)
app.register_blueprint(unsigned)
