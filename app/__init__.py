from flask import Flask

app = Flask(__name__)
app.debug = True

from app import main
from app import api
from app import views
