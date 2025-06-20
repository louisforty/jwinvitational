// Render a player row from Firebase
function renderPlayer(playerId, data) {
  const table = document.getElementById("players");
  let row = document.querySelector(`tr[data-id='${playerId}']`);

  if (!row) {
    row = document.createElement("tr");
    row.setAttribute("data-id", playerId);
    table.appendChild(row);
  }

  let cells = `<td>
    <div style="display: flex; align-items: center; gap: 8px;">
      <input type="text" value="${data.name || ''}" 
        onchange="updatePlayer('${playerId}')" />
      <button onclick="deletePlayer('${playerId}')" 
        style="background: #ff4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
        ×
      </button>
    </div>
  </td>`;

  for (let i = 0; i < 18; i++) {
    const score = data.scores?.[i] ?? "";
    cells += `<td><input type="number" min="1" max="10" value="${score}" 
                onchange="updatePlayer('${playerId}')" /></td>`;
  }

  // Calculate score relative to par
  const parRow = document.querySelector('.par-row');
  const parValues = Array.from(parRow.querySelectorAll('td')).slice(1, 19).map(td => {
    const text = td.textContent;
    return parseInt(text.split(' ')[0]); // Extract just the number from "4 CtP" etc.
  });
  
  const total = data.scores?.reduce((sum, val, index) => {
    const score = parseInt(val);
    if (isNaN(score)) return sum; // Skip holes with no score
    const par = parValues[index];
    return sum + (score - par);
  }, 0) || 0;

  // Format the score with + or - sign
  const formattedScore = total > 0 ? `+${total}` : total;
  cells += `<td class="total">${formattedScore}</td>`;
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
    const parRow = document.querySelector('.par-row');
    const parValues = Array.from(parRow.querySelectorAll('td')).slice(1, 19).map(td => {
      const text = td.textContent;
      return parseInt(text.split(' ')[0]);
    });

    let total = 0;
    inputs.forEach((input, index) => {
      const score = parseInt(input.value);
      if (isNaN(score)) return; // Skip holes with no score
      const par = parValues[index];
      total += (score - par);
    });
    
    row.querySelector(".total").textContent = total > 0 ? `+${total}` : total;
  });

  const sorted = rows.sort((a, b) => {
    const aTotal = parseInt(a.querySelector(".total").textContent);
    const bTotal = parseInt(b.querySelector(".total").textContent);
    return aTotal - bTotal;
  });

  sorted.forEach(row => tbody.appendChild(row));
}

// Delete a player from Firebase
function deletePlayer(playerId) {
  if (confirm('Are you sure you want to delete this team?')) {
    db.ref("players/" + playerId).remove();
  }
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
