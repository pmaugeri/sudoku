/**
 * @fileoverview Simple and fast Sudoku resolver. Main source file
 *
 * Git repository: https://github.com/pmaugeri/sudoku
 * 
 * @author P.Maugeri
 * @version 1.1.3
 */


var COLUMNS = "ABCDEFGHI"

var CHANGE_COUNT_RANGE = "D12";

var BG_COLORS = ["#ff0000",
    "#ff9900",
    "#ffff00",
    "#00ff00",
    "#00ffff",
    "#4a86e8",
    "#0000ff",
    "#9900ff",
    "#ff00ff"]

// This global variable is set to True when a result has been found
var resultFound = false;
var resultGrid;

/**
 * Called when the gdoc spreadsheet document is open. It creates the application menu.
 */
function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Sudoku Resolver')
        .addItem('Resolve', 'resolve')
        .addToUi();
}

/**
 * A fast method to count the number of binary '1' in a number.
 * Source: Bit Twiddling Hacks - https://graphics.stanford.edu/~seander/bithacks.html
 * 
 * @param {Number} n the number to analyse
 * @return {Number} number of binary 1 found in the number
 */
function bitCount(n) {
    n = n - ((n >> 1) & 0x55555555)
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
    return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}


/**
 * Test if a cell contains a unique digit (1, 2, 3 ... 9) and return this digit if true.
 * 
 * @param {Number} cell a cell to analyse
 * @return {Number} 0 if the cell contains more than one digit, or the cell number if it has a unique value
 */
function hasUniqueValue(cell) {
    if (bitCount(cell) > 1) return 0;
    return cell;
}

function encodeDigit(digit) {
    return (2 ** (digit - 1));
}

function copyGrid(grid) {
    var result = [];
    for (var i = 0; i < 81; i++) {
        result[i] = grid[i];
    }
    return result;
}


/**
 * Inspect a row and determine whether it is complete (it contains each of the 
 * nine digits), valid (it is not complete but does not contain doublon either)
 * or invalid when it contains doublon.
 * 
 * @param {Array} gridValues a 1-dimension Sudoku grid with encoded values
 * @param {Number} r the row index (0..8)
 * @returns -1 if invalid, 0 if valid, 1 if complete
 */
function testRow(gridValues, r) {
    var result = 0;
    for (var c = 0; c < 9; c++) {
        cell = gridValues[c + (r * 9)];
        if (hasUniqueValue(cell) > 0) {
            if ((result ^ cell) < result)
                return -1;
            result = result ^ cell;
        }
    }
    if (result == 511)
        return 1;
    else
        return 0;
}


/**
 * Inspect a column and determine whether it is complete (it contains each of 
 * the nine digits), valid (it is not complete but does not contain doublon 
 * either) or invalid when it contains doublon.
 * 
 * @param {Array} gridValues a 1-dimension Sudoku grid with encoded values
 * @param {Number} c the column index (0..8)
 * @returns -1 if invalid, 0 if valid, 1 if complete
 */
function testColumn(gridValues, c) {
    var result = 0;
    for (var r = 0; r < 9; r++) {
        cell = gridValues[c + (r * 9)];
        if (hasUniqueValue(cell) > 0) {
            if ((result ^ cell) < result)
                return -1;
            result = result ^ cell;
        }
    }
    if (result == 511)
        return 1;
    else
        return 0;
}


/**
 * Inspect a 3x3 square and determine whether it is complete (it contains each 
 * of the nine digits), valid (it is not complete but does not contain doublon 
 * either) or invalid when it contains doublon.
 * 
 * @param {Array} gridValues a 1-dimension Sudoku grid with encoded values
 * @param {Number} c0 the column index (0..8) of the square within the 9x9 grid
 * @param {Number} r0 the row index (0..8) of the square within the 9x9 grid
 * @returns -1 if invalid, 0 if valid, 1 if complete
 */
function testSquare(gridValues, c0, r0) {
    var result = 0;
    for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 3; c++) {
            cell = gridValues[c0 + c + ((r0 + r) * 9)];
            if (hasUniqueValue(cell) > 0) {
                if ((result ^ cell) < result)
                    return -1;
                result = result ^ cell;
            }
        }
    }
    if (result == 511)
        return 1;
    else
        return 0;
}


/**
 * Inspect a grid and determine whether it is complete, valid or invalid.
 * 
 * @param {Array} gridValues a 1-dimension Sudoku grid with encoded values
 * @returns -1 if invalid, 0 if valid, 1 if complete
 */
