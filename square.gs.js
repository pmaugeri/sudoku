function reduceSquare(squareValues, c0, r0) {

  var changeCount = 0;

  // Scan for cell with a single digit
  do {
    var oldChangeCount = changeCount;
    for (var c=c0; c<(c0+3); c++) {
      for (var r=r0; r<(r0+3); r++) {
        var valueSearched = hasUniqueValue(squareValues[c][r]);
        if (valueSearched > 0) {                
          for (var c2=c0; c2<(c0+3); c2++) {
            for (var r2=r0; r2<(r0+3); r2++) {
              if ( (hasUniqueValue(squareValues[c2][r2]) == 0) && containsDigit(squareValues[c2][r2], valueSearched)) {
                squareValues[c2][r2] = removeDigit(squareValues[c2][r2], valueSearched);
                changeCount++;              
              }
            }
          }
        }
      }
    }
  } while ( (changeCount - oldChangeCount) > 0);
    
  do {
    var oldChangeCount = changeCount;
    for (var i=0; i<9; i++) {
      var valueSearched = 2 ** i;
      var lastCol = -1;
      var lastRow = -1;
      for (var c=c0; c<(c0+3); c++) {
        for (var r=r0; r<(r0+3); r++) {      
          if ( (hasUniqueValue(squareValues[c][r]) == 0) && containsDigit(squareValues[c][r], valueSearched) ) {
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
        squareValues[lastCol][lastRow] = valueSearched;
        changeCount++;              
      }
    }
  } while ( (changeCount - oldChangeCount) > 0);
  
 return changeCount;
}


function reduceAllSquares() {
  var changeCount = 0;
  for (var row=0; row<3; row++) {
    changeCount += reduceSquare(values, 0, (row*3));
    changeCount += reduceSquare(values, 3, (row*3));
    changeCount += reduceSquare(values, 6, (row*3));
  }
  return changeCount;
}

