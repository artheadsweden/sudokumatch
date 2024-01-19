from flask import Flask, render_template
from flask_login import UserMixin, LoginManager
from mongeasy import create_document_class
from bson import ObjectId
import json

login_manager = LoginManager()
# Create User class with mongeasy and UserMixin from flask_login as a base class
User = create_document_class('User', 'users', base_classes=(UserMixin,))
def get_id(self):
    return str(self._id)
# Add get_id method to User class
User.get_id = get_id

def get_puzzle(diff_level):
        Sudoku = create_document_class('Sudoku','sudokus')

        agg = [
                {
                    '$match': {
                        'level': diff_level
                    }
                }, {
                    '$sample': {
                        'size': 1
                    }
                }
            ]
        puzzle = Sudoku.raw_aggregate(agg)
        p = puzzle.next()

        return p['puzzle'], p['solution']


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'lkj/30JKL!LKJSDN830kjsdsfmnk)983jjnsb'
   # Define the user loader function for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        # Load the user object from the database using the user_id
        user_id = ObjectId(user_id)
        user = User.find(_id=user_id).first()
        return user
    
    @app.route('/')
    def game_index():
        sudoku = '0' * 81
        solution = '0' * 81
        return render_template('sudoku.html', sudoku=sudoku, solution=solution)

    @app.route('/<diff_level>')
    def game_level(diff_level):
        diff_level = diff_level.replace('_',' ')  
        diff_level = diff_level.title()
        if diff_level not in ['Simple', 'Easy', 'Medium', 'Hard', 'Very Hard', 'Extreme']:
            return 'Invalid difficulty level'
        puzzle, solution = get_puzzle(diff_level)
    
        return json.dumps({'puzzle': puzzle.strip(),'solution': solution.strip()})

    return app

app = create_app()





