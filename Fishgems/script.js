const fishTypes = [
  {
    name: "Salmon",
    img: "./images/spr_ca_fish_salmon_big_0.png",
    sizes: { Small: 24, Medium: 120, Big: 600 },
  },
  {
    name: "Carp",
    img: "./images/spr_ca_fish_carp_big_0.png",
    sizes: { Small: 12, Medium: 60, Big: 300 },
  },
  {
    name: "Goldfish",
    img: "./images/spr_ca_fish_goldfish_big_0.png",
    sizes: { Small: 24, Medium: 120, Big: 600 },
  },
  {
    name: "Trout",
    img: "./images/spr_ca_fish_trout_big_0.png",
    sizes: { Small: 16, Medium: 80, Big: 400 },
  },
  {
    name: "Catfish",
    img: "./images/spr_ca_fish_catfish_big_0.png",
    sizes: { Small: 16, Medium: 80, Big: 400 },
  },
  { name: "Shark", img: "./images/spr_ca_fish_shark_0.png", gems: 800 },
  { name: "Lovefish", img: "./images/spr_ca_love_fish_0.png", gems: 400 },
  {
    name: "Tuna",
    img: "./images/spr_ca_fish_tuna_big_0.png",
    sizes: { Small: 120, Medium: 600, Big: 3000 },
  },
  {
    name: "Squid",
    img: "./images/spr_ca_fish_squid_big_0.png",
    sizes: { Small: 100, Medium: 480, Big: 2000 },
  },
  { name: "Clownfish", img: "./images/spr_ca_fish_clown_0.png", gems: 160 },
  { name: "Lobster", img: "./images/spr_ca_fish_lobster_0.png", gems: 1800 },
  { name: "Crab", img: "./images/spr_ca_fish_crab_0.png", gems: 300 },
  { name: "Marlin", img: "./images/spr_ca_fish_marlin_0.png", gems: 500 },
  {
    name: "Stingray",
    img: "./images/spr_ca_fishing_stingray_0.png",
    gems: 1200,
  },
  {
    name: "Tropical",
    img: "./images/spr_ca_fish_tropical_big_0.png",
    sizes: { Small: 24, Medium: 180, Big: 600 },
  },
  {
    name: "Piranha",
    img: "./images/spr_ca_fish_piranha_big_0.png",
    sizes: { Small: 40, Medium: 300, Big: 900 },
  },
  {
    name: "Ready Gems",
    gems: 1,
    img: "./images/spr_fg_smokehouse_0.png",
    description: "Calculate ready fishgems!",
  },
];

const fishGrid = document.getElementById("fishGrid");
let gridHTML = "";

fishTypes.forEach((fish) => {
  let inputsHTML = "";

  if (fish.sizes) {
    Object.entries(fish.sizes).forEach(([size, gems]) => {
      const id = `${fish.name}_${size}`;
      inputsHTML += `
                <div class="size-row">
                    <div class="size-info">
                        <span class="size-label">${size}</span>
                        <span class="gem-value">${gems} Gems</span>
                    </div>
                    <input type="number" id="${id}" data-fish="${fish.name}" data-gems="${gems}" placeholder="0" min="0" oninput="calculate()">
                </div>
            `;
    });
  } else {
    const id = fish.name;
    inputsHTML += `
            <div class="size-row">
                <div class="size-info">
                    <span class="size-label">${fish.description ? "Amount" : "Regular"}</span>
                    <span class="gem-value">${fish.description ? "" : fish.gems + " Gems"}</span>
                </div>
                <input type="number" id="${id}" data-fish="${fish.name}" data-gems="${fish.gems || 1}" placeholder="0" min="0" oninput="calculate()">
            </div>
        `;
  }

  gridHTML += `
        <div class="fish-card">
            <div class="fish-header">
                <img src="${fish.img}" alt="${fish.name}" class="fish-icon">
                <span class="fish-name">${fish.name}</span>
            </div>
            <div class="fish-inputs">
                ${inputsHTML}
            </div>
            <div class="fish-total-display" id="card_total_${fish.name}">
                <img src="./images/spr_icon_gems_0.png" style="height: 18px;"> 0
            </div>
        </div>
    `;
});

fishGrid.innerHTML = gridHTML;

