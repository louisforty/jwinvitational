// Render a player row from Firebase
function renderPlayer(playerId, data) {
  const table = document.getElementById("players");
  let row = document.querySelector(`tr[data-id='${playerId}']`);

  if (!row) {
    row = document.createElement("tr");
    row.setAttribute("data-id", playerId);
    table.appendChild(row);
  }

  let cells = `<td><input type="text" value="${data.name || ''}" 
                onchange="updatePlayer('${playerId}')" /></td>`;

  for (let i = 0; i < 18; i++) {
    const score = data.scores?.[i] ?? "";
    cells += `<td><input type="number" min="1" max="10" value="${score}" 
                onchange="updatePlayer('${playerId}')" /></td>`;
  }

  const total = data.scores?.reduce((sum, val) => sum + (parseInt(val) || 0), 0) || 0;
  cells += `<td class="total">${total}</td>`;
  row.innerHTML = cells;

  sortTable();
}

// Create a new player in Firebase
function addPlayer() {
  const newRef = db.ref("players").push();
  newRef.set({
    name: "",
    scores: Array(18).fill("")
  });
}

// Update a player's data in Firebase
function updatePlayer(playerId) {
  const row = document.querySelector(`tr[data-id='${playerId}']`);
  const inputs = row.querySelectorAll("input");
  const name = inputs[0].value;
  const scores = Array.from(inputs).slice(1, 19).map(input => input.value);
  db.ref("players/" + playerId).set({ name, scores });
}

// Sort players by total score
function sortTable() {
  const tbody = document.getElementById("players");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  rows.forEach(row => {
    const inputs = row.querySelectorAll("input[type='number']");
    let total = 0;
    inputs.forEach(input => {
      const val = parseInt(input.value);
      if (!isNaN(val)) total += val;
    });
    row.querySelector(".total").textContent = total;
  });

  const sorted = rows.sort((a, b) => {
    const aTotal = parseInt(a.querySelector(".total").textContent);
    const bTotal = parseInt(b.querySelector(".total").textContent);
    return aTotal - bTotal;
  });

  sorted.forEach(row => tbody.appendChild(row));
}

// Listen for changes in Firebase
db.ref("players").on("child_added", snapshot => {
  renderPlayer(snapshot.key, snapshot.val());
});

db.ref("players").on("child_changed", snapshot => {
  renderPlayer(snapshot.key, snapshot.val());
});

db.ref("players").on("child_removed", snapshot => {
  const row = document.querySelector(`tr[data-id='${snapshot.key}']`);
  if (row) row.remove();
});