function testGrid(grid) {
    var validGrid = true;
    var completeGrid = true;
    for (var r = 0; r < 9; r++) {
        t = testRow(grid, r);
        if (t == -1) {
            console.log("ERROR: row " + (r + 1) + " is invalid!");
            validGrid = false;
        }
        if (t == 0) {
            console.log("WARNING: row " + (r + 1) + " is incomplete!");
            completeGrid = false;
        }
    }
    for (var c = 0; c < 9; c++) {
        t = testColumn(grid, c);
        if (t == -1) {
            console.log("ERROR: column " + (c + 1) + " is invalid!");
            validGrid = false;
        }
        if (t == 0) {
            console.log("WARNING: column " + (c + 1) + " is incomplete!");
            completeGrid = false;
        }
    }
    for (var r = 0; r < 3; r++) {
        t = testSquare(grid, r * 3, 0);
        if (t == -1) {
            console.log("ERROR: square (" + ((r * 3) + 1) + ", 1)" + " is not valid!");
            validGrid = false;
        }
        if (t == 0) {
            console.log("WARNING: square (" + ((r * 3) + 1) + ", 1)" + " is incomplete!");
            completeGrid = false;
        }
        t = testSquare(grid, r * 3, 3);
        if (t == -1) {
            console.log("ERROR: square (" + ((r * 3) + 1) + ", 4)" + " is not valid!");
            validGrid = false;
        }
        if (t == 0) {
            console.log("WARNING: square (" + ((r * 3) + 1) + ", 4)" + " is incomplete!");
            completeGrid = false;
        }
        t = testSquare(grid, r * 3, 6);
        if (t == -1) {
            console.log("ERROR: square (" + ((r * 3) + 1) + ", 7)" + " is not valid!");
            validGrid = false;
        }
        if (t == 0) {
            console.log("WARNING: square (" + ((r * 3) + 1) + ", 7)" + " is incomplete!");
            completeGrid = false;
        }
    }

    if (validGrid && completeGrid)
        return 1;
    if (!validGrid)
        return -1;
    return 0;
}

/**
 * Encode a cell with a 9-bits binary representation: each Sudoku digit (1,2,...9) corresponds to a binary position
 * Examples:
 * 1 => 000000001 => 1
 * 2 => 000000010 => 2
 * 3 => 000000100 => 4
 * 9 => 100000000 => 256
 * 123 => 000000111 => 7
 * 123456789 => 111111111 => 511
 * 
 * @param {Number} cell a cell to encode
 * @return {Number} the encoded value
 */
function encodeCell(cell) {
    var result = 0;
    for (var i = 1; i < 10; i++) {
        if (cell.toString().indexOf(i) > -1) {
            result += encodeDigit(i);
        }
    }
    return result;
}


/**
 * Decode a cell to get a human readable representation.
 * The internal representation is based on a binary position for each of the possible Sudoku digit (1,2,..9)
 * 
 * Examples:
 * 1 => 000000001 => 1
 * 7 => 000000111 => 123
 * 511 => 111111111 = 123456789
 * 
 * @param {Number} cell the encoded cell value
 * @return {Number} the decoded value
 */
function decodeCell(cell) {
    var result = "";
    for (var i = 1; i < 10; i++) {
        if (cell & (2 ** (i - 1))) {
            result = result + i.toString();
        }
    }
    return result;
}


/**
 * Check if a cell contains a given Sudoku digit
 * 
 * @param {Number} cell the cell to analyse
 * @param {Number} digit the encoded digit to search
 * @return {Boolean} true if the digit is contained in the cell value
 */
function containsDigit(cell, digit) {
    return ((cell & digit) > 0);
}


/**
 * Remove a digit from a cell 
 * 
 * @param {Number} cell the cell to analyse
 * @param {Number} digit the digit to search
 * @return {Number} the result cell value (w/o the digit if found)
 */
function removeDigit(cell, digit) {
    return (cell ^ digit);
}


/**
 * Reduce a row with a given value. It scans a row of the 9x9 square and 
 * removes the searched value from the cells that contains this value if 
 * the cell contains more than one digit.
 * 
 * @param {Array} gridValues a 1-dimension Sudoku grid with encoded values
 * @param {Number} rowNumber the row number of square
 * @param {Number} valueSearched the value to use to reduce the row
 * @param {Number} startExclusionC the column number should be less than startExclusionC
 * @param {Number} endExclusionC the column number should be greater than endExclusionC
 * @return {Number} the number of changes applied to the square
 */
