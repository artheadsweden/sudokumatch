from flask import  render_template
from flask.blueprints import Blueprint


game_bp = Blueprint('game', __name__)


@game_bp.route('/')
def game_index():
    sudoku = '680905000003000508402108703390720800000000010045006900060804002001002075700013000'
    solution = '687935241913247568452168793396721854278459316145386927569874132831692475724513689'
    return render_template('game_index.html', sudoku=sudoku, solution=solution)