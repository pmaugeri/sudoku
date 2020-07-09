/**
 * @fileoverview Simple and fast Sudoku resolver. Main source file
 *
 * Git repository: https://github.com/pmaugeri/sudoku
 * 
 * @author P.Maugeri
 * @version 1.1.2
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

var values = [
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF,
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF,
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF,
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF,
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF,
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF,
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF,
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF,
    0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF, 0x1FF
];


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
    return (2 ** (digit-1));
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
 * @param {Number} digit the digit to search
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
 * @param {Number} rowNumber the row number of square
 * @param {Number} valueSearched the value to use to reduce the row
 * @param {Number} startExclusionC the column number should be less than startExclusionC
 * @param {Number} endExclusionC the column number should be greater than endExclusionC
 * @return {Number} the number of changes applied to the square
 */
function reduceRow(rowNumber, valueSearched, startExclusionC, endExclusionC) {
    var changeCount = 0;
    for (var c = 0; c < 9; c++) {
        if ((c < startExclusionC) || (c > endExclusionC)) {
            var currentValue = values[c + (rowNumber * 9)];
            if (hasUniqueValue(currentValue) == 0 && containsDigit(currentValue, valueSearched)) {
                values[c + (rowNumber * 9)] = removeDigit(currentValue, valueSearched);
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
 * @param {Number} colNumber the column number of square
 * @param {Number} valueSearched the value to use to reduce the row
 * @param {Number} startExclusionR the row number should be less than startExclusionR
 * @param {Number} endExclusionR the row number should be greater than endExclusionR
 * @return {Number} the number of changes applied to the square
 */
function reduceColumn(colNumber, valueSearched, startExclusionR, endExclusionR) {
    var changeCount = 0;
    for (var r = 0; r < 9; r++) {
        if ((r < startExclusionR) || (r > endExclusionR)) {
            var currentValue = values[colNumber + (r * 9)];
            if (hasUniqueValue(currentValue) == 0 && containsDigit(currentValue, valueSearched)) {
                values[colNumber + (r * 9)] = removeDigit(currentValue, valueSearched);
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
 * @param {Number} colNumber the column number of square
 * @param {Number} rowNumber the row number of square
 * @param {Number} valueSearched the value to use to reduce the row/column
 * @return {Number} the number of changes applied to the square
 */
function reduceRowAndColumn(rowNumber, colNumber, valueSearched) {
    var changeCount = 0;
    if (hasUniqueValue(valueSearched) != 0) {
        changeCount += reduceRow(rowNumber, valueSearched, 10, 10);
        changeCount += reduceColumn(colNumber, valueSearched, 10, 10);
    }
    return changeCount;
}


/**
 * Scan all square cells and if a unique digit is found it calls 
 * reduceRowAndColumn() for this digit.
 * 
 * @return {Number} the number of changes applied to the square
 */
function reduceAllRowsAndColumns() {

    var changeCount = 0;
    var res1 = 0;
    var res2 = 0;

    do {

        var itrChange = 0;

        for (var i = 0; i < 81; i++) {
            if (hasUniqueValue(values[i]) != 0) {
                var rowNumber = Math.floor(i / 9);
                var colNumber = i % 9;
                itrChange += reduceRowAndColumn(rowNumber, colNumber, values[i]);
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
 * @param {Array} squareValues a 3x3 square of values
 * @param {Number} c0 the first column of the 3x3 square within the 9x9 square
 * @param {Number} r0 the first row of the 3x3 square within the 9x9 square
 * @return {Number} the number of changes applied to the square
 */
function reduceWithVectors(squareValues, c0, r0) {
    var vectors = [];
    var digitCandidates = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var changeCount = 0;

    for (var d = 1; d < 10; d++) {
        for (var c = c0; c < (c0 + 3); c++) {
            for (var r = r0; r < (r0 + 3); r++) {
                var cell = squareValues[c + (r * 9)];
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
            if ((containsDigit(squareValues[c0 + (r * 9)], searchedValue) && containsDigit(squareValues[c0 + 1 + (r * 9)], searchedValue))) {
                Logger.info('Found a 2-digit vector with digit ' + smallVector[i] + ' on row ' + r);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0).toString()+(r+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0+1).toString()+(r+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                changeCount += reduceRow(r, searchedValue, c0, (c0 + 2));
            }
            if ((containsDigit(squareValues[c0 + 1 + (r * 9)], searchedValue) && containsDigit(squareValues[c0 + 2 + (r * 9)], searchedValue))) {
                Logger.info('Found a 2-digit vector with digit ' + smallVector[i] + ' on row ' + r);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0+1).toString()+(r+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0+2).toString()+(r+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                changeCount += reduceRow(r, searchedValue, c0, (c0 + 2));
            }
            if ((containsDigit(squareValues[c0 + (r * 9)], searchedValue) && containsDigit(squareValues[c0 + 2 + (r * 9)], searchedValue))) {
                Logger.info('Found a 2-digit vector with digit ' + smallVector[i] + ' on row ' + r);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0).toString()+(r+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0+2).toString()+(r+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                changeCount += reduceRow(r, searchedValue, c0, (c0 + 2));
            }
        }
        // Scan columns for the vector
        for (var c = c0; c < (c0 + 3); c++) {
            if ((containsDigit(squareValues[c + (r0 * 9)], searchedValue) && containsDigit(squareValues[c + ((r0 + 1) * 9)], searchedValue))) {
                Logger.info('Found a 2-digit vector with digit ' + smallVector[i] + ' on column ' + c);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+1+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                changeCount += reduceColumn(c, searchedValue, r0, (r0 + 2));
            }
            if ((containsDigit(squareValues[c + (r0 * 9)], searchedValue) && containsDigit(squareValues[c + ((r0 + 2) * 9)], searchedValue))) {
                Logger.info('Found a 2-digit vector with digit ' + smallVector[i] + ' on column ' + c);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+2+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                changeCount += reduceColumn(c, searchedValue, r0, (r0 + 2));
            }
            if ((containsDigit(squareValues[c + ((r0 + 1) * 9)], searchedValue) && containsDigit(squareValues[c + ((r0 + 2) * 9)], searchedValue))) {
                Logger.info('Found a 2-digit vector with digit ' + smallVector[i] + ' on column ' + c);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+1+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                //          SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+2+1)).setBackground(BG_COLORS[smallVector[i]-1]);
                changeCount += reduceColumn(c, searchedValue, r0, (r0 + 2));
            }
        }
    }

    // Search for 3-digit vectors
    for (var i = 0; i < longVector.length; i++) {
        var searchedValue = encodeDigit(longVector[i]);
        // Scan rows for the vector
        for (var r = r0; r < (r0 + 3); r++) {
            if (containsDigit(squareValues[c0 + (r * 9)], searchedValue) &&
                containsDigit(squareValues[c0 + 1 + (r * 9)], searchedValue) &&
                containsDigit(squareValues[c0 + 2 + (r * 9)], searchedValue)) {
                Logger.info('Found a 3-digit vector with digit ' + longVector[i] + ' on row ' + r);
                //            SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0).toString()+(r+1)).setBackground(BG_COLORS[longVector[i]-1]);
                //            SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0+1).toString()+(r+1)).setBackground(BG_COLORS[longVector[i]-1]);
                //            SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c0+2).toString()+(r+1)).setBackground(BG_COLORS[longVector[i]-1]);
                changeCount += reduceRow(r, searchedValue, c0, (c0 + 2));
            }
        }
        // Scan columns for the vector
        for (var c = c0; c < (c0 + 3); c++) {
            if (containsDigit(squareValues[c + (r0 * 9)], searchedValue) &&
                containsDigit(squareValues[c + ((r0 + 1) * 9)], searchedValue) &&
                containsDigit(squareValues[c + ((r0 + 2) * 9)], searchedValue)) {
                Logger.info('Found a 3-digit vector with digit ' + longVector[i] + ' on column ' + c);
                //            SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+1)).setBackground(BG_COLORS[longVector[i]-1]);
                //            SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+1+1)).setBackground(BG_COLORS[longVector[i]-1]);
                //            SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(COLUMNS.charAt(c).toString()+(r0+2+1)).setBackground(BG_COLORS[longVector[i]-1]);
                changeCount += reduceColumn(c, searchedValue, r0, (r0 + 2));
            }
        }
    }

    return changeCount;
}


/**
 * The main function that will perform reductions of the rows, columns and 
 * squares in an attempt to resolve the Sudoku square.
 * 
 * It will keep calling in sequence reduceAllRowsAndColumns() and 
 * reduceAllSquares() while changes have been applied by one of these 
 * functions.
 */
function resolve() {
    var change1 = 0, change2 = 0, change3 = 0;
    var changeCount = 0;

    var range = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange();
    sheetValues = range.getValues();

    // Encode values
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            if (sheetValues[r][c] != 0) {
                values[c + (r * 9)] = encodeCell(sheetValues[r][c]);
            }
        }
    }

    do {
        change1 = reduceAllRowsAndColumns();
        change2 = reduceAllSquares(values);

        change3 = 0;
        for (var row = 0; row < 3; row++) {
            change3 += reduceWithVectors(values, 0, (row * 3));
            change3 += reduceWithVectors(values, 3, (row * 3));
            change3 += reduceWithVectors(values, 6, (row * 3));
        }    

        changeCount = changeCount + change1 + change2 + change3;

    } while ((change1 != 0) || (change2 != 0) || (change3 != 0));

    // Decode values
    for (var r = 0; r < 9; r++) {
        for (var c = 0; c < 9; c++) {
            sheetValues[r][c] = decodeCell(values[c + (r * 9)]);
        }
    }

    // Update spreadsheet with the result values  
    range.setValues(sheetValues);

    var r = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(CHANGE_COUNT_RANGE);
    r.setValue(changeCount);

}