function reduceRow(gridValues, rowNumber, valueSearched, startExclusionC, endExclusionC) {
    var changeCount = 0;
    for (var c = 0; c < 9; c++) {
        if ((c < startExclusionC) || (c > endExclusionC)) {
            var currentValue = gridValues[c + (rowNumber * 9)];
            if (hasUniqueValue(currentValue) == 0 && containsDigit(currentValue, valueSearched)) {
                gridValues[c + (rowNumber * 9)] = removeDigit(currentValue, valueSearched);
                changeCount++;
            }
        }
    }
    return changeCount;
}


/**
 * Reduce a column with a given value. It scans a column of the 9x9 square 
 * and removes the searched value from the cells that contains this value if 
 * the cell contains more than one digit.
 * 
 * @param {Array} gridValues a 1-dimension Sudoku grid with encoded values
 * @param {Number} colNumber the column number of square
 * @param {Number} valueSearched the value to use to reduce the row
 * @param {Number} startExclusionR the row number should be less than startExclusionR
 * @param {Number} endExclusionR the row number should be greater than endExclusionR
 * @return {Number} the number of changes applied to the square
 */
function reduceColumn(gridValues, colNumber, valueSearched, startExclusionR, endExclusionR) {
    var changeCount = 0;
    for (var r = 0; r < 9; r++) {
        if ((r < startExclusionR) || (r > endExclusionR)) {
            var currentValue = gridValues[colNumber + (r * 9)];
            if (hasUniqueValue(currentValue) == 0 && containsDigit(currentValue, valueSearched)) {
                gridValues[colNumber + (r * 9)] = removeDigit(currentValue, valueSearched);
                changeCount++;
            }
        }
    }
    return changeCount;
}


/**
 * Reduce a column and a row with a given value. It calls reduceColumn() and
 * reduceRow().
 * 
 * @param {Array} gridValues a 1-dimension Sudoku grid with encoded values
 * @param {Number} colNumber the column number of square
 * @param {Number} rowNumber the row number of square
 * @param {Number} valueSearched the value to use to reduce the row/column
 * @return {Number} the number of changes applied to the square
 */
function reduceRowAndColumn(gridValues, rowNumber, colNumber, valueSearched) {
    var changeCount = 0;
    if (hasUniqueValue(valueSearched) != 0) {
        changeCount += reduceRow(gridValues, rowNumber, valueSearched, 10, 10);
        changeCount += reduceColumn(gridValues, colNumber, valueSearched, 10, 10);
    }
    return changeCount;
}


/**
 * Scan all square cells and if a unique digit is found it calls 
 * reduceRowAndColumn() for this digit.
 * 
 * @param {Array} gridValues a 1-dimension Sudoku grid with encoded values
 * @return {Number} the number of changes applied to the square
 */
function reduceAllRowsAndColumns(gridValues) {

    var changeCount = 0;
    var res1 = 0;
    var res2 = 0;

    do {

        var itrChange = 0;

        for (var i = 0; i < 81; i++) {
            if (hasUniqueValue(gridValues[i]) != 0) {
                var rowNumber = Math.floor(i / 9);
                var colNumber = i % 9;
                itrChange += reduceRowAndColumn(gridValues, rowNumber, colNumber, gridValues[i]);
            }
        }

        changeCount += itrChange;

    } while (itrChange != 0);

    return changeCount;
}


/**
 * Search in 3x3 "vectors" of digits. A vector is horizontal or vertical line of 2 or 3 cells
 * with more than one digit and that contains an alignment with the same digit. Once a vector
 * is found, reduceWithVectors() will scan the entire row/column to remove the digit found in 
 * the vector.
 * 
 * @param {Array} grid 
 * @param {Number} c0 the first column of the 3x3 square within the 9x9 square
 * @param {Number} r0 the first row of the 3x3 square within the 9x9 square
 * @return {Number} the number of changes applied to the square
 */
