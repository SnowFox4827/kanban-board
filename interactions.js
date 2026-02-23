let data = JSON.parse(localStorage.getItem("kanbanData")) || {
  boards: { "Default": { columns: [] } },
  active: "Default"
};

function save() {
  localStorage.setItem("kanbanData", JSON.stringify(data));
}

function renderBoards() {
  const select = document.getElementById("boardSelect");
  select.innerHTML = "";
  Object.keys(data.boards).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    if (name === data.active) opt.selected = true;
    select.appendChild(opt);
  });
}

document.getElementById("boardSelect").onchange = e => {
  data.active = e.target.value;
  save();
  render();
};

/* ===== BOARD CRUD ===== */
function createBoard() {
  const name = prompt("Board name:");
  if (!name || data.boards[name]) return;
  data.boards[name] = { columns: [] };
  data.active = name;
  save();
  render();
}

function renameBoard() {
  const name = prompt("New board name:");
  if (!name || data.boards[name]) return;
  data.boards[name] = data.boards[data.active];
  delete data.boards[data.active];
  data.active = name;
  save();
  render();
}

function deleteBoard() {
  if (!confirm("Delete board?")) return;
  delete data.boards[data.active];
  if (!Object.keys(data.boards).length)
    data.boards["Default"] = { columns: [] };
  data.active = Object.keys(data.boards)[0];
  save();
  render();
}

/* ===== COLUMN CRUD ===== */
function addColumn() {
  const name = prompt("Column name:");
  if (!name) return;

  // 10 preset colors
  const colors = [
    "#60a5fa", // Blue
    "#f87171", // Red
    "#34d399", // Green
    "#fbbf24", // Yellow
    "#a78bfa", // Purple
    "#f472b6", // Pink
    "#38bdf8", // Sky
    "#f97316", // Orange
    "#22c55e", // Emerald
    "#e879f9"  // Violet
  ];

  const picker = document.getElementById("colorPicker");
  const pickerContent = document.getElementById("colorPickerContent");

  pickerContent.innerHTML = ""; // clear previous buttons

  colors.forEach(color => {
    const btn = document.createElement("button");
    btn.style.width = "40px";
    btn.style.height = "40px";
    btn.style.borderRadius = "50%";
    btn.style.border = "2px solid var(--bg-surface)";
    btn.style.cursor = "pointer";
    btn.style.backgroundColor = color;
    btn.onclick = () => {
      data.boards[data.active].columns.push({
        title: name,
        color: color,
        cards: []
      });
      save();
      render();
      picker.style.display = "none";
    };
    pickerContent.appendChild(btn);
  });

  picker.style.display = "flex";
}

// Close color picker if clicking outside
document.getElementById("colorPicker").onclick = e => {
  if (e.target.id === "colorPicker") {
    e.target.style.display = "none";
  }
}


function renameColumn(index) {
  const name = prompt("New column name:");
  if (!name) return;
  data.boards[data.active].columns[index].title = name;
  save();
  render();
}

function deleteColumn(index) {
  if (!confirm("Delete column?")) return;
  data.boards[data.active].columns.splice(index, 1);
  save();
  render();
}

/* ===== CARD CRUD ===== */
function addCard(colIndex) {
  const text = prompt("Card text:");
  if (!text) return;
  data.boards[data.active].columns[colIndex].cards.push({ text });
  save();
  render();
}

function editCard(colIndex, cardIndex) {
  const card = data.boards[data.active].columns[colIndex].cards[cardIndex];
  const text = prompt("Edit text:", card.text);
  if (text !== null) card.text = text;
  save();
  render();
}

function deleteCard(colIndex, cardIndex) {
  data.boards[data.active].columns[colIndex].cards.splice(cardIndex, 1);
  save();
  render();
}

/* ===== JSON Import/Export ===== */
function exportJSON() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kanban-data.json";
  a.click();
  URL.revokeObjectURL(url);
}

function triggerImport() {
  document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.boards && imported.active) {
        data = imported;
        save();
        render();
      } else {
        alert("Invalid JSON structure.");
      }
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

/* ===== RENDER ===== */
function render() {
  renderBoards();
  const board = document.getElementById("board");
  board.innerHTML = "";

  data.boards[data.active].columns.forEach((col, colIndex) => {
    const column = document.createElement("div");
    column.className = "column";

    // ===== Column Header =====
    const header = document.createElement("div");
    header.className = "column-header";

    const title = document.createElement("h3");
    title.textContent = col.title;
    title.onclick = () => renameColumn(colIndex);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.onclick = () => deleteColumn(colIndex);

    // Color dot
    const colorDot = document.createElement("div");
    colorDot.className = "column-color-dot";
    colorDot.style.backgroundColor = col.color;

    // Clickable color dot to change column color
    colorDot.onclick = () => {
      const picker = document.getElementById("colorPicker");
      const pickerContent = document.getElementById("colorPickerContent");
      pickerContent.innerHTML = "";

      const colors = [
        "#60a5fa", "#f87171", "#34d399", "#fbbf24",
        "#a78bfa", "#f472b6", "#38bdf8", "#f97316",
        "#22c55e", "#e879f9"
      ];

      colors.forEach(color => {
        const btn = document.createElement("button");
        btn.style.width = "40px";
        btn.style.height = "40px";
        btn.style.borderRadius = "50%";
        btn.style.border = "2px solid var(--bg-surface)";
        btn.style.cursor = "pointer";
        btn.style.backgroundColor = color;
        btn.onclick = () => {
          col.color = color;  // update column color
          save();
          render();
          picker.style.display = "none";
        };
        pickerContent.appendChild(btn);
      });

      picker.style.display = "flex";
    };

    // Header right side (delete button + color dot)
    const headerRight = document.createElement("div");
    headerRight.className = "column-header-right";
    headerRight.appendChild(deleteBtn);
    headerRight.appendChild(colorDot);

    header.appendChild(title);
    header.appendChild(headerRight);

    // ===== Card List =====
    const cardList = document.createElement("div");
    cardList.className = "card-list";
    cardList.ondragover = e => e.preventDefault();
    cardList.ondrop = e => {
      const [fromCol, fromCard] = e.dataTransfer.getData("text").split(",");
      const moved = data.boards[data.active].columns[fromCol].cards.splice(fromCard, 1)[0];
      data.boards[data.active].columns[colIndex].cards.push(moved);
      save();
      render();
    };

    col.cards.forEach((card, cardIndex) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = "card";
      cardDiv.draggable = true;

      cardDiv.ondragstart = e => {
        e.dataTransfer.setData("text", `${colIndex},${cardIndex}`);
      };

      const textDiv = document.createElement("div");
      textDiv.textContent = card.text;
      textDiv.style.flex = "1";
      textDiv.onclick = () => editCard(colIndex, cardIndex);

      const delBtn = document.createElement("button");
      delBtn.textContent = "×";
      delBtn.onclick = e => {
        e.stopPropagation();
        deleteCard(colIndex, cardIndex);
      };

      cardDiv.appendChild(textDiv);
      cardDiv.appendChild(delBtn);
      cardList.appendChild(cardDiv);
    });

    // Add Card button
    const addBtn = document.createElement("button");
    addBtn.className = "add-card-btn";
    addBtn.textContent = "+ Card";
    addBtn.onclick = () => addCard(colIndex);

    // Append to column
    column.appendChild(header);
    column.appendChild(cardList);
    column.appendChild(addBtn);

    // Append column to board
    board.appendChild(column);
  });
}

render();