const tileData = [];

const grid = document.getElementById("grid");
const tileScroll = document.getElementById("tiles-scroll");
const searchInput = document.getElementById("search-input");
const saveJsonButton = document.getElementById("save-json-button");
const savePngButton = document.getElementById("save-png-button");
const loadInput = document.getElementById("load-input");
const gridContainer = document.getElementById("grid-container");
const menuToggle = document.getElementById("menu-toggle");
const sideMenu = document.getElementById("side-menu");
const backgroundSelect = document.getElementById("background-select");

let activeSprite = null;
let activeIsEraser = false;
let isMouseDown = false;
let currentLayer = "foreground";
let scale = 0.4;

const GRID_COLS = 100;
const GRID_ROWS = 60;
const TILE_SIZE = 32;

const loadingBarContainer = document.createElement("div");
loadingBarContainer.id = "loading-bar-container";
Object.assign(loadingBarContainer.style, {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "300px",
  height: "30px",
  border: "2px solid #4caf50",
  borderRadius: "5px",
  backgroundColor: "#222",
  display: "none",
  zIndex: "10000",
  userSelect: "none",
  pointerEvents: "none",
  textAlign: "center",
  lineHeight: "30px",
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  fontWeight: "bold",
  color: "#fff",
  boxSizing: "border-box",
  position: "relative",
});
const loadingBarFill = document.createElement("div");
Object.assign(loadingBarFill.style, {
  height: "100%",
  width: "0%",
  backgroundColor: "#4caf50",
  borderRadius: "3px 0 0 3px",
  transition: "width 0.3s ease",
});
loadingBarContainer.appendChild(loadingBarFill);

const loadingBarText = document.createElement("span");
Object.assign(loadingBarText.style, {
  position: "absolute",
  width: "100%",
  top: "0",
  left: "0",
  lineHeight: "30px",
  color: "#fff",
  fontWeight: "bold",
  textAlign: "center",
  pointerEvents: "none",
  userSelect: "none",
});
loadingBarContainer.appendChild(loadingBarText);

document.body.appendChild(loadingBarContainer);

function showLoadingBar() {
  loadingBarContainer.style.display = "block";
  loadingBarFill.style.width = "0%";
  loadingBarText.textContent = "Loading Breaworlds Assets 0%";
}

function updateLoadingBar(percent) {
  loadingBarFill.style.width = `${percent}%`;
  loadingBarText.textContent = `Loading Breaworlds Assets ${percent}%`;
}

function hideLoadingBar() {
  loadingBarContainer.style.display = "none";
}

function scrollToBottomRight() {
  gridContainer.scrollTop = gridContainer.scrollHeight;
  gridContainer.scrollLeft = 0;
}

function scrollToTopLeft() {
  gridContainer.scrollTop = 0;
  gridContainer.scrollLeft = 0;
}

function updateGridScale() {
  const rawWidth = GRID_COLS * TILE_SIZE;
  const rawHeight = 1920;

  const scaledWidth = rawWidth * scale;
  const scaledHeight = rawHeight * scale;

  grid.style.width = `${rawWidth}px`;
  grid.style.height = `${rawHeight}px`;
  grid.style.transform = `scale(${scale})`;
  grid.style.transformOrigin = "top left";

  gridContainer.style.overflowX = "auto";
  gridContainer.style.overflowY = "auto";

  if (backgroundSelect.value !== "grid") {
    grid.style.backgroundSize = `${rawWidth}px ${rawHeight}px`;
  } else {
    grid.style.backgroundSize = `${TILE_SIZE}px ${TILE_SIZE}px`;
  }

  setTimeout(scrollToTopLeft, 10);
}

gridContainer.addEventListener("wheel", (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const zoomSpeed = 0.1;
    scale += e.deltaY * -zoomSpeed * 0.01;
    scale = Math.min(Math.max(0.3, scale), 2);
    updateGridScale();
  }
});

menuToggle.onclick = () => {
  const computedDisplay = window.getComputedStyle(sideMenu).display;
  if (computedDisplay === "none") {
    sideMenu.style.display = "flex";
    gridContainer.style.left = "320px";
  } else {
    sideMenu.style.display = "none";
    gridContainer.style.left = "0";
  }
};

