(function () {
  const container = document.getElementById("dashboard-container");

//   metrics for performance dashboard
  let state = {
    decisionTime: "0.00",
    nodesExplored: 0,
    solutionLength: "-",
    pruningEfficiency: "-",
    isSplitMode: false,
    playerX: { algo: "-", decisionTime: "0.00", nodesExplored: 0, pruningEfficiency: "-" },
    playerO: { algo: "-", decisionTime: "0.00", nodesExplored: 0, pruningEfficiency: "-" }
  };

  function render() {
    if (!container) return;

    // Module B: Split View for 2 players
    if (state.isSplitMode) {
      container.innerHTML = `
        <div>
          <div class="metrics">
            <div>
              <h3>Player X (${state.playerX.algo})</h3>
              <div><span class="metric-label">DECISION TIME</span> <p class="metric-value">${state.playerX.decisionTime} <span class="metric-unit">ms</span></p></div>
              <div><span class="metric-label">NODES EXPLORED</span> <p class="metric-value">${state.playerX.nodesExplored}</p></div>
              <div><span class="metric-label">PRUNING EFFICIENCY</span> <p class="metric-value">${state.playerX.pruningEfficiency}</p></div>
            </div>
            <div>
              <h3>Player O (${state.playerO.algo})</h3>
              <div><span class="metric-label">DECISION TIME</span> <p class="metric-value">${state.playerO.decisionTime} <span class="metric-unit">ms</span></p></div>
              <div><span class="metric-label">NODES EXPLORED</span> <p class="metric-value">${state.playerO.nodesExplored}</p></div>
              <div><span class="metric-label">PRUNING EFFICIENCY</span> <p class="metric-value">${state.playerO.pruningEfficiency}</p></div>
            </div>
          </div>

      `;
      return;
    }

    // Module A: Standard View
    // Read selected algorithm from the DOM (if present) to display in dashboard
    const algoSelect = document.getElementById('algoSelect');
    const algoText = algoSelect ? algoSelect.options[algoSelect.selectedIndex].text : '-';

    container.innerHTML = `
      <div>
        <div class="metrics">
          <div><span class="metric-label">ALGORITHM</span> <p class="metric-value">${algoText}</p></div>
          <div><span class="metric-label">DECISION TIME</span> <p class="metric-value">${state.decisionTime} <span class="metric-unit">ms</span></p></div>
          <div><span class="metric-label">NODES EXPLORED</span> <p class="metric-value">${state.nodesExplored}</p></div>
          <div><span class="metric-label">SOLUTION LENGTH</span> <p class="metric-value">${state.solutionLength}</p></div>
        </div>
      </div>
    `;
  }

  //attach dashboard to global window object (makes it accesible anywhere)
  window.Dashboard = {

    //update new data and re-render
    update(newMetrics) {

        //check if player's exist to update, if so merge old state and new metrics
      if (newMetrics.playerX) newMetrics.playerX = { ...state.playerX, ...newMetrics.playerX };
      if (newMetrics.playerO) newMetrics.playerO = { ...state.playerO, ...newMetrics.playerO };

      //update dashboard 
      state = { ...state, ...newMetrics };
      render();
    },

    // reset values to default
    reset() {
      state = {
        decisionTime: "0.00",
        nodesExplored: 0,
        solutionLength: "-",
        pruningEfficiency: "-",
        isSplitMode: false,
        playerX: { algo: "-", decisionTime: "0.00", nodesExplored: 0, pruningEfficiency: "-" },
        playerO: { algo: "-", decisionTime: "0.00", nodesExplored: 0, pruningEfficiency: "-" }
      };
      render();
    }
  };

//   display ui for performance dashboard
  render();
})();