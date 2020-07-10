# Sudoku Resolver

This is a simple but fast Sudoku resolver written in JavaScript.

You can run it either locally using [NodeJS](https://nodejs.org/en/) or online in a [Google Spreadsheet](https://docs.google.com/spreadsheets) document.

Please note that this program will resolve most of "difficult" problems in less than 1 second. In some cases, a simple solution will not be found. In this case you will have to explore scenarios by considering hypothesis and running again the program.

## Usage

### NodeJS

You can run locally this resolver using [NodeJS](https://nodejs.org/en/).

The input grids should be a text file with 9 lines and 9 digits separated by a space. 
Example:
```
0 0 0 0 0 0 0 0 0 
0 0 0 0 0 0 8 7 4 
0 0 0 0 7 0 5 2 0 
0 0 9 0 0 0 0 0 0
0 0 0 0 0 4 0 1 0 
0 0 1 0 8 6 3 4 0 
0 3 0 0 9 0 0 0 7 
0 8 6 0 0 1 4 0 0 
0 5 0 0 2 0 0 6 3
```

Run it from command line passing the grid name as first command line parameter:

```
node main.js grids/grid.txt
```

### Google Spreadsheet

You can use the Sudoku solver from a Google Spreasheet document.
Here is how you can install and run it:
1. create a new Google Docs Spreadsheet,
2. enter you Sudoku problem to be solved in the Sheet, considering the range A1:I9, one number per cell, then select the range,
2. open the menu **Tools > Script editor**,
3. copy and paste the content of the file **main.gs.js** into the script window (called Code.gs) and save it, define a project name (eg. "Suduko"),
4. run a first time your script using menu **Run > Run function > resolve**
5. you will have to authorize this script to access your Google Spreadsheet document,
6. you should see the solution in your Sheet
7. reload the Sheet (browser reload) and use the menu **Sudoku Resolver > resolve**

## Acknowledgements

Thank you to [Yan Georget](https://about.me/yangeorget) for publishing Sudoku grids every day in the french newspaper Le Monde. I used Yan's grids to engineer this resolver.
