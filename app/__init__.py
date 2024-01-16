from flask import Flask, blueprints
from flask_login import UserMixin, LoginManager
from mongeasy import create_document_class
from bson import ObjectId

login_manager = LoginManager()
# Create User class with mongeasy and UserMixin from flask_login as a base class
User = create_document_class('User', 'users', base_classes=(UserMixin,))
def get_id(self):
    return str(self._id)
# Add get_id method to User class
User.get_id = get_id


def create_app():
    app = Flask(__name__)
   # Define the user loader function for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        # Load the user object from the database using the user_id
        user_id = ObjectId(user_id)
        user = User.find(_id=user_id).first()
        return user
    
    # Register the blueprints
    from user import user_bp
    from game import game_bp
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(game_bp, url_prefix='/game')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)