function reduceWithVectors(grid, c0, r0) {
    var digitCandidates = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var changeCount = 0;

    for (var d = 1; d < 10; d++) {
        for (var c = c0; c < (c0 + 3); c++) {
            for (var r = r0; r < (r0 + 3); r++) {
                var cell = grid[c + (r * 9)];
                if ((hasUniqueValue(cell) == 0) && containsDigit(cell, encodeDigit(d)))
                    digitCandidates[d] = digitCandidates[d] + 1;
            }
        }
    }
    var smallVector = new Array();
    var longVector = new Array();
    for (var i = 1; i < 10; i++) {
        if (digitCandidates[i] == 2)
            smallVector.push(i);
        if (digitCandidates[i] == 3)
            longVector.push(i);
    }


    // Search for 2-digit vectors
    for (var i = 0; i < smallVector.length; i++) {
        var searchedValue = encodeDigit(smallVector[i]);
        // Scan rows for the vector
        for (var r = r0; r < (r0 + 3); r++) {
            if ((containsDigit(grid[c0 + (r * 9)], searchedValue) && containsDigit(grid[c0 + 1 + (r * 9)], searchedValue))) {
                changeCount += reduceRow(grid, r, searchedValue, c0, (c0 + 2));
            }
            if ((containsDigit(grid[c0 + 1 + (r * 9)], searchedValue) && containsDigit(grid[c0 + 2 + (r * 9)], searchedValue))) {
                changeCount += reduceRow(grid, r, searchedValue, c0, (c0 + 2));
            }
            if ((containsDigit(grid[c0 + (r * 9)], searchedValue) && containsDigit(grid[c0 + 2 + (r * 9)], searchedValue))) {
                changeCount += reduceRow(grid, r, searchedValue, c0, (c0 + 2));
            }
        }
        // Scan columns for the vector
        for (var c = c0; c < (c0 + 3); c++) {
            if ((containsDigit(grid[c + (r0 * 9)], searchedValue) && containsDigit(grid[c + ((r0 + 1) * 9)], searchedValue))) {
                changeCount += reduceColumn(grid, c, searchedValue, r0, (r0 + 2));
            }
            if ((containsDigit(grid[c + (r0 * 9)], searchedValue) && containsDigit(grid[c + ((r0 + 2) * 9)], searchedValue))) {
                changeCount += reduceColumn(grid, c, searchedValue, r0, (r0 + 2));
            }
            if ((containsDigit(grid[c + ((r0 + 1) * 9)], searchedValue) && containsDigit(grid[c + ((r0 + 2) * 9)], searchedValue))) {
                changeCount += reduceColumn(grid, c, searchedValue, r0, (r0 + 2));
            }
        }
    }

    // Search for 3-digit vectors
    for (var i = 0; i < longVector.length; i++) {
        var searchedValue = encodeDigit(longVector[i]);
        // Scan rows for the vector
        for (var r = r0; r < (r0 + 3); r++) {
            if (containsDigit(grid[c0 + (r * 9)], searchedValue) &&
                containsDigit(grid[c0 + 1 + (r * 9)], searchedValue) &&
                containsDigit(grid[c0 + 2 + (r * 9)], searchedValue)) {
                changeCount += reduceRow(grid, r, searchedValue, c0, (c0 + 2));
            }
        }
        // Scan columns for the vector
        for (var c = c0; c < (c0 + 3); c++) {
            if (containsDigit(grid[c + (r0 * 9)], searchedValue) &&
                containsDigit(grid[c + ((r0 + 1) * 9)], searchedValue) &&
                containsDigit(grid[c + ((r0 + 2) * 9)], searchedValue)) {
                changeCount += reduceColumn(grid, c, searchedValue, r0, (r0 + 2));
            }
        }
    }

    return changeCount;
}

/**
 * Reduce a 3x3 square in 2 phases.
 * The first phase detects a cell with a single digit and removes this digits from the other 8 square cells.
 * The secode phase detects cells with multiple digits and check if one of the digit is found only in this cell. If yes if will reduce the cell with the digit found (only possibility for the digit).
 * 
 * @param {String} squareValues the whole 9x9 square values. The changes will appear in this array
 * @param {String} c0 the column index of the 3x3 square within the 9x9 square
 * @param {String} r0 the row index of the 3x3 square within the 9x9 square
 * @return {String} the number of changes applied
 */
