# Sudoku Resolver

This is a simple but fast Sudoku resolver written in JavaScript.

You can run it either locally using [NodeJS](https://nodejs.org/en/) or online in a [Google Spreadsheet](https://docs.google.com/spreadsheets) document.

This program will resolve most of "difficult" problems in less than 1 second. It applies a simple methodology to eliminate candidate digits in a cell considering the row, column or 3x3 square.

When conventional methods do not lead to a resolution, it will consider recursively "hypothesis" (eg. if a cell can contain digits 1, 2 or 3, let's consider it contains a "1" and try to resolve again).

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

Run the resolver from command line passing the grid name as first command line parameter:

```
node sudoku.js grids/lemonde-20-160.txt
```

Example using Le Monde grid N°20-160:

```
time node sudoku.js grids/lemonde-20-160.txt
435 changes applied.
3 8 1 9 2 6 5 4 7 
5 4 7 1 3 8 9 6 2 
9 2 6 7 4 5 8 1 3 
2 3 8 4 6 9 7 5 1 
4 1 9 8 5 7 2 3 6 
7 6 5 3 1 2 4 9 8 
8 7 3 5 9 1 6 2 4 
6 5 4 2 7 3 1 8 9 
1 9 2 6 8 4 3 7 5 
node main.js grids/lemonde-20-160.txt  0.06s user 0.01s system 108% cpu 0.068 total
```

### Google Spreadsheet

You can use the Sudoku solver from a Google Spreasheet document.
Here is how you can install and run it:
1. create a new Google Docs Spreadsheet,
2. enter you Sudoku problem to be solved in the Sheet, considering the range A1:I9, one number per cell, then select the range,
2. open the menu **Tools > Script editor**,
3. copy and paste the content of the file **sudoku.gs** into the script window (called Code.gs) and save it, define a project name (eg. "Suduko"),
4. run a first time your script using menu **Run > Run function > resolve**
5. you will have to authorize this script to access your Google Spreadsheet document,
6. you should see the solution in your Sheet
7. reload the Sheet (browser reload) and use the menu **Sudoku Resolver > resolve**

## Acknowledgements

Thanks to [Yan Georget](https://about.me/yangeorget) for publishing Sudoku grids everyday in the french newspaper Le Monde. I used Yan's grids to engineer this resolver.

## Author

If you encounter a Sudoku problem that this program is not able to resolve, please drop me a line to pmaugeri5 AT gmail DOT com. I will be very happy to have a look to it.