function calculate() {
  let totalGems = 0;

  // Track card totals
  const cardTotals = {};

  // Select all inputs within the grid
  const inputs = fishGrid.querySelectorAll('input[type="number"]');

  inputs.forEach((input) => {
    let quantity = parseInt(input.value) || 0;
    if (quantity < 0) quantity = 0; // Prevent negative math

    let gemsEach = parseInt(input.getAttribute("data-gems")) || 0;
    let fishName = input.getAttribute("data-fish");
    let total = quantity * gemsEach;

    if (!cardTotals[fishName]) cardTotals[fishName] = 0;
    cardTotals[fishName] += total;

    totalGems += total;
  });

  // Update per-card totals UI
  fishTypes.forEach((f) => {
    const display = document.getElementById(`card_total_${f.name}`);
    const total = cardTotals[f.name] || 0;
    if (display) {
      display.innerHTML =
        `<img src="./images/spr_icon_gems_0.png" style="height: 18px;"> ` +
        total.toLocaleString("de-DE");
    }
  });

  let gemRateInput = document.getElementById("gemRate");
  let gemRate = parseInt(gemRateInput.value);

  // Update button active states to stay in sync with manual input
  const btns = document.querySelectorAll(".rate-btn");
  btns.forEach((btn) => {
    if (parseInt(btn.innerText) === gemRate) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  let locksHTML = "";

  if (gemRate && gemRate > 0) {
    let totalWL = Math.floor(totalGems / gemRate);

    let cl = Math.floor(totalWL / 10000);
    let rem = totalWL % 10000;

    let al = Math.floor(rem / 1000);
    rem = rem % 1000;

    let tl = Math.floor(rem / 100);
    let wl = rem % 100;

    let locksList = [];
    if (cl > 0)
      locksList.push(
        `<div style="display: flex; align-items: center; gap: 5px;"><img src="./images/spr_fg_crystal_lock_0.png" alt="CL" style="height: 24px;"> <span>${cl}</span></div>`,
      );
    if (al > 0)
      locksList.push(
        `<div style="display: flex; align-items: center; gap: 5px;"><img src="./images/spr_fg_amethyst_lock_0.png" alt="AL" style="height: 24px;"> <span>${al}</span></div>`,
      );
    if (tl > 0)
      locksList.push(
        `<div style="display: flex; align-items: center; gap: 5px;"><img src="./images/spr_fg_titanium_lock_0.png" alt="TL" style="height: 24px;"> <span>${tl}</span></div>`,
      );
    if (wl > 0 || (cl === 0 && al === 0 && tl === 0)) {
      locksList.push(
        `<div style="display: flex; align-items: center; gap: 5px;"><img src="./images/spr_fg_lock_0.png" alt="WL" style="height: 24px;"> <span>${wl}</span></div>`,
      );
    }

    locksHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; align-items: center; background: #1a1a2e; padding: 10px 15px; border-radius: 8px; border: 1px solid #3e3f5e;">
                <span style="font-size: 1rem; color: #00CC66; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-right: 5px;">Price:</span>
                ${locksList.join("")}
            </div>
        `;
  } else {
    locksHTML = `
            <div style="display: flex; align-items: center; gap: 10px; background: #1a1a2e; padding: 10px 15px; border-radius: 8px; border: 1px solid #3e3f5e;">
                <img src="./images/spr_fg_lock_0.png" alt="WL" style="height: 24px;">
                <a href="javascript:void(0)" onclick="scrollToRate()" style="color: #00CC66; text-decoration: underline; font-size: 1.1rem;">Set Gem Rate to see Price</a>
            </div>
         `;
  }

  // Dynamic font size logic
  let gemFontSize = "1.8rem";
  if (totalGems >= 10000000) gemFontSize = "1.5rem";
  if (totalGems >= 1000000000) gemFontSize = "1.2rem";

  const resultHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.1rem; color: #ccc;">Total Gems:</span>
                <img src="./images/spr_icon_gems_0.png" alt="Gems" style="height: 24px;"> 
                <span style="font-size: ${gemFontSize}; color: #fff;">${totalGems.toLocaleString("de-DE")}</span>
            </div>
            ${locksHTML}
        </div>
    `;

  document.getElementById("result").innerHTML = resultHTML;
  document.getElementById("totalResult").innerHTML = resultHTML;
}

function scrollToRate() {
  const btn = document.querySelector(".scroll-to-bottom");
  if (btn.classList.contains("up")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    document
      .getElementById("rateSection")
      .scrollIntoView({ behavior: "smooth" });
  }
}

function setRate(value) {
  document.getElementById("gemRate").value = value;
  calculate();
}

// Handle floating button direction and top total visibility on scroll
window.onscroll = function () {
  const btn = document.querySelector(".scroll-to-bottom");
  const topResult = document.getElementById("result");
  const totalResult = document.getElementById("totalResult");
  const rect = totalResult.getBoundingClientRect();

  // If total result is visible in the viewport, turn arrow up and hide top total
  if (rect.top < window.innerHeight) {
    btn.classList.add("up");
    btn.title = "Go to Top";
    topResult.classList.add("hidden");
  } else {
    btn.classList.remove("up");
    btn.title = "Go to Bottom";
    topResult.classList.remove("hidden");
  }
};

// Initialize with empty calculation
window.onload = () => {
  calculate();
};
