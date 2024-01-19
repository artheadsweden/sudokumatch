
let currentSolution = "";
let selectedDigit = null;


document.addEventListener('DOMContentLoaded', function() {
    startNewGame('easy'); // Start with an easy puzzle
    //generateGrid(puzzle);
    selectDefaultDigit();
    setupCellClickListeners(); // Set up click listeners for each cell
    highlightGivenDigits('1');
});

// Event listener for New Game button
document.getElementById('new-game').addEventListener('click', () => {
    const selectedDifficulty = document.getElementById('difficulty-select').value;
    startNewGame(selectedDifficulty);
});

document.getElementById('check-solution').addEventListener('click', function() {
    this.classList.toggle('active');
    if (this.classList.contains('active')) {
        checkDigitsAgainstSolution();
    } else {
        clearSolutionChecking();
    }
});

document.getElementById('solve-puzzle').addEventListener('click', function() {
    solvePuzzle();
});

document.getElementById('get-hint').addEventListener('click', function() {
    prepareForHint();
});

function prepareForHint() {
    // Add a class to the grid to indicate that we're in "hint mode"
    document.getElementById('sudoku-grid').classList.add('hint-mode');
    // Update the info area
    updateInfoArea("Click on a cell to reveal its correct digit.");
}

function updateInfoArea(message) {
    document.getElementById('info-area').textContent = message;
}

function reorderSolutionToMatchGrid(solution) {
    let reorderedSolution = '';

    // Iterate through each block in the grid
    for (let blockRow = 0; blockRow < 3; blockRow++) {
        for (let blockCol = 0; blockCol < 3; blockCol++) {
            // Iterate through each cell in the block
            for (let cellRow = 0; cellRow < 3; cellRow++) {
                for (let cellCol = 0; cellCol < 3; cellCol++) {
                    // Calculate the cell's index in the row-wise and block-wise solutions
                    let rowWiseIndex = (blockRow * 3 + cellRow) * 9 + (blockCol * 3 + cellCol);
                    // Append the digit at the row-wise index to the reordered solution
                    reorderedSolution += solution[rowWiseIndex];
                }
            }
        }
    }

    return reorderedSolution;
}


// Function to start a new game
function startNewGame(difficulty) {
    fetchPuzzle(difficulty, (puzzle, solution) => {
        currentSolution = reorderSolutionToMatchGrid(solution); // Store the solution

        // Clear existing grid
        const grid = document.getElementById('sudoku-grid');
        while (grid.firstChild) {
            grid.removeChild(grid.firstChild);
        }
        
        generateGrid(puzzle); // Generate the grid with the new puzzle
        selectDefaultDigit(); // Select the default digit
        setupCellClickListeners(); // Set up click listeners for each cell
        highlightGivenDigits('1'); // Highlight given digits for '1'
        initializeCounters(puzzle); // Initialize counters based on new puzzle
    });
}

function fetchPuzzle(difficulty, callback) {
    // Show loading modal
    document.getElementById('loading-modal').style.display = 'block';

    fetch(`/${difficulty}`)
        .then(response => response.json())
        .then(data => {
            if (data.puzzle && data.solution) {
                callback(data.puzzle, data.solution);
            } else {
                console.error("Invalid puzzle data received:", data);
            }
            // Hide loading modal
            document.getElementById('loading-modal').style.display = 'none';
        })
        .catch(error => {
            console.error("Error fetching puzzle:", error);
            // Hide loading modal
            document.getElementById('loading-modal').style.display = 'none';
        });
}


function selectDigit(digit) {
    clearSelectedDigit(); // Clear any existing selection

    const digitButton = document.querySelector(`.num-btn[data-num="${digit}"]`);
    if (digitButton) {
        digitButton.classList.add('selected');
        selectedDigit = digit;
    }
}

function selectDefaultDigit() {
    selectDigit('1'); // Default to selecting digit '1'
}

// Remove selected class from all digit buttons
function clearSelectedDigit() {
    digitButtons.forEach(button => {
        button.classList.remove('selected');
    });
}

// Event listeners for digit buttons
const digitButtons = document.querySelectorAll('.num-btn[data-num]');
digitButtons.forEach(button => {
    button.addEventListener('click', () => {
        clearSelectedDigit(); // Clear previously selected digit
        selectedDigit = button.getAttribute('data-num');
        button.classList.add('selected'); // Highlight the selected button
        highlightGivenDigits(selectedDigit);
        highlightEnteredDigits(selectedDigit);
        highlightPencilMarks(selectedDigit);
    });
});

