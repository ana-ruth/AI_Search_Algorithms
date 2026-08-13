const { shuffleState, bfs, dijkstra, aStar } = window.PuzzleLogic || {}; //get functions from puzzle-logic.js

// Polyfill structuredClone if not available to allow deep copy
if (typeof structuredClone === 'undefined') {
  window.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}


const defaultState = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0] 
];


let imageTiles = null;      // currently active tiles
let uploadedTiles = null;   // stored after upload
let currentState; // stores current state if the board
let solutionPath = []; // resulting path from algorithm
let stepIndex = 0; // current step in solutionPath
let intervalId = null; // reference for runnning loop for solution path steps
let isPlaying = false; // keeps track of when puzzle is solve by algorithm


// Get selected algorithm (BFS, Dijkstra's, A*) from user
function getSelectedAlgorithm() {
    const select = document.getElementById("algoSelect");
    return select.value;
}

//check by value if current state is equal to goal
function isSolved(state) {
    return JSON.stringify(state) === JSON.stringify(defaultState);
}

// To solve board
function handleSolve(){
    const solveBtn = document.getElementById('solveBtn');
    const algo = getSelectedAlgorithm();

    //check if solved
    if (isSolved(currentState)) {
        return;
    }

    // enter loading state
    if (solveBtn) {
        solveBtn.classList.add('is-loading');
        solveBtn.disabled = true;
        solveBtn.innerHTML = `<span>Solving...</span>`;
    }

    setTimeout(() => {

      //reset dashboard at start
        window.Dashboard.reset();
        const isolatedState = structuredClone(currentState); //deep copy
        let result;

        //solve with selected algorithm
        if (algo === "bfs") {
            result = bfs(isolatedState);
        } 
        else if (algo === "dijkstra") {
            result = dijkstra(currentState);
        } 
        else if (algo === "astar") {
            result = aStar(currentState);
        } 

        //display performance metrics
        window.Dashboard.update({
            isSplitMode: false,  // switches to Module A style
            decisionTime: result.time.toFixed(2),
            nodesExplored: result.nodes,
            solutionLength: result.path.length - 1,
            pruningEfficiency: "N/A",
            playerX: { algo: "-", decisionTime: "0.00", nodesExplored: 0, pruningEfficiency: "-" },
            playerO: { algo: "-", decisionTime: "0.00", nodesExplored: 0, pruningEfficiency: "-" }
        });

        solutionPath = result.path;   // result = { path, nodes, time }
        stepIndex = 0;
        isPlaying = true;

        // exit loading state
        if (solveBtn) {
            solveBtn.classList.remove('is-loading');
            solveBtn.disabled = false;
            solveBtn.innerHTML = "Solve"; 
        }

        // show solution
        playSolution();

    }, 50); 
}


// toggle between play and pause
function togglePlayPause() {
    const btn = document.getElementById("playPauseBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    
      // if pause is clicked:
    if (isPlaying) {
      clearInterval(intervalId); //stop loop of solution path
      stepIndex--; 
      isPlaying = false;
      btn.textContent = "▶";
      
    } 
      //if play is clicked:
    else {
      playSolution(); //continue solution
      isPlaying = true;
      btn.textContent = "⏸";
    }
}

// to show next step (next state)
function stepForward() {
  if (stepIndex < solutionPath.length - 1) {
    stepIndex++;
    currentState = solutionPath[stepIndex];
    render(currentState);
  }
}

// to show previous step (previous state)
function stepBackward() {
    
  if (stepIndex > 0) {
    stepIndex--;
    currentState = solutionPath[stepIndex];
    render(currentState);
  }

}

// To display algorithm's solution step by step
function playSolution() {
  clearInterval(intervalId); // clear loop for solution path

  const btn = document.getElementById("playPauseBtn");
  if (btn) btn.textContent = "⏸";

  // disable shuffle button and board while playing solution
  const shuffleBtn = document.getElementById("shuffleBtn");
  if (shuffleBtn) shuffleBtn.disabled = true;

  const board = document.getElementById("boardA");
  if (board) {
    board.style.pointerEvents = "none";
    board.classList.add('disabled');
  }

  //run code repeatedly every 600ms until reaching the end of solution path
  intervalId = setInterval(() => {
    if (stepIndex >= solutionPath.length) {
      clearInterval(intervalId);

      // re-enable controls when finished
      if (shuffleBtn) shuffleBtn.disabled = false;
      if (board) {
        board.style.pointerEvents = "auto";
        board.classList.remove('disabled');
      }
      isPlaying = false;
      if (btn) btn.textContent = "▶";
      return;
    }
  
    //get and display current step
    currentState = solutionPath[stepIndex]; 
    render(currentState);
    stepIndex++;

  }, 600); // 600ms per move
}


//find empty tile (0)
function findZero(state) {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (state[r][c] === 0) return { r, c };
        }
    }
}

// Swap selected tile with empty tile
function moveTile(state, r, c) {

    //get position of 0
    const { r: zr, c: zc } = findZero(state);

    //invalid moves (not adjacent to 0)
    if (Math.abs(r - zr) + Math.abs(c - zc) !== 1) {
        return state;
    }

    //copy current board
    const newState = state.map(row => [...row]);

    //swap  selected tile with empty
    newState[zr][zc] = newState[r][c];
    newState[r][c] = 0;

    return newState;
}