backgroundSelect.onchange = () => {
  const val = backgroundSelect.value;
  grid.style.backgroundImage = `url('${val}')`;
  grid.style.backgroundRepeat = "no-repeat";
  grid.style.backgroundPosition = "top left";
  updateGridScale();
};

function createTileOption(tile) {
  const div = document.createElement("div");
  div.className = "tile-option";
  div.style.backgroundImage = `url('${tile.sprite}')`;
  div.setAttribute("data-sprite", tile.sprite);
  div.setAttribute("data-name", tile.name.toLowerCase());
  div.title = tile.name;

  div.addEventListener("click", () => {
    activeSprite = tile.sprite;
    activeIsEraser = tile.isEraser || false;
    updateSelected(div);
  });

  return div;
}

function updateSelected(selectedDiv) {
  document
    .querySelectorAll(".tile-option")
    .forEach((div) => div.classList.remove("selected"));
  selectedDiv.classList.add("selected");
}

function renderTileOptions(filter = "") {
  tileScroll.innerHTML = "";
  tileScroll.style.flexDirection = "column";

  const eraserTile = tileData.find((tile) => tile.isEraser);
  if (eraserTile) {
    tileScroll.appendChild(createTileOption(eraserTile));
  }

  tileData
    .filter(
      (tile) =>
        !tile.isEraser &&
        tile.name.toLowerCase().includes(filter.toLowerCase()),
    )
    .forEach((tile) => tileScroll.appendChild(createTileOption(tile)));
}

function applyTile(cell, button) {
  if (cell.classList.contains("locked-bedrock")) return;
  if (!activeSprite) return;

  const targetLayer =
    cell.querySelector(`.${currentLayer}-layer`) ||
    createLayer(cell, currentLayer);

  if (activeIsEraser || button === 2) {
    targetLayer.innerHTML = "";
    updateBlockUsageList();
    return;
  }

  targetLayer.innerHTML = "";
  const img = document.createElement("img");
  img.src = activeSprite;
  img.className = "sprite";
  targetLayer.appendChild(img);

  updateBlockUsageList();
}

function createLayer(cell, type) {
  const layer = document.createElement("div");
  layer.className = `${type}-layer`;
  cell.appendChild(layer);
  return layer;
}

function createGrid(rows, cols) {
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = `repeat(${cols}, ${TILE_SIZE}px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, ${TILE_SIZE}px)`;

  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");

    cell.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      applyTile(cell, e.button);
    });
    cell.addEventListener("mouseover", (e) => {
      if (isMouseDown) {
        applyTile(cell, e.buttons === 2 ? 2 : 0);
      }
    });

    grid.appendChild(cell);
  }

  const cells = document.querySelectorAll(".cell");
  const obsidianUrl = "/Export_Sprites/Export_Sprites/spr_fg_bedrock_0.png";
  const startIndex = (GRID_ROWS - 4) * GRID_COLS;

  for (let i = startIndex; i < GRID_ROWS * GRID_COLS; i++) {
    const cell = cells[i];
    cell.classList.add("locked-bedrock");

    const layer = createLayer(cell, "foreground");
    const img = document.createElement("img");
    img.src = obsidianUrl;
    img.className = "sprite";
    layer.appendChild(img);
  }

  updateGridScale();
}

function loadWorld(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    const cells = document.querySelectorAll(".cell");
    data.forEach((tile, index) => {
      const cell = cells[index];
      if (!cell) return;

      const isLocked = cell.classList.contains("locked-bedrock");

      ["foreground-layer", "background-layer"].forEach((layerType) => {
        const existing = cell.querySelector(`.${layerType}`);
        if (existing && (!isLocked || layerType === "background-layer")) {
          existing.remove();
        }
      });

      if (tile.background) {
        const layer = createLayer(cell, "background");
        const img = document.createElement("img");
        img.src = tile.background;
        img.className = "sprite";
        layer.appendChild(img);
      }

      if (tile.foreground && !isLocked) {
        const layer = createLayer(cell, "foreground");
        const img = document.createElement("img");
        img.src = tile.foreground;
        img.className = "sprite";
        layer.appendChild(img);
      }
    });
  };
  reader.readAsText(file);
}