function generateGrid(puzzle) {
    const grid = document.getElementById('sudoku-grid');
    
    for (let groupRow = 0; groupRow < 3; groupRow++) {
        for (let groupCol = 0; groupCol < 3; groupCol++) {
            const group = document.createElement('div');
            group.className = 'group';

            for (let cellRow = 0; cellRow < 3; cellRow++) {
                for (let cellCol = 0; cellCol < 3; cellCol++) {
                    const cellIndex = (groupRow * 3 + cellRow) * 9 + (groupCol * 3 + cellCol);
                    const digit = puzzle[cellIndex];
                    const cellDiv = document.createElement('div');
                    cellDiv.className = 'cell';

                    // Create a div for pencil marks inside each cell
                    const pencilMarksDiv = document.createElement('div');
                    pencilMarksDiv.className = 'pencil-marks';
                    cellDiv.appendChild(pencilMarksDiv);

                    if (digit !== '0') {
                        const numberDiv = document.createElement('div');
                        numberDiv.textContent = digit;
                        numberDiv.className = 'number';
                        cellDiv.appendChild(numberDiv);
                        cellDiv.classList.add('given');
                    }
                    group.appendChild(cellDiv);
                }
            }
            grid.appendChild(group);
        }
    }
}


function initializeCounters(puzzle) {
    const counts = Array(10).fill(9); // Array from 0 to 9, initialized to 9

    // Decrement count for each digit in the puzzle
    for (let i = 0; i < puzzle.length; i++) {
        const digit = parseInt(puzzle[i]);
        if (!isNaN(digit) && digit > 0) {
            counts[digit]--;
        }
    }

    // Update the counters on the UI
    for (let i = 1; i <= 9; i++) {
        updateCounter(i.toString(), counts[i]);
    }
}

function updateCounter(digit) {
    const totalDigits = 9; // Total number of each digit to be placed
    const placedDigits = getCurrentCountOfDigit(digit);
    const remaining = totalDigits - placedDigits;

    const counterElement = document.getElementById(`counter-${digit}`);
    if (counterElement) {
        counterElement.textContent = remaining;
        if (remaining < 1) {
            counterElement.parentElement.classList.add('no-more');
        } else {
            counterElement.parentElement.classList.remove('no-more');
        }
    }
}

function checkDigitsAgainstSolution() {
    const cells = document.querySelectorAll('.cell');
    let i = 0;
    cells.forEach((cell, index) => {
        const numberDiv = cell.querySelector('.number');
        
        if (numberDiv && !cell.classList.contains('given')) {
            const isCorrect = numberDiv.textContent === currentSolution[index];
            numberDiv.classList.toggle('correct', isCorrect);
            numberDiv.classList.toggle('incorrect', !isCorrect);
        }
        i++;
    });
}

function clearSolutionChecking() {
    const cells = document.querySelectorAll('.cell .number');
    cells.forEach(cell => {
        cell.classList.remove('correct', 'incorrect');
    });
}

function highlightGivenDigits(digit) {
    const cells = document.querySelectorAll('.cell.given');
    cells.forEach(cell => {
        if (cell.textContent === digit) {
            cell.classList.add('given-highlight');
        } else {
            cell.classList.remove('given-highlight');
        }
    });
}

function highlightEnteredDigits(digit) {
    const cells = document.querySelectorAll('.cell:not(.given)');
    cells.forEach(cell => {
        // Check if the cell has a permanent digit (not just pencil marks)
        const hasPermanentDigit = cell.querySelector('.number') && cell.querySelector('.number').textContent === digit;
        
        if (hasPermanentDigit) {
            cell.classList.add('entered-highlight');
        } else {
            cell.classList.remove('entered-highlight');
        }
    });
}


function highlightPencilMarks(digit) {
    const pencilMarks = document.querySelectorAll('.pencil-mark.mark-' + digit);
    pencilMarks.forEach(mark => {
        mark.classList.add('pencil-mark-highlight');
    });

    // Optionally, remove highlight from non-selected digits
    const nonSelectedPencilMarks = document.querySelectorAll(`.pencil-mark:not(.mark-${digit})`);
    nonSelectedPencilMarks.forEach(mark => {
        mark.classList.remove('pencil-mark-highlight');
    });
}

function setupCellClickListeners() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', (event) => {
            const isShiftClick = event.shiftKey;

            if (document.getElementById('sudoku-grid').classList.contains('hint-mode')) {
                // In hint mode, reveal a hint and then exit hint mode
                if (!cell.classList.contains('given') && !cell.querySelector('.number')) {
                    revealHint(cell);
                    document.getElementById('sudoku-grid').classList.remove('hint-mode');
                }
            } else if (!cell.classList.contains('given')) {
                if (isShiftClick) {
                    // Shift is held down, place or remove a pencil mark
                    togglePencilMark(cell, selectedDigit);
                    
                } else if (selectedDigit) {
                    // No Shift key, place the selected digit
                    placeDigitInCell(cell, selectedDigit);
                }
            }
            highlightEnteredDigits(selectedDigit);
            highlightGivenDigits(selectedDigit);
            highlightPencilMarks(selectedDigit);
            if (cell.classList.contains('active')) {
                checkDigitsAgainstSolution();
            } else {
                clearSolutionChecking();
            }
        });
    });
}


