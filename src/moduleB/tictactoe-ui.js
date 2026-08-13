const { getBestMove, checkWinner } = window.TTTLogic || {}; //get functions from tictactoe-logic.js

let board = Array.from({ length: 3 }, () => Array(3).fill(null)); // 3x3 board 
let currentPlayer = "X"; // to track current turn
let running = false; // to check if game is active

let paused = false; // to track pause
let aiTimeout = null; // to save ai Timeout 

let gameMode = "human-ai"; //game modes: human-ai, ai-ai, human-human
let boardDiv;

let config = {
    startingPlayer: "X", //first move

    //selected player for X and 0 (human or ai)
    controller: {
        X: "human",
        O: "ai"
    },

    //selected algorithm for X and 0 if ai
    algo: {
        X: "minimax",
        O: "alphabeta"
    }
};

// to handle human click on board
function handleClick(row, col) {
    // return if game is idle or square is already filled
    if (!running || paused || board[row][col] !== null) return;

    // if it is ai's turn, ignore click
    if (config.controller[currentPlayer] !== "human") return;

    // allow move if human's turn
    makeMove(row, col);
}

// To mark move
function makeMove(row, col) {
    // make move
    board[row][col] = currentPlayer;

    //update board ui
    renderBoard();

    //check if game is over and winner
    const result = checkWinner(board);

    //display result (X wins, O wins, or draw)
    if (result) {
        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.innerText = result === 'draw' ? 'Draw' : `${result} wins`;
        running = false;

        //reset pause button
        paused = false;
        const pauseBtn = document.getElementById("pauseBtn");
        if (pauseBtn) pauseBtn.innerText = "▶";

        updateStartButton();

        return;
    }

    //switch player
    currentPlayer = currentPlayer === "X" ? "O" : "X";

    // update status for next player
    updateStatus();

    // continue game
    nextTurn();
}

function nextTurn() {

    //check if game is active
    if (!running || paused) return; 

    //get current player
    const controller = config.controller[currentPlayer];

    // if ai, make ai move and delay 450ms
    if (controller === "ai") {
        aiTimeout = setTimeout(() => {
            if (!paused && running) {   //double check game is active
                aiMove();
            }
        }, 450);
    }

}


function aiMove() {
    let result;

    //get algorithm for current player
    const algo = config.algo[currentPlayer];

    //minimax
    if (algo === "minimax") {
        result = getBestMove(board, currentPlayer, false);
    } 

    // alpha beta
    else {
        result = getBestMove(board, currentPlayer, true);
    }

    // algorithm performance
    const move = result.move; 
    const nodes = result.nodes;
    const time = result.time;

    // calculate pruning rate 
    let pruningPercent = "0.00%";
    if (algo != "minimax") {
        // 549,946 is the baseline number of nodes plain Minimax checks on an empty board.
        // Formula: 100 * (1 - (AlphaBetaNodes / PlainMinimaxNodes))
        const baselineMinimaxNodes = 549946; 
        const efficiency = (1 - (nodes / baselineMinimaxNodes)) * 100;
        pruningPercent = `${Math.max(0, efficiency).toFixed(2)}%`;
    }

    // update performance dashboard for current player
    if (window.Dashboard) {
        const playerKey = currentPlayer === "X" ? "playerX" : "playerO";
        window.Dashboard.update({
        [playerKey]: {
            algo: algo === "minimax" ? "Minimax" : "Alpha-Beta",
            decisionTime: time.toFixed(2),
            nodesExplored: nodes,
            pruningEfficiency: pruningPercent
        }
        });
    }

    // execute move
    makeMove(move.r, move.c);
}

function renderBoard() {
    //clear board ui
    boardDiv.innerHTML = "";

    // rebuild board as 3 rows
    for (let r = 0; r < 3; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('row');
        for (let c = 0; c < 3; c++) {
            const div = document.createElement('div');
            div.classList.add('cell');
            div.innerText = board[r][c] || ''; //display value
            //click handler for cells
            ((rr, cc) => div.addEventListener('click', () => handleClick(rr, cc)))(r, c);
            rowDiv.appendChild(div);
        }
        boardDiv.appendChild(rowDiv);
    }
}

function startGame() {

    board = Array.from({ length: 3 }, () => Array(3).fill(null)); //reset board
    running = true; //game is active

    // game is not paused
    paused = false;
    document.getElementById("pauseBtn").innerText = "⏸";

    //clear timeout for ai
    if (aiTimeout) {
        clearTimeout(aiTimeout);
        aiTimeout = null;
    }   

    //get game mode, starting player, and ai algorithms from user
    gameMode = document.getElementById("mode").value;
    config.startingPlayer = document.getElementById("firstPlayer").value;

    config.algo.X = document.getElementById("algoX").value;
    config.algo.O = document.getElementById("algoO").value;

    currentPlayer = config.startingPlayer; //starting player is currentplayer at the start of game

    // Check selected game mode to assign X and 0
    if (gameMode === "human-ai") {
        config.controller.X = "human";
        config.controller.O = "ai";
    }

    if (gameMode === "ai-ai") {
        config.controller.X = "ai";
        config.controller.O = "ai";
    }

    if (gameMode === "human-human") {
        config.controller.X = "human";
        config.controller.O = "human";
    }

     // set status to indicate whose turn it is
     updateStatus();

    // start game loop
    renderBoard();
    nextTurn();


    updateStartButton();
}


function togglePause() {
    // only allow pause if game is active
    if (!running) return;

    paused = !paused;

    //update play/pause button
    const btn = document.getElementById("pauseBtn");
    btn.innerText = paused ? "▶" : "⏸";

    // if resuming, continue the loop
    if (!paused) {
        nextTurn();
    }
}

function updateStartButton() {
    const btn = document.getElementById("startBtn");

    //restart button
    if (running) {
        btn.innerText = "Restart Game";
    } 
    // start button
    else {
        btn.innerText = "Start Game";
    }
}

function updateStatus() {
    //get status
  const statusEl = document.getElementById('status');
  if (!statusEl) return;

  //check if game ended
  const result = checkWinner(board);
  if (result) {
    statusEl.innerText = result === 'draw' ? 'Draw' : `${result} wins`;
    return;
  }

  //if game is still active, display next turn
  if (running) {
    statusEl.innerText = `${currentPlayer}'s turn`;
  } 
  else {
    statusEl.innerText = '';
  }
}

// when loading page:
document.addEventListener("DOMContentLoaded", () => {

    // get board
    boardDiv = document.getElementById("boardB");

    // enable start and play/pause buttons
    let startBtn = document.getElementById("startBtn")
    startBtn.addEventListener("click", startGame);

    let pausebtn = document.getElementById("pauseBtn")
    pausebtn.addEventListener("click", togglePause);


    renderBoard(); //initial board render
    // show initial status
    updateStatus();
});

// get selected mode, and algorithm containers
const modeSelect = document.getElementById("mode");
const algoXContainer = document.getElementById("algoX-container");
const algoOContainer = document.getElementById("algoO-container");

//To display only necessary options for selected game mode
function updateControls() {
  const mode = modeSelect.value;

  // do not show ai selectors
  if (mode === "human-human") {
    algoXContainer.style.display = "none";
    algoOContainer.style.display = "none";
  }

  // show only one ai selector for 0
  else if (mode === "human-ai") {
    algoXContainer.style.display = "none";
    algoOContainer.style.display = "block";
  }

  //show both ai selectors
  else if (mode === "ai-ai") {
    algoXContainer.style.display = "block";
    algoOContainer.style.display = "block";
  }
}

// run updateControls() when mode changes
modeSelect.addEventListener("change", updateControls);

// run once on load
updateControls();

// ensure status shows initial turn
updateStatus();