// To display current state of the board
function render(state) {
  const board = document.getElementById("boardA");
  board.innerHTML = "";

  //iterate tiles in board
  state.forEach((row, r) => {
    row.forEach((value, c) => {
      const tile = document.createElement("div");
      tile.className = "tile";

        //  Reset board tiles
      tile.style.backgroundImage = "";
      tile.innerText = "";

        if (value !== 0) {
            // If Image Mode is selected
            if (imageTiles) {
                // set selected slice as tile background
                tile.style.backgroundImage = `url(${imageTiles[value - 1].toDataURL()})`;
                tile.style.backgroundSize = "cover"; // scale/crop image if needed
            } 

            //  If Number mode is selected
            else{
                tile.innerText = value;
            }

            // Enable clicks on tiles to play manually
            tile.onclick = () => {
                const next = moveTile(currentState, r, c);

                // re-render if states are different
                if (JSON.stringify(next) !== JSON.stringify(currentState)) {
                    currentState = next;
                    render(currentState);
                }
            };
        } 
      
      else {
        tile.style.background = "#ecf0f1";
      }

      board.appendChild(tile);
    });
  });
}

//to shuffle board to solvable state
function handleShuffle() {
  currentState = shuffleState(currentState);
  render(currentState);
}

function handleImageUpload(e) {
  const file = e.target.files[0]; //first file from user
  if (!file) return;

  const img = new Image();
  //wait for image to load, then process it
  img.onload = () => processImage(img);
  img.src = URL.createObjectURL(file); //temp location for image
}

function processImage(img) {
  //pick shortest side of image to prevent distortion
  const size = Math.min(img.width, img.height); 

  //canvas sqaure for cropped image
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  //drawing context
  const ctx = canvas.getContext("2d");

  //center the crop
  const sx = (img.width - size) / 2;
  const sy = (img.height - size) / 2;

  //draw cropped image (source) into the canvas (destination)
  ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

  sliceImage(canvas);
}


function sliceImage(squareCanvas) {
  //clear previous image tiles
  uploadedTiles = [];

  const tileSize = squareCanvas.width / 3;

  //loop through board
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {

      //create canvas per tile
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = tileSize;
      tileCanvas.height = tileSize;

      //get drawing context
      const ctx = tileCanvas.getContext("2d");

      //extract tile
      ctx.drawImage(
        squareCanvas,
        c * tileSize, r * tileSize, tileSize, tileSize,
        0, 0, tileSize, tileSize
      );

      //store tile
      uploadedTiles.push(tileCanvas);
    }
  }

}


// when loading page:
document.addEventListener("DOMContentLoaded", () => {

    //shuffle board
  currentState = shuffleState(defaultState);
    //currentState = [[0,4,3],[6,8,2],[5,1,7]];
    //currentState = [[8,1,3],[4,0,2],[7,6,5]] ;
  render(currentState);

  // enable shuffle, solve, play/pause, next, previous buttons
  let shuffleBtn = document.getElementById("shuffleBtn");
  shuffleBtn.addEventListener("click", handleShuffle);

  let solveBtn = document.getElementById("solveBtn");
  solveBtn.addEventListener("click",handleSolve);

  let playPauseBtn = document.getElementById("playPauseBtn")
  playPauseBtn.addEventListener("click", togglePlayPause);

  let nextBtn = document.getElementById("nextBtn")
  nextBtn.addEventListener("click", stepForward);

  let prevBtn = document.getElementById("prevBtn")
  prevBtn.addEventListener("click", stepBackward);

  //enable image upload 
  let imgInput = document.getElementById("imageUpload")
  imgInput.addEventListener("change", handleImageUpload); // to slice image

  //to display image name on screen
  imgInput.addEventListener('change', function(e) {
  const labelText = document.getElementById('file-name-text');
  
  if (this.files && this.files.length > 0) {
    // Display the uploaded file name
    labelText.textContent = this.files[0].name;
  } 
  else {
    // window is open, but no file selected
    labelText.textContent = "No file selected";
  }
  });

  // enable toggle buttons (use image / use numbers)
  let defaultBtn = document.getElementById("defaultBtn");
  let useImgBtn = document.getElementById("useImageBtn");

  // set initial selected state (Numbers by default)
  if (defaultBtn) defaultBtn.classList.add('selected');

  //use numbers in board
  if (defaultBtn) defaultBtn.addEventListener("click", () => {
    imageTiles = null;
    if (defaultBtn) defaultBtn.classList.add('selected');
    if (useImgBtn) useImgBtn.classList.remove('selected');
    render(currentState);
  });

  //use image in board
  if (useImgBtn) useImgBtn.addEventListener("click", () => {
    //check there's a file to use
    if (!uploadedTiles) {
      alert("Upload an image first");
      return;
    }

    imageTiles = uploadedTiles;
    // mark image or numbers as selected
    if (useImgBtn) useImgBtn.classList.add('selected');
    if (defaultBtn) defaultBtn.classList.remove('selected');
    render(currentState); //re-render
  });


});






