from flask.blueprints import Blueprint


user_bp = Blueprint('user', __name__)


@user_bp.route('/')
def user_index():
    return 'User index'