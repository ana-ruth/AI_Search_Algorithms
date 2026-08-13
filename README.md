# AI Search Lab
This project explores the implementation of five classical search algorithms. Three single-agent search algorithms for 8-puzzle, and two adversarial search algorithms for Tic-Tac-Toe.

### Student
Ana Herrera Cantarero


## How to Run
- Double-click the `index.html` file.

or 

- Open project in VSCode with LiveServer extension.

To switch between modules, click the tabs `8-Puzzle Solver` and `Tic-Tac-Toe` on the left side bar.

## Architecture
- Single-page app with two modules: Module A 8-Puzzle and Module B Tic-Tac-Toe.

- Main entry point: `index.html`

- The two modules are under `src/moduleA` and `src/moduleB`.

- Algorithm implementation files are `puzzle-logic.js` and `tictactoe-logic.js`.

- UI files `puzzle-ui.js`, `tictactoe-ui.js` handle DOM and call logic functions.

- Styling files `stylesA.css`, `stylesB.css`, and `styles.css`.

- Shared dashboard is `src/shared/performance_dashboard.js` to display metrics for both modules.

## Languages
- HTML
- CSS
- JavaScript

## Algorithms implemented
- BFS
- Dijkstra's
- A*
- Minimax
- Alpha-Beta with Manhattan Distance

## Heuristic Justification
Manhattan distance is admissible for the 8-puzzle because it counts the minimum number of moves each tile needs to reach the goal position for the solution. The estimated cost is less than the actual cost because each move consists of moving one tile at a time, so the distance is reduced at most by 1. The heuristic does not overestimate the actual distance, making it admissible and consistent for A* search.

## Comparative Analysis Report
Open the `Comparative_Analysis.pdf` file for report and screenshots of gameplay.