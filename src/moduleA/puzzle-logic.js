(function(){

// Goal state
const finalGoal  = [[1,2,3],
         [4,5,6],
         [7,8,0]];

// Goal state as string for future comparisons
const goalKey = serialize(finalGoal);


const directions = [
    [1,0], //down
    [-1,0], //up
    [0,1], //right
    [0,-1] //left
];


//to clone current puzzle state
function clone(state){
    return state.map(row=>[...row]);
}

// convert current puzzle state to string
function serialize(state){
    return state.flat().join(",");
}

//to find empty square (0)
function findZero(state){
    for(let r=0; r<3; r++){
        for(let c=0; c<3; c++){
            if(state[r][c] === 0) return [r,c]
        }
    }

    return null;
}

//to get all valid moves in current state 
function getNeighbors(state){

    //find empty square
    const [r,c] = findZero(state);

    //array of all valid moves (neighbors)
    const moves = [];

    //for every direction: down, up, right, left
    for(let [dr,dc] of directions){

        //new position of tile moving to empty square
        const nr = r + dr;
        const nc = c + dc;

        if(nr>=0 && nr<3 && nc>=0 && nc<3){
            const newState = clone(state);

            //swap: new position(nr, nc) moves to empty square;
            //      now empty square is nr, nc (new position)
            newState[r][c] = newState[nr][nc];
            newState[nr][nc] =0;

            moves.push(newState);
        }
    }

    return moves;
}

//shuffle board to solvable state
function shuffleState(startState, moves = 50) {
  let current = startState.map(row => [...row]); // deep copy

  for (let i = 0; i < moves; i++) {
    const neighbors = getNeighbors(current);
    current = neighbors[Math.floor(Math.random() * neighbors.length)];
  }

  return current;
}



function bfs(start) {

  // FIFO queue: state (current board), path(sequence of states (moves))
  const queue = [{ state: start, path: [start] }];
  let head = 0; // Points to the next item to process

  //to keep track of visited states
  const visited = new Set();

  let nodes = 0;
  const startTime = performance.now(); //time

  // Add start to visited 
  visited.add(serialize(start));

  while (head < queue.length) {
    // O(1) dequeue, move pointer forward
    const { state, path } = queue[head++]; 
    const key = serialize(state); //convert current state to string

    nodes++;

    // check current state matches goal state, if it does return
    if (key === goalKey) {

      return {
        path,
        nodes,
        time: performance.now() - startTime
      };
    }

    //generate all valid moves (neighbors)
    for (let next of getNeighbors(state)) {
      const nextKey = serialize(next);
      
      //enqueue unvisited moves
      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        
        queue.push({
          state: next,
          path: [...path, next] //copy existing path and add reference of next state
        });
      }
    }
  }

  //return if no solution
  return {
    path: [],
    nodes,
    time: performance.now() - startTime
  };
}

// Priority Queue
class PriorityQueue {
  constructor(compare) {
    this.data = [];
    this.compare = compare;
  }

  push(item) {
    this.data.push(item);
    this.data.sort(this.compare); // O(n log n)
  }

  pop() {
    return this.data.shift(); // pop smallest element
  }

  isEmpty() {
    return this.data.length === 0;
  }
}


function dijkstra(start) {

  // priority queue (min cost)
  const pq = new PriorityQueue((a, b) => a.cost - b.cost);

  //add start to queue
  pq.push({ state: start, path: [start], cost: 0 });

  const dist = new Map(); // key -> best cost so far
  dist.set(serialize(start), 0);

  let nodes = 0;
  const startTime = performance.now(); //start time

  while (!pq.isEmpty()) {
    const { state, path, cost } = pq.pop(); // dequeue 
    const key = serialize(state);

    // Skip outdated entries 
    if (cost > dist.get(key)) continue;

    nodes++;

    // check current state matches goal state, if so return
    if (key === goalKey) {
      return {
        path,
        nodes,
        time: performance.now() - startTime
      };
    }

    //generate all valid moves (neighbors)
    for (let next of getNeighbors(state)) {
      const nextKey = serialize(next);
      const newCost = cost + 1;

      //update if no cost saved or is smaller cost for existing
      if (!dist.has(nextKey) || newCost < dist.get(nextKey)) {
        dist.set(nextKey, newCost);

        // save state
        pq.push({
          state: next,
          path: [...path, next], 
          cost: newCost
        });
      }
    }
  }
}

// Manhattan Distance Heuristic
function manhattan(state, goal) {
  let distance = 0;

  //iterate over board
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {

      //current square
      const value = state[r][c];

      if (value !== 0) {

        // find goal position of this square
        for (let gr = 0; gr < 3; gr++) {
          for (let gc = 0; gc < 3; gc++) {

            //goal position found
            if (goal[gr][gc] === value) {

              //calculate manhattan distance
              distance += Math.abs(gr - r) + Math.abs(gc - c); // |goal_row - current_row| + |goal_col - current_col|
            }
          }
        }
      }
    }
  }

  return distance;
}

function aStar(start) {

  // priority queue sorted by f(n) = g + h
  const pq = new PriorityQueue((a, b) => a.priority - b.priority);

  // start node
  pq.push({
    state: start,
    path: [start],
    cost: 0, // g(n)
    priority: manhattan(start, finalGoal) // f(n)
  });

  //to save best known g(n) for each state to avoid visiting worse paths
  const dist = new Map(); // best g(n) cost
  dist.set(serialize(start), 0);

  let nodes = 0;
  const startTime = performance.now();

  // stop until goal is found or no states left
  while (!pq.isEmpty()) {

    //get state with lowest f(n )
    const { state, path, cost } = pq.pop();
    const key = serialize(state);

    // skip worse paths for currnet state
    if (cost > dist.get(key)) continue;

    //increase visited nodes
    nodes++;

    // check current state matches goal state
    if (key === goalKey) {
      return {
        path,
        nodes,
        time: performance.now() - startTime
      };
    }

    // explore all valid moves
    for (let next of getNeighbors(state)) {
      // current move
      const nextKey = serialize(next);
      const newCost = cost + 1; // g(n)

      //check if state is new or cost is cheaper
      if (!dist.has(nextKey) || newCost < dist.get(nextKey)) {
        dist.set(nextKey, newCost);

        const h = manhattan(next, finalGoal); // heuristic h(n)
        const f = newCost + h; //f(n) = g(n) + h(n)

        //push to queue
        pq.push({
          state: next,
          path: [...path, next],
          cost: newCost,
          priority: f
        });
      }
    }
  }

  //return if no solution
  return {
    path: [],
    nodes,
    time: performance.now() - startTime
  };
}

// expose functions to window for plain script use
window.PuzzleLogic = {
  shuffleState,
  bfs,
  dijkstra,
  aStar
};

})();