function reduceSquare(squareValues, c0, r0) {

    var changeCount = 0;

    // Scan for cell with a single digit
    do {
        var oldChangeCount = changeCount;
        for (var c = c0; c < (c0 + 3); c++) {
            for (var r = r0; r < (r0 + 3); r++) {
                var valueSearched = hasUniqueValue(squareValues[c + (r * 9)]);
                if (valueSearched > 0) {
                    for (var c2 = c0; c2 < (c0 + 3); c2++) {
                        for (var r2 = r0; r2 < (r0 + 3); r2++) {
                            if ((hasUniqueValue(squareValues[c2 + (r2 * 9)]) == 0) && containsDigit(squareValues[c2 + (r2 * 9)], valueSearched)) {
                                squareValues[c2 + (r2 * 9)] = removeDigit(squareValues[c2 + (r2 * 9)], valueSearched);
                                changeCount++;
                            }
                        }
                    }
                }
            }
        }
    } while ((changeCount - oldChangeCount) > 0);

    do {
        var oldChangeCount = changeCount;
        for (var i = 0; i < 9; i++) {
            var valueSearched = 2 ** i;
            var lastCol = -1;
            var lastRow = -1;
            for (var c = c0; c < (c0 + 3); c++) {
                for (var r = r0; r < (r0 + 3); r++) {
                    if ((hasUniqueValue(squareValues[c + (r * 9)]) == 0) && containsDigit(squareValues[c + (r * 9)], valueSearched)) {
                        if (lastCol == -1) {
                            lastCol = c;
                            lastRow = r;
                        }
                        else {
                            lastCol = -2;
                            lastRow = -2;
                            break;
                        }
                    }
                    if (lastCol == -2) break;
                }
                if (lastCol == -2) break;
            }
            if (lastCol > -1) {
                squareValues[lastCol + (lastRow * 9)] = valueSearched;
                changeCount++;
            }
        }
    } while ((changeCount - oldChangeCount) > 0);

    return changeCount;
}


/**
 * Scan the nine 3x3 squares and call reduceSquare() for each one.
 * The first phase detects a cell with a single digit and removes this digits from the other 8 square cells.
 * The secode phase detects cells with multiple digits and check if one of the digit is found only in this cell. If yes if will reduce the cell with the digit found (only possibility for the digit).
 * 
 * @param {String} squareValues the whole 9x9 square values. The changes will appear in this array
 * @return {String} the number of changes applied
 */
function reduceAllSquares(squareValues) {
    var changeCount = 0;
    for (var row = 0; row < 3; row++) {
        changeCount += reduceSquare(squareValues, 0, (row * 3));
        changeCount += reduceSquare(squareValues, 3, (row * 3));
        changeCount += reduceSquare(squareValues, 6, (row * 3));
    }
    return changeCount;
}

/**
 * Count the occurences of each of the nine digits among cells with multiple candidates.
 * 
 * @param {Array} grid an array of 81 encoded values
 * @returns an array that gives a list of digits sorted from the least frequent to the more frequent
 */
function findHypothesis(grid) {
    var result = [];
    var digitFreq = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 81; i++) {
        cell = grid[i];
        if (hasUniqueValue(cell) == 0) {
            for (var n = 0; n < 9; n++) {
                if (containsDigit(cell, (2 ** n))) {
                    digitFreq[n]++;
                }
            }
        }
    }
    var digitCandidate = 1
    for (var d = 1; d < 10; d++) {
        if (digitFreq[d - 1] < digitFreq[digitCandidate - 1])
            digitCandidate = d;
    }

    // Build an array that contains digits sorted by frequencies (digit with lower frequency is first)
    while (result.length < digitFreq.length) {
        for (var i = 0; i < digitFreq.length; i++) {
            if (digitFreq[i] != -1) {
                var minFreq = digitFreq[i];
                var minIndex = i;
                for (var j = 0; j < digitFreq.length; j++) {
                    if ((digitFreq[j] != -1) && (digitFreq[j] < minFreq)) {
                        minIndex = j;
                        minFreq = digitFreq[j];
                    }
                }
                result.push(encodeDigit(minIndex + 1));
                digitFreq[minIndex] = -1;
            }
        }
    }

    return result;
}



/**
 * 
 * @param {Array} grid 
 * @param {Boolean} encoded if true cell padding will be 9 characters (decoded grid), otherwise it will be 3 (encoded grid)
 */
function printGrid(grid, encoded = true) {
    var padding = 9;
    if (encoded)
        padding = 9;
    if (encoded)
        console.log("-------------------------------------");
    else
        console.log("-------------------------------------------------------------------------------------------");
    for (var r = 0; r < 9; r++) {
        var line = "|";
        for (var c = 0; c < 9; c++) {
            line += grid[c + (r * 9)].toString().padStart(padding, ' ');
            if (((c + 1) % 3) == 0)
                line += "|";
            else
                line += " ";
        }
        console.log(line);
        if (((r + 1) % 3) == 0)
            if (encoded)
                console.log("-------------------------------------");
            else
                console.log("-------------------------------------------------------------------------------------------");
    }
}