function revealHint(cell) {
    const index = Array.from(document.querySelectorAll('.cell')).indexOf(cell);
    const correctDigit = currentSolution[index];
    // Place the correct digit in the cell
    placeDigitInCell(cell, correctDigit);

    // Select the revealed digit button
    selectDigit(correctDigit);

    highlightEnteredDigits(correctDigit);
    highlightPencilMarks(correctDigit);
    // Remove hint mode
    document.getElementById('sudoku-grid').classList.remove('hint-mode');
    // Reset info area message
    updateInfoArea("Welcome to Sudoku! Hold Shift to place pencil marks.");
}

function togglePencilMark(cell, digit) {
    if(digit === '0') {
        return;
    }
    const pencilMarksDiv = cell.querySelector('.pencil-marks');
    const numberDiv = cell.querySelector('.number');
    let mark = Array.from(pencilMarksDiv.children).find(el => el.textContent === digit);

    if (mark) {
        pencilMarksDiv.removeChild(mark); // Remove existing mark
    } else {
        mark = document.createElement('div');
        mark.className = `pencil-mark mark-${digit}`;
        mark.textContent = digit;
        pencilMarksDiv.appendChild(mark); // Add new mark
    }

    // Show pencil marks only if there's no permanent digit
    if (!numberDiv) {
        pencilMarksDiv.style.display = '';
    }
}



function getCurrentCountOfDigit(digit) {
    const cells = document.querySelectorAll('.cell');
    let count = 0;
    cells.forEach(cell => {
        // Check if the cell has a permanent digit (not just pencil marks)
        const numberDiv = cell.querySelector('.number');
        if (numberDiv && numberDiv.textContent === digit) {
            count++;
        }
    });
    return count;
}


function placeDigitInCell(cell, digit) {
    let numberDiv = cell.querySelector('.number');
    const prevDigit = numberDiv ? numberDiv.textContent : '';
    const pencilMarksDiv = cell.querySelector('.pencil-marks');
    if (digit === '0') { // Eraser selected
        if (numberDiv) {
            cell.removeChild(numberDiv); // Remove the number div
        }
        // Show pencil marks again if they exist
        if (pencilMarksDiv) {
            pencilMarksDiv.style.display = '';
        }
    } else {
        if (!numberDiv) {
            numberDiv = document.createElement('div');
            numberDiv.className = 'number';
            cell.appendChild(numberDiv);
        }
        numberDiv.textContent = digit; // Set the digit
        // Hide pencil marks when a digit is placed
        if (pencilMarksDiv) {
            pencilMarksDiv.style.display = 'none';
        }
    }

    // Update counters and highlights
    if (prevDigit !== '') {
        updateCounter(prevDigit);
        highlightEnteredDigits(prevDigit);
    }
    if (digit !== '0') {
        updateCounter(digit);
        highlightEnteredDigits(digit);
    }
    checkGridFilled();
}

function showModal(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal').style.display = 'block';
}

// Close Modal
let closeButton = document.getElementsByClassName("close-button")[0];
closeButton.onclick = function() {
    document.getElementById('modal').style.display = "none";
}

// Check if the grid is filled and show modal
function checkGridFilled() {
    const cells = document.querySelectorAll('.cell');
    const isFilledAndCorrect = Array.from(cells).every((cell, index) => {
        const numberDiv = cell.querySelector('.number');
        return numberDiv && (cell.classList.contains('given') || numberDiv.textContent === currentSolution[index]);
    });
    
    if (isFilledAndCorrect) {
        const wrongDigits = countWrongDigits();
        if (wrongDigits === 0) {
            showModal('Congratulations!', 'You have successfully solved the puzzle!');
        } else {
            showModal('Almost There!', `You have ${wrongDigits} wrong digits. Keep trying!`);
        }
        document.getElementById('check-solution').classList.add('active');
        checkDigitsAgainstSolution();
    }
}

// Modify countWrongDigits to count only incorrect digits in non-given cells
function countWrongDigits() {
    const cells = document.querySelectorAll('.cell');
    let wrongCount = 0;
    cells.forEach((cell, index) => {
        const numberDiv = cell.querySelector('.number');
        if (numberDiv && !cell.classList.contains('given') && numberDiv.textContent !== currentSolution[index]) {
            wrongCount++;
        }
    });
    return wrongCount;
}


function solvePuzzle() {
    const cells = document.querySelectorAll('.cell');
    let index = 0;
    let isCorrectlySolved = true;
    console.log(currentSolution);
    cells.forEach(cell => {
        if (!cell.classList.contains('given')) {
            // Clear existing non-given numbers or pencil marks
            cell.innerHTML = '';

            const numberDiv = document.createElement('div');
            numberDiv.className = 'number';
            numberDiv.textContent = currentSolution[index];
            cell.appendChild(numberDiv);

            if (numberDiv.textContent !== currentSolution[index]) {
                isCorrectlySolved = false;
            }
        }
        index++;
    });

    // Set all digit counters to 0
    for (let i = 1; i <= 9; i++) {
        updateCounter(i.toString(), 0);
    }

    // Check solution and show modal
    checkDigitsAgainstSolution();
    showModal(isCorrectlySolved ? 'Congratulations!' : 'Almost There!',
              isCorrectlySolved ? 'You have successfully solved the puzzle!' : 'The puzzle has been solved for you.');
}