function saveWorldJson() {
  const cells = Array.from(document.querySelectorAll(".cell"));
  const worldData = cells.map((cell) => {
    const fg = cell.querySelector(".foreground-layer img.sprite");
    const bg = cell.querySelector(".background-layer img.sprite");
    return {
      foreground: fg ? fg.src : null,
      background: bg ? bg.src : null,
    };
  });

  const blob = new Blob([JSON.stringify(worldData, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "world.json";
  a.click();

  updateBlockUsageList();
}

function saveWorldPng() {
  const allCells = document.querySelectorAll(".cell");
  allCells.forEach((cell) => (cell.style.border = "none"));

  const prevTransform = grid.style.transform;
  grid.style.transform = "none";
  grid.style.width = "3200px";
  grid.style.height = "1920px";
  gridContainer.style.left = "0px";

  html2canvas(grid, {
    useCORS: true,
    backgroundColor: null,
    scrollX: 0,
    scrollY: 0,
    width: 3200,
    height: 1920,
    scale: 1,
  }).then((canvas) => {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "world.png";
    a.click();

    allCells.forEach((cell) => (cell.style.border = ""));
    grid.style.transform = prevTransform;
    gridContainer.style.left = "320px";
    updateGridScale();
  });
}

function loadWorld(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    const cells = document.querySelectorAll(".cell");
    data.forEach((tile, index) => {
      const cell = cells[index];
      if (!cell) return;

      ["foreground-layer", "background-layer"].forEach((layerType) => {
        const existing = cell.querySelector(`.${layerType}`);
        if (existing) existing.remove();
      });

      if (tile.background) {
        const layer = createLayer(cell, "background");
        const img = document.createElement("img");
        img.src = tile.background;
        img.className = "sprite";
        layer.appendChild(img);
      }

      if (tile.foreground) {
        const layer = createLayer(cell, "foreground");
        const img = document.createElement("img");
        img.src = tile.foreground;
        img.className = "sprite";
        layer.appendChild(img);
      }
    });
  };
  reader.readAsText(file);
}

document.addEventListener("mouseup", () => {
  isMouseDown = false;
});
document.addEventListener("contextmenu", (e) => e.preventDefault());
searchInput.addEventListener("input", () =>
  renderTileOptions(searchInput.value),
);
saveJsonButton.addEventListener("click", saveWorldJson);
savePngButton.addEventListener("click", saveWorldPng);
loadInput.addEventListener("change", loadWorld);

function updateBlockUsageList() {
  const cells = document.querySelectorAll(".cell");
  const counts = {};

  cells.forEach((cell) => {
    if (cell.classList.contains("locked-bedrock")) {
      return;
    }

    ["foreground-layer", "background-layer"].forEach((layerClass) => {
      const layer = cell.querySelector(`.${layerClass}`);
      if (layer) {
        const img = layer.querySelector("img.sprite");
        if (img && img.src) {
          counts[img.src] = (counts[img.src] || 0) + 1;
        }
      }
    });
  });

  const container = document.getElementById("block-count-list");
  container.innerHTML = "";

  if (Object.keys(counts).length === 0) {
    container.textContent = "No blocks placed yet.";
    return;
  }

  for (const [src, count] of Object.entries(counts)) {
    const item = document.createElement("div");
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.marginBottom = "6px";

    const img = document.createElement("img");
    img.src = src;
    img.style.width = "32px";
    img.style.height = "32px";
    img.style.objectFit = "contain";
    img.style.marginRight = "10px";
    img.style.border = "1px solid #ccc";
    img.style.background = "#fff";

    const countText = document.createElement("span");
    countText.textContent = `Used: ${count}`;
    countText.style.fontFamily = "Arial, sans-serif";
    countText.style.fontWeight = "bold";

    item.appendChild(img);
    item.appendChild(countText);
    container.appendChild(item);
  }
}
const toggleGridlinesButton = document.getElementById(
  "toggle-gridlines-button",
);
let gridlinesVisible = true;

toggleGridlinesButton.addEventListener("click", () => {
  const allCells = document.querySelectorAll(".cell");

  gridlinesVisible = !gridlinesVisible;

  allCells.forEach((cell) => {
    cell.style.border = gridlinesVisible ? "" : "none";
  });
});
async function loadTilesFromFolder() {
  try {
    const res = await fetch("/Export_Sprites/Export_Sprites/images.json");
    let files = await res.json();

    files = files.filter((file) => {
      const fname = file.toLowerCase();
      return (
        !fname.includes("seed") &&
        (fname.includes("background") ||
          fname.includes("block") ||
          fname.includes("brick") ||
          fname.includes("floor") ||
          fname.includes("lock") ||
          fname.includes("sand") ||
          fname.includes("obsidian") ||
          fname.includes("entrance") ||
          fname.includes("lamp") ||
          fname.includes("door") ||
          fname.includes("portal") ||
          fname.includes("ladder") ||
          fname.includes("chest") ||
          fname.includes("vine") ||
          fname.includes("roses") ||
          fname.includes("plant") ||
          fname.includes("iron") ||
          fname.includes("medieval") ||
          fname.includes("music") ||
          fname.includes("metal"))
      );
    });

    tileData.push({
      name: "Erase",
      sprite:
        "/Export_Sprites/Export_Sprites/spr_bg_red_brick_seed_0.png",
      isEraser: true,
    });

    const total = files.length;
    let count = 0;

    for (const file of files) {
      const name = file.replace(/^.*[\\/]/, "").replace(/\.[^/.]+$/, "");
      const spritePath = `/Export_Sprites/${file}`;
      tileData.push({ name, sprite: spritePath });

      count++;
      updateLoadingBar(Math.floor((count / total) * 50));
      await new Promise((r) => setTimeout(r, 10));
    }

    renderTileOptions();
  } catch (error) {
    console.error("Error loading tiles:", error);
  }
}

async function loadBackgroundOptions() {
  try {
    const res = await fetch("Export_Sprites/Export_Sprites/images.json");
    const files = await res.json();

    const bgFiles = files
      .filter((file) => file.startsWith("Export_Sprites/bg_"))
      .filter((file) => !file.toLowerCase().includes("menu"));

    const total = bgFiles.length;
    let count = 0;

    for (const file of bgFiles) {
      const filename = file.split("/").pop();
      const match = filename.match(/^bg_([a-zA-Z]+)_\d+/);
      if (!match) continue;

      const name = match[1];
      const displayName =
        name.charAt(0).toUpperCase() + name.slice(1) + " Background";
      const option = document.createElement("option");
      option.value = `/Export_Sprites/${file}`;
      option.textContent = displayName;
      backgroundSelect.appendChild(option);

      count++;
      updateLoadingBar(50 + Math.floor((count / total) * 50));
      await new Promise((r) => setTimeout(r, 10));
    }

    const forestOption = Array.from(backgroundSelect.options).find((option) =>
      option.textContent.toLowerCase().includes("forest"),
    );
    if (forestOption) {
      backgroundSelect.value = forestOption.value;
      backgroundSelect.onchange();
    }
  } catch (err) {
    console.error("Error loading backgrounds:", err);
  }
}

document.getElementById("render-image-button").addEventListener("click", () => {
  const fileInput = document.getElementById("image-upload");
  if (fileInput.files.length === 0) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = () => renderImageToWorld(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
});

document.getElementById("render-image-button").addEventListener("click", () => {
  const fileInput = document.getElementById("image-upload");
  if (fileInput.files.length === 0) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = () => renderImageToWorld(img);
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
});

async function renderImageToWorld(img) {
  showLoadingBar();

  const canvas = document.createElement("canvas");
  canvas.width = GRID_COLS;
  canvas.height = GRID_ROWS - 4;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const cells = document.querySelectorAll(".cell");
  const usedTiles = new Set();

  // CLEAR all sprites (manual or rendered) EXCEPT locked bedrock cells
  cells.forEach((cell) => {
    if (!cell.classList.contains("locked-bedrock")) {
      // Clear all content inside the cell (remove sprites)
      cell.innerHTML = "";
    }
  });

  const totalPixels = canvas.width * canvas.height;
  let processedPixels = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const r = imageData[index];
      const g = imageData[index + 1];
      const b = imageData[index + 2];

      const color = [r, g, b];
      const bestTile = await findClosestTile(color);
      if (!bestTile) continue;

      usedTiles.add(bestTile.name);

      const cellIndex = y * GRID_COLS + x;
      const cell = cells[cellIndex];

      if (cell && !cell.classList.contains("locked-bedrock")) {
        const layer = createLayer(cell, "foreground");
        layer.innerHTML = "";
        const imgEl = document.createElement("img");
        imgEl.src = bestTile.sprite;
        imgEl.className = "sprite";
        imgEl.style.pointerEvents = "none";
        layer.appendChild(imgEl);
      }

      processedPixels++;
      if (processedPixels % 100 === 0 || processedPixels === totalPixels) {
        const percent = Math.round((processedPixels / totalPixels) * 100);
        updateLoadingBar(percent);
      }
    }
  }

  updateBlockUsageList([...usedTiles]);
  hideLoadingBar();
}

async function findClosestTile(targetColor) {
  const mode = document.getElementById("tile-mode").value;
  const excludedWords = [
    "neon",
    "rainbow",
    "confetti",
    "color_background",
    "nano",
    "party",
    "pool",
    "glow",
    "glass",
    "anti",
    "drop",
    "game",
    "eraser",
  ];

  // Manual whitelist for 'color' mode
  const allowedColorTiles = [
    "spr_fg_red_block_0",
    "spr_fg_green_block_0",
    "spr_fg_blue_block_0",
    "spr_fg_yellow_block_0",
    "spr_fg_orange_block_0",
    "spr_fg_purple_block_0",
    "spr_fg_pink_block_0",
    "spr_fg_black_block_0",
    "spr_fg_white_block_0",
    "spr_fg_brown_block_0",
    "spr_fg_grey_block_0",
    "spr_fg_cyan_block_0",
    "spr_fg_light_blue_block_0",
    "spr_fg_dark_green_block_0",
    // Add more if needed
  ];

  const validTiles = tileData.filter((tile) => {
    const name = tile.name.toLowerCase();

    if (excludedWords.some((word) => name.includes(word))) return false;
    if (tile.isEraser) return false;

    if (mode === "color") {
      const baseName = name.replace(/\.png$/, "");
      const isAllowed = allowedColorTiles.includes(baseName);
      if (isAllowed) console.log("✅ Using color tile:", tile.name);
      return isAllowed;
    }

    if (mode === "plastic") {
      return name.includes("plastic") && name.includes("block");
    }

    if (mode === "background") {
      return name.includes("background");
    }

    return false;
  });

  if (validTiles.length === 0) {
    console.warn("❌ No valid tiles found for mode:", mode);
    return null;
  }

  let closest = null;
  let minDist = Infinity;

  for (const tile of validTiles) {
    const color = await averageColor(tile.sprite);
    if (!color) continue;

    const dist = colorDistance(color, targetColor);
    if (dist < minDist) {
      minDist = dist;
      closest = tile;
    }
  }

  return closest || validTiles[0];
}

const tileColorCache = {};
async function averageColor(spriteURL) {
  if (tileColorCache[spriteURL]) return tileColorCache[spriteURL];

  const img = new Image();
  img.src = spriteURL;
  img.crossOrigin = "anonymous";

  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = () => resolve();
  });

  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext("2d");

  try {
    ctx.drawImage(img, 0, 0, 4, 4);
    const data = ctx.getImageData(0, 0, 4, 4).data;

    let r = 0,
      g = 0,
      b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    r = Math.round(r / (data.length / 4));
    g = Math.round(g / (data.length / 4));
    b = Math.round(b / (data.length / 4));

    const avg = [r, g, b];
    tileColorCache[spriteURL] = avg;
    return avg;
  } catch {
    return null;
  }
}

function colorDistance(c1, c2) {
  return Math.sqrt(
    (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2,
  );
}
async function init() {
  showLoadingBar();
  await loadTilesFromFolder();
  await loadBackgroundOptions();
  hideLoadingBar();
}
updateBlockUsageList();

createGrid(GRID_ROWS, GRID_COLS);
init();
