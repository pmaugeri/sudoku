/**
 * Add custom menus to this Spreadsheet User Interface.
 */
function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Sudoku Resolver')
    .addSeparator()
    .addItem('Resolve', 'resolve')
    .addSeparator()
    .addToUi();
}

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


// Source: Bit Twiddling Hacks - https://graphics.stanford.edu/~seander/bithacks.html
function bitCount (n) {
n = n - ((n >> 1) & 0x55555555)
n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
}

// Test if a cell contains a unique digit (1, 2, 3 ... 9) and return this digit if true.
// Returns 0 if the cell contains more than one digit
function hasUniqueValue(cell) {
if (bitCount(cell) > 1) return 0;
return cell;
}


function encodeCell(cell) {
var result = 0;
for (var i=1; i<10; i++) {
    if (cell.toString().indexOf(i) > -1) {
    result += (2 ** (i-1));
    }
}
return result;
}


function decodeCell(cell) {
var result = "";
for (var i=1; i<10; i++) {
    if (cell & (2 ** (i-1))) {
    result = result + i.toString();
    }
}
return result;
}


function containsDigit(cell, digit) {
return ((cell & digit) > 0);
}


function removeDigit(cell, digit) {
return (cell ^ digit);
}


function reduceRow(rowNumber, valueSearched) {
    var changeCount = 0;

    for (var c=0; c<9; c++) {
        var currentValue = values[c+(rowNumber*9)];
        if (hasUniqueValue(currentValue) == 0 && containsDigit(currentValue, valueSearched)) {
        values[c+(rowNumber*9)] = removeDigit(currentValue, valueSearched);
        changeCount++;
        }

    }

    return changeCount;
}


function reduceColumn(colNumber, valueSearched) {
    var changeCount = 0;
    for (var r=0; r<9; r++) {
        var currentValue = values[colNumber + (r*9)];
        if (hasUniqueValue(currentValue) == 0 && containsDigit(currentValue, valueSearched)) {
        values[colNumber+(r*9)] = removeDigit(currentValue, valueSearched);
        changeCount++;
        }
    }
    return changeCount;
}


function reduceRowAndColumn(rowNumber, colNumber, valueSearched) {
    var changeCount = 0;
    if (hasUniqueValue(valueSearched) != 0) {
        changeCount += reduceRow(rowNumber, valueSearched);
        changeCount += reduceColumn(colNumber, valueSearched);
    }
    return changeCount;
}


function reduceAllRowsAndColumns() {

    var changeCount = 0;
    var res1 = 0;
    var res2 = 0;

    do {

        var itrChange = 0;
        
        for (var c=0; c<9; c++) {
            for (var r=0; r<9; r++) {
                if (hasUniqueValue(values[c+(r*9)]) !=0) {
                    itrChange += reduceRowAndColumn(r, c, values[c+(r*9)]);
                }
            }
        }

        changeCount += itrChange;

    } while (itrChange != 0);

    return changeCount;
}









function resolve() {
    var change1 = 0;
    var changeCount = 0;

    var range = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange();
    sheetValues = range.getValues();

    // Encode values
    for (var c=0; c<9; c++) {
        for (var r=0; r<9; r++) {
            if (sheetValues[c][r] != 0) {
                values[c+(r*9)] = encodeCell(sheetValues[c][r]);
            }
        }
    }  

    do {
        change1 = reduceAllRowsAndColumns();
        change2 = reduceAllSquares();
        changeCount += change1;
        changeCount += change2;
    } while ((change1 != 0)||(change2 != 0));

    // Decode values
    for (var c=0; c<9; c++) {
      for (var r=0; r<9; r++) {
        sheetValues[c][r] = decodeCell(values[c+(r*9)]);
      }
    }

    // Update spreadsheet with the result values  
    range.setValues(sheetValues);  

    var r = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange("A12");
    r.setValue(changeCount);

}

