/**
 * @fileoverview Simple and fast Sudoku resolver. 3x3 square related functions.
 *
 * Git repository: https://github.com/pmaugeri/sudoku
 * 
 * @author P.Maugeri
 * @version 1.0.0
 */



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