/**
 * Encode a Sudoku grid. When the cell of the grid to encode is 0, the encoded 
 * value will be 0x1FF (511 decimal).
 * 
 * @param {Array} gridValues the 9x9 grid to encode
 * @returns an Array of 81 encoded values
 */
function encodeGrid(gridValues) {
    var result = [81];
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (gridValues[c + (r * 9)] != 0)
                result[c + (r * 9)] = encodeCell(gridValues[c + (r * 9)]);
            else
                result[c + (r * 9)] = 0x1FF;
        }
    }
    return result;
}

/**
 * Decode a 9x9 grid. The cell of the decoded values will contain either a 
 * digit or a string of the possible digits for this position.
 * 
 * @param {Array} gridValues an array of 81 encoded values 
 * @returns an Array of 81 decodes values
 */
function decodeGrid(gridValues) {
    var result = [81];
    for (var i = 0; i < 81; i++) {
        result[i] = decodeCell(gridValues[i]);
    }
    return result;
}

/**
 * 
 * @param {Array} grid 
 */
function reduceGrid(grid) {
    var change1 = 0, change2 = 0, change3 = 0;
    var changeCount = 0;

    do {
        change1 = reduceAllRowsAndColumns(grid);
        change2 = reduceAllSquares(grid);

        change3 = 0;
        for (var row = 0; row < 3; row++) {
            change3 += reduceWithVectors(grid, 0, (row * 3));
            change3 += reduceWithVectors(grid, 3, (row * 3));
            change3 += reduceWithVectors(grid, 6, (row * 3));
        }

        changeCount = changeCount + change1 + change2 + change3;

    } while ((change1 != 0) || (change2 != 0) || (change3 != 0));

    var gridResult = testGrid(grid);
    if (gridResult == -1) {
        console.log("Grid result is not valid.");
        return -1;
    }
    if (gridResult == 1) {
        console.log("Grid result is complete.");
        resultFound = true;
        resultGrid = copyGrid(grid);
        return changeCount;
    }

    // When grid is incomplete (and valid) find a candidate, create a new grid and re-run resolve()
    if ((!resultFound) && (gridResult == 0)) {
        console.log("Grid result is not complete.");
        var hypothesis = findHypothesis(grid);
        for (var h = 0; h < hypothesis.length; h++) {
            var hDigit = hypothesis[h];
            for (var i = 0; i < 81; i++) {
                if (!resultFound) {
                    cell = grid[i];
                    if (containsDigit(cell, hDigit) && (hasUniqueValue(cell) == 0)) {
                        console.log("Create a new grid with considering " + hDigit + " at position " + i);
                        hGrid = copyGrid(grid);
                        hGrid[i] = 4;
                        var changeCountRec = reduceGrid(hGrid);
                        if (resultFound)
                            changeCount += changeCountRec;
                    }
                }
            }
        }
    }

    return changeCount;
}

/**
 * Read a text file and parse a grid.
 * The lines starting by '#' are ignored (used for comments).
 * 
 * @param {String} filename 
 * @returns a grid array of 81 un-encoded values
 */
function readGridFromFile(filename) {
    var fs = require("fs");
    var text = fs.readFileSync(filename).toString('utf-8');
    var textByLine = text.split("\n")
    var grid = [];
    var r = 0;
    for (var l=0; l<textByLine.length; l++) {   
        if (!textByLine[l].startsWith('#')) {
            line = textByLine[l].split(" ");
            for (var c = 0; c < 9; c++) {
                grid[c + (r * 9)] = line[c];
            }
            r++;
        }
    }
    return grid;    
}


// Load Sudoku problem from square.txt file
var square_file = "grids/grid.txt"
var args = process.argv.slice(2);
if (args[0] != null) {
    square_file = args[0];
}
grid = readGridFromFile(square_file);
encodedGrid = encodeGrid(grid);
changeCount = reduceGrid(encodedGrid);
if (resultFound) {
    decodedGrid = decodeGrid(resultGrid);
    printGrid(decodedGrid, false);
}
console.log(changeCount + " changes applied.");