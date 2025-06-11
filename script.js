let playerCount = 0;

function addPlayer() {
    const tbody = document.getElementById("players");
    const row = document.createElement("tr");
    row.setAttribute("data-id", playerCount);

    let cells = `<td><input type="text" placeholder="Name" onchange="updateScores()" /></td>`;

    for (let i = 0; i < 18; i++) {
        cells += `<td><input type="number" min="1" max="10" onchange="updateScores()" /></td>`;
    }

    cells += `<td class="total">0</td>`;
    row.innerHTML = cells;
    tbody.appendChild(row);

    playerCount++;
}

function updateScores() {
    const rows = Array.from(document.querySelectorAll("#players tr"));

    rows.forEach(row => {
        const inputs = row.querySelectorAll("input[type='number']");
        let total = 0;
        inputs.forEach(input => {
            const val = parseInt(input.value);
            if (!isNaN(val)) total += val;
        });
        row.querySelector(".total").textContent = total;
    });

    // Sort rows by total score
    const sortedRows = rows.sort((a, b) => {
        const aScore = parseInt(a.querySelector(".total").textContent);
        const bScore = parseInt(b.querySelector(".total").textContent);
        return aScore - bScore;
    });

    const tbody = document.getElementById("players");
    tbody.innerHTML = "";
    sortedRows.forEach(row => tbody.appendChild(row));
}
