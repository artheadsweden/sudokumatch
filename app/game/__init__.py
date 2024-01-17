from flask import  render_template
from flask.blueprints import Blueprint
import json
import mongeasy

game_bp = Blueprint('game', __name__)

def get_puzzle(diff_level):
        Sudoku = mongeasy.create_document_class('Sudoku','sudokus')

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

        return p['sudoku'], p['solution']

@game_bp.route('/')
def game_index():
    sudoku = '0' * 81
    solution = '0' * 81
    return render_template('game_index.html', sudoku=sudoku, solution=solution)

@game_bp.route('/<diff_level>')
def game_level(diff_level):
    diff_level = diff_level.replace('_',' ')  
    diff_level = diff_level.title()
    if diff_level not in ['Simple', 'Easy', 'Medium', 'Hard', 'Very Hard', 'Extreme']:
         return 'Invalid difficulty level'
    print(f'Getting puzzle for {diff_level}')
    puzzle, solution = get_puzzle(diff_level)
    print(f'Got puzzle for {diff_level}')
    return json.dumps({'puzzle': puzzle,'solution': solution})