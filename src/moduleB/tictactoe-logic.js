(function(){

let nodesEvaluated = 0; //to track nodes expanded

// to check for winner or draw
function checkWinner(board) {

  // check rows
  for (let r = 0; r < 3; r++) {
    if (board[r][0] && board[r][0] === board[r][1] && board[r][0] === board[r][2]) {
      return board[r][0];
    }
  }

  // check columns
  for (let c = 0; c < 3; c++) {
    if (board[0][c] && board[0][c] === board[1][c] && board[0][c] === board[2][c]) {
      return board[0][c];
    }
  }

  // diagonals
  if (board[0][0] && board[0][0] === board[1][1] && board[0][0] === board[2][2]) return board[0][0];
  if (board[0][2] && board[0][2] === board[1][1] && board[0][2] === board[2][0]) return board[0][2];

  // check for draw (no nulls)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) return null; // game still in progress
    }
  }

  return "draw";
}

//get possible moves
function getMoves(board) {
  const moves = [];

  //findy empty squares (possible moves)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) moves.push({ r, c });
    }
  }
  return moves;
}

function minimax(board, currentPlayer, maxPlayer, depth=0) {
  nodesEvaluated++; 
  const result = checkWinner(board); //check for winner
  
  const minPlayer = opponent(maxPlayer); // Min

  // Base cases
  if (result === maxPlayer) return 10 - depth;  //depth to select fastest best move
  if (result === minPlayer) return depth - 10; 
  if (result === "draw") return 0;

  const isMaximizing = currentPlayer === maxPlayer; 

  //Max player
  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let move of getMoves(board)) {
      //try move
      board[move.r][move.c] = currentPlayer;
      //simulate opponent (min)
      let score = minimax(board, opponent(currentPlayer), maxPlayer, depth + 1);
      //undo move
      board[move.r][move.c] = null;

      //update best score
      bestScore = Math.max(bestScore, score);
    }
    return bestScore;
  } 

  //Min player
  else {
    let bestScore = Infinity;
    for (let move of getMoves(board)) {
      //try move
      board[move.r][move.c] = currentPlayer;
      //simulate opponent (max)
      let score = minimax(board, opponent(currentPlayer), maxPlayer, depth + 1);
      //undo move
      board[move.r][move.c] = null;
  
      //update best score
      bestScore = Math.min(bestScore, score);
    }
    return bestScore;
  }
}


function minimaxAB(board, currentPlayer, maxPlayer, depth = 0, alpha = -Infinity, beta = Infinity) {
  nodesEvaluated++; 
  const result = checkWinner(board); //check for winner

  const minPlayer = opponent(maxPlayer);

  // Base cases
  if (result === maxPlayer) return 10 - depth;
  if (result === minPlayer) return depth - 10;
  if (result === "draw") return 0;

  //check if we are maximizing
  const isMaximizing = currentPlayer === maxPlayer;

  // Max player
  if (isMaximizing) {
    let bestScore = -Infinity;

    for (let move of getMoves(board)) {
      //try move
      board[move.r][move.c] = currentPlayer;

      //simulate opponent (min)
      let score = minimaxAB(board, opponent(currentPlayer), maxPlayer, depth + 1, alpha, beta);

      //undo move
      board[move.r][move.c] = null;

      bestScore = Math.max(bestScore, score);

      // Update alpha (best option for MAX so far)
      alpha = Math.max(alpha, bestScore);

      // Prune, stop if branch is worse than opponent can already achieve
      if (beta <= alpha) break;
    }

    return bestScore;

  } 

  //Min player
  else {
    let bestScore = Infinity;

    for (let move of getMoves(board)) {
      //try move
      board[move.r][move.c] = currentPlayer;

      //simulate opponent (max)
      let score = minimaxAB(board, opponent(currentPlayer), maxPlayer, depth + 1, alpha, beta);

      //undo move
      board[move.r][move.c] = null;

      bestScore = Math.min(bestScore, score);

      // Update beta (best option for MIN so far)
      beta = Math.min(beta, bestScore);

      // prune
      if (beta <= alpha) break;
    }

    return bestScore;
  }
}


//get opponent player
function opponent(player) {
  return player === "X" ? "O" : "X";
}

// to get best bext move, calls minimax or alphabeta
function getBestMove(board, currentPlayer, useAlphaBeta = true) {
  nodesEvaluated = 0; 
  const startTime = performance.now();

  let bestScore = -Infinity;
  let bestMoves = [];

  const maxPlayer = currentPlayer;

  //try all moves
  for (let move of getMoves(board)) {
    board[move.r][move.c] = currentPlayer;

    let score;
    //check if alpha beta
    if (useAlphaBeta) {
      score = minimaxAB(board, opponent(currentPlayer), maxPlayer, 0, -Infinity, Infinity);
    } 

    // else use minimax
    else {
      score = minimax(board, opponent(currentPlayer), maxPlayer, 0);
    }

    //undo move
    board[move.r][move.c] = null;

    //update best score
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } 
    //save multiple best moves
    else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  //select random best move 
   const chosenMove =  bestMoves[Math.floor(Math.random() * bestMoves.length)];
   const totalTime = performance.now() - startTime;
  return {
    move: chosenMove,
    nodes: nodesEvaluated,
    time: totalTime
  };

}


// expose functions to window for plain script use
window.TTTLogic = {
  checkWinner,
  getBestMove
};

})();



