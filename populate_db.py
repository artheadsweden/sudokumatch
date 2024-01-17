import csv
from mongeasy import create_document_class


# Define the difficulty ranges
difficulty_ranges = {
    'Simple': (0, 49),
    'Easy': (50, 99),
    'Medium': (100, 299),
    'Hard': (300, 499),
    'Very Hard': (500, 999),
    'Extreme': (1000, float('inf'))  # No upper limit
}

Sudoku = create_document_class('Sudoku', 'sudokus')

with open('sudoku.csv', 'r') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        print(f'Puzzle {i+1} of 3190434. {i+1//3190434*100}%')
        # puzzle,solution,rank,given
        sudoku = row['puzzle']
        solution = row['solution']
        rank = row['rank']
        given = row['given']
        # Find where rank is in the difficulty_ranges
        for level, _range in difficulty_ranges.items():
            if _range[0] <= int(rank) <= _range[1]:
                break
        
        sudoku = Sudoku({
            'sudoku': sudoku,
            'solution': solution,
            'rank': rank,
            'given': given,
            'level': level
        })
        sudoku.save()