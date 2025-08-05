const state = {
  //global
  vincent: 0,
  pity: 0,
  mode: "experiment",
  rightTabMode: "",
  //experiment
  wisdom: {
    guardian: 0,
    cookie: 0,
    pot: 0,
    rift: 0,
    quantum: 0,
  },
  bonusChance: {
    guardian: 0,
    eman8: 0,
  },
  totalWisdom: 0,
  totalBonusChance: 0,
  baseChance: 0,
  baseNadeshiko: 0,
  baseXpPerRound: 0,
  //nucleus
  runsRequired: 0,
  extraRolls: {
    higherRoller: 0,
    mole: 0,
  },
  rollsPerBundle: 16.5,
  //slayers
  slayerTier: 4,
  mf: 0,
  allStatBoost: 0,
  mfBoost: 0,
  finalMf: 0,
};

Number.prototype.fixed = function (digits = 0) {
  let str = this.toFixed(digits);
  while (str.endsWith("0")) str = str.slice(0, -1);
  if (str.endsWith(".")) str = str.slice(0, -1);
  return str;
};

const hasT5 = new Set(["Zombie", "Spider", "Vampire"])
const nucleusWeightSum = 307212

const meterDataPromise = fetch("RNGMeter.json")
  .then(response => {
    if (!response.ok) throw new Error("Failed to load RNGMeter.json");
    return response.json();
  });

// global states for stateRef
const mythicguardian = {};
const eman8 = {};
const vincent = {};
const tabletype = {};
const cookieBuff = {};
const enchantingPot = {};
const riftNecklace = {};
const quantum5 = {};
const daeman = {};

const higherRoller = {};
const mole = {};

const magicFind = {};
const magicFindPerc = {};
const magicFindExtraPerc = {};
const tier = {};

//global table variables
let enchTable1 = null;
let enchTable2 = null;
let NucleusTable = null;
let SlayerTable1 = null;
let SlayerTable2 = null;
let toggles2 = null;

class Toggler {
  constructor(label1, label2, stateRef, label3 = null, description = null, image = null, onChange = null) {
    this.stateRef = stateRef;

    const outerWrapper = document.createElement("div");
    outerWrapper.style.display = "flex";
    outerWrapper.style.flexDirection = "row";
    outerWrapper.style.alignItems = "center";
    outerWrapper.style.gap = "12px";

    if (image) {
      const img = document.createElement("img");
      img.src = `./images/${image}`;
      img.alt = "Toggle image";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "contain";
      img.style.display = "block";
      outerWrapper.appendChild(img);
    }

    if (description) {
      const desc = document.createElement("div");
      desc.textContent = description;
      desc.style.color = "white";
      desc.style.fontSize = "14px";
      desc.style.textAlign = "center";
      desc.style.whiteSpace = "nowrap";
      outerWrapper.appendChild(desc);
    }

    const wrapper = document.createElement("div");
    wrapper.className = "experiment-toggle";
    this.wrapper = outerWrapper;

    const uid = Math.random().toString(36).substr(2, 6);
    const name = `toggle-${uid}`;
    this.name = name;

    // HTML structure
    let html = `
      <input type="radio" name="${name}" id="${name}-a" checked>
      <label for="${name}-a">${label1}</label>
      <input type="radio" name="${name}" id="${name}-b">
      <label for="${name}-b">${label2}</label>
    `;
    if (label3) {
      html += `
        <input type="radio" name="${name}" id="${name}-c">
        <label for="${name}-c">${label3}</label>
      `;
    }

    html += `<div class="${label3 ? 'experiment-toggle-triple-indicator' : 'experiment-toggle-indicator'}"></div>`;
    wrapper.innerHTML = html;
    outerWrapper.appendChild(wrapper);

    // Add listeners
    const inputA = wrapper.querySelector(`#${name}-a`);
    const inputB = wrapper.querySelector(`#${name}-b`);
    const inputC = label3 ? wrapper.querySelector(`#${name}-c`) : null;

    inputA.addEventListener("change", () => {
      if (inputA.checked) {
        this.stateRef.value = 0;
        this.updateIndicator();
        if (onChange) onChange();
      }
    });

    inputB.addEventListener("change", () => {
      if (inputB.checked) {
        this.stateRef.value = 1;
        this.updateIndicator();
        if (onChange) onChange();
      }
    });

    if (inputC) {
      inputC.addEventListener("change", () => {
        if (inputC.checked) {
          this.stateRef.value = 2;
          this.updateIndicator();
          if (onChange) onChange();
        }
      });
    }

    // Set default state and render indicator
    this.stateRef.value = 0;
    setTimeout(() => this.updateIndicator(), 0);
  }

  updateIndicator() {
    const labels = this.wrapper.querySelectorAll("label");
    const activeIndex = this.stateRef.value;
    const indicator = this.wrapper.querySelector(
      ".experiment-toggle-indicator, .experiment-toggle-triple-indicator"
    );

    const activeLabel = labels[activeIndex];
    if (!activeLabel || !indicator) return;

    const width = activeLabel.offsetWidth;
    const left = activeLabel.offsetLeft;

    indicator.style.width = `${width}px`;
    indicator.style.transform = `translateX(${left}px)`;
  }

  set(value) {
    const suffix = value === 1 ? "b" : value === 2 ? "c" : "a";
    const radioId = `${this.name}-${suffix}`;
    const radio = document.getElementById(radioId);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change'));
    } else {
      console.warn("Radio not found:", radioId);
    }
  }

  hide() {
    this.wrapper.style.display = "none";
  }

  show() {
    this.wrapper.style.display = "flex";
  }

  getElement() {
    return this.wrapper;
  }
}

class InputBox {
  constructor(stateRef, image = null, description = null, onInput = null) {
    this.stateRef = stateRef;

    const outerWrapper = document.createElement("div");
    outerWrapper.style.display = "flex";
    outerWrapper.style.flexDirection = "row";
    outerWrapper.style.alignItems = "center";
    outerWrapper.style.gap = "12px";

    if (image) {
      const img = document.createElement("img");
      img.src = `./images/${image}`;
      img.alt = "Input image";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "contain";
      img.style.display = "block";
      outerWrapper.appendChild(img);
    }

    if (description) {
      const desc = document.createElement("div");
      desc.textContent = description;
      desc.style.color = "white";
      desc.style.fontSize = "14px";
      desc.style.textAlign = "center";
      desc.style.whiteSpace = "nowrap";
      outerWrapper.appendChild(desc);
    }

    const wrapper = document.createElement("div");
    wrapper.className = "experiment-toggle";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.value = stateRef.value || 0;
    input.className = "toggler-input-field";

    input.style.background = "transparent";
    input.style.border = "none";
    input.style.color = "white";
    input.style.fontSize = "14px";
    input.style.textAlign = "center";
    input.style.outline = "none";
    input.style.width = "60px";
    input.style.height = "100%";

    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      if (!isNaN(v)) {
        this.stateRef.value = v;
        if (onInput) onInput(v);
      }
    });

    wrapper.appendChild(input);
    outerWrapper.appendChild(wrapper);

    this.wrapper = outerWrapper;
    this.input = input;
    this.stateRef.value = parseFloat(input.value);
  }

  set(value) {
    this.input.value = value;
    this.stateRef.value = value;
  }

  getElement() {
    return this.wrapper;
  }
}

class DropDown {
  constructor(description = null, image = null, stateRef, optionList = [], onChange = null) {
    this.stateRef = stateRef;

    const outerWrapper = document.createElement("div");
    outerWrapper.style.display = "flex";
    outerWrapper.style.flexDirection = "row";
    outerWrapper.style.alignItems = "center";
    outerWrapper.style.gap = "12px";

    if (image) {
      const img = document.createElement("img");
      img.src = `./images/${image}`;
      img.alt = "Dropdown image";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "contain";
      img.style.display = "block";
      outerWrapper.appendChild(img);
    }

    if (description) {
      const desc = document.createElement("div");
      desc.textContent = description;
      desc.style.color = "#ccc";
      desc.style.fontSize = "14px";
      desc.style.textAlign = "center";
      desc.style.whiteSpace = "nowrap";
      outerWrapper.appendChild(desc);
    }

    const select = document.createElement("select");
    select.className = "custom-dropdown";

    optionList.forEach((option, index) => {
      const opt = document.createElement("option");
      opt.value = index;
      opt.textContent = option;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      this.stateRef.value = parseInt(select.value);
      if (onChange) onChange();
    });

    outerWrapper.appendChild(select);
    this.wrapper = outerWrapper;
    this.stateRef.value = 0;
  }

  set(value) {
    const select = this.wrapper.querySelector("select.custom-dropdown");
    if (select) {
      select.value = value;
      select.dispatchEvent(new Event('change'));
    }
  }

  getElement() {
    return this.wrapper;
  }
}

class ReactiveTable {
  constructor(...headers) {
    this.table = document.createElement("table");
    this.table.style.borderCollapse = "collapse";
    this.table.style.width = "100%";
    this.table.style.marginTop = "32px";
    this.table.style.fontSize = "14px";
    this.table.style.color = "#fff";
    this.table.style.textAlign = "center";

    this.rowCount = 0;

    // Create header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
      const th = document.createElement("th");
      th.textContent = header;
      th.style.padding = "8px";
      th.style.backgroundColor = "#3660a5ff";
      th.style.border = "1px solid #1853b3ff";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    this.table.appendChild(thead);

    this.tbody = document.createElement("tbody");
    this.table.appendChild(this.tbody);
  }

  addRow(...cells) {
    const row = document.createElement("tr");
    row.style.backgroundColor = this.rowCount % 2 === 0 ? "#5776a7" : "#3660a5ff";

    cells.forEach((cellValue, i) => {
      const td = document.createElement("td");
      td.style.padding = "6px";
      td.style.border = "1px solid #1853b3ff";

      if (typeof cellValue === "string" && /\.(png|gif|jpe?g|webp)$/i.test(cellValue)) {
        const img = document.createElement("img");
        img.src = `./images/${cellValue}`;
        img.alt = cellValue;
        img.style.maxWidth = "50px";
        img.style.maxHeight = "50px";
        img.style.objectFit = "contain";
        td.appendChild(img);
      } else {
        td.textContent = cellValue;
        td.style.color = "white";
      }

      row.appendChild(td);
      if (i === 1) {
        row.id = cellValue;
      }
    });

    this.tbody.appendChild(row);
    this.rowCount++;
  }

  _fillCell(td, value, color = "white") {
    td.innerHTML = "";
    if (typeof value === "string" && /\.(png|gif|jpe?g|webp)$/i.test(value)) {
      const img = document.createElement("img");
      img.src = `./images/${value}`;
      img.alt = value;
      img.style.maxWidth = "50px";
      img.style.maxHeight = "50px";
      img.style.objectFit = "contain";
      td.appendChild(img);
    } else {
      td.textContent = value;
      td.style.color = color;
    }
  }

  editCell(x, y, value, color = "white") {
    const rows = this.table.querySelectorAll("tbody tr");
    if (y >= 0 && y < rows.length) {
      const cells = rows[y].children;
      if (x >= 0 && x < cells.length) {
        this._fillCell(cells[x], value, color);
      }
    }
  }

  editCellById(colIndex, rowId, value, color = "white") {
    const row = this.tbody.querySelector(`tr[id="${rowId}"]`);
    if (row && row.children[colIndex]) {
      this._fillCell(row.children[colIndex], value, color);
    }
  }

  editHeader(x, value) {
    const headers = this.table.querySelectorAll("thead th");
    if (x >= 0 && x < headers.length) {
      headers[x].textContent = value;
    }
  }

  hideRow(rowId) {
    const row = this.tbody.querySelector(`tr[id="${rowId}"]`);
    if (row) row.style.display = "none";
  }

  showRow(rowId) {
    const row = this.tbody.querySelector(`tr[id="${rowId}"]`);
    if (row) row.style.display = "";
  }

  getElement() {
    return this.table;
  }
}

//enchanting updating part
function guardian() {
  updateWisdom_Ench();
  updateChance_Ench();
}

function updateWisdom_Ench() {
  state.wisdom.guardian = mythicguardian.value ? 30 : 0;
  state.wisdom.cookie = cookieBuff.value ? 25 : 0;
  state.wisdom.pot = enchantingPot.value ? 20 : 0;
  state.wisdom.rift = riftNecklace.value ? 1 : 0;
  state.wisdom.quantum = quantum5.value ? 2 : 0;
  recalculateExperiment();
}

function updateChance_Ench() {
  state.bonusChance.guardian = mythicguardian.value ? 7 : 0;
  state.bonusChance.eman8 = eman8.value ? 15 : 0;
  recalculateExperiment();
}

function updateBase_Ench() {
  state.baseChance = [0.027777, 0.011111, 0.005555][tabletype.value];
  state.baseNadeshiko = [0.004, 0.002, 0.00133][tabletype.value]
  state.runsRequired = [518.75, 691.666, 1037.5][tabletype.value];
  state.baseXpPerRound = [800000, 600000, 400000][tabletype.value];
  recalculateExperiment();
}

function recalculateExperiment() {
  state.totalWisdom = 1 + Object.values(state.wisdom).reduce((a, b) => a + b, 0) / 100;
  state.totalBonusChance = 1 + Object.values(state.bonusChance).reduce((a, b) => a + b, 0) / 100;

  if (!enchTable2 || typeof enchTable2.editCell !== "function") return;

  let r = (state.runsRequired / state.totalWisdom / (1 + state.pity / 100)).fixed(2)
  let r2 = (state.baseXpPerRound * state.totalWisdom * (1 + state.pity / 100) / 830).fixed(2)
  enchTable1.editCell(0, 0, (state.baseXpPerRound * state.totalWisdom).fixed(1));
  enchTable1.editCell(1, 0, r2);

  const baseBook = (state.baseChance * state.totalBonusChance).fixed(4) + "%";
  const baseNadeshiko = (state.baseNadeshiko * state.totalBonusChance * state.vincent).fixed(4) + "%";

  enchTable2.editCell(2, 0, baseBook);
  enchTable2.editCell(4, 0, (r * 0.3).fixed(2));
  for (let i = 1; i < 10; i++) {
    enchTable2.editCell(2, i, baseBook);
    enchTable2.editCell(4, i, r);
  }
  enchTable2.editCell(2, 10, baseNadeshiko);
  enchTable2.editCell(4, 10, (r * 5 / state.vincent).fixed(2));
}

//Nucleus runs update logic
async function updateExtraRolls() {
  const meterData = await meterDataPromise;
  state.extraRolls.higherRoller = higherRoller.value ? 1 : 0;
  state.extraRolls.mole = mole.value ? 1 : 0;
  state.rollsPerBundle = (16.5 + state.extraRolls.higherRoller + state.extraRolls.mole).fixed(1)
  NucleusTable.editHeader(3, `Chance Per Bundle (${state.rollsPerBundle}R)`)

  Object.entries(meterData["Nucleus Runs"]).forEach(([name, info], index) => {
    let c = info.dye ? (0.0002 * state.vincent).fixed(4) : ((info.w / nucleusWeightSum) * 100).fixed(4)
    let b = state.rollsPerBundle
    let M = Math.round(info.xpRequired / 1000)
    let n = ((-M - 1 + Math.sqrt((M + 1) * (M + 1) + 4 * M / (b * c / 100))) / 2).fixed(2)
    NucleusTable.editCell(2, index, `${c}%`)
    NucleusTable.editCell(3, index, `${(c * state.rollsPerBundle).fixed(4)}%`)
    NucleusTable.editCell(5, index, info.dye ? Math.min(5000, n) : n)
  })
}

//Slayers update logic
const slayerWeightSum = {
  "Zombie4Main": 12327, "Zombie4Extra": 13180,
  "Zombie5Main": 14527, "Zombie5Extra": 15380,
  "Spider4Main": 12027, "Spider4Extra": 12910,
  "Spider5Main": 14043, "Spider5Extra": 14976,
  "Wolf4Main": 12327, "Wolf4Extra": 13190,
  "Vampire4Main": 164, "Vampire4Extra": 184,
  "Vampire5Main": 167, "Vampire5Extra": 187,
  "Enderman4Main": 14169, "Enderman4Extra": 15101,
  "Blaze4Main": 16254, "Blaze4Extra": 19494,
}
function meterValue() {
  if (state.rightTabMode === "Vampire") return tier.value ? 150 : 120
  else return tier.value ? 1500 : 500
}
async function updateSlayerTier(switched = false) {
  const meterData = await meterDataPromise;
  state.slayerTier = tier.value ? 5 : 4;

  if (switched) {
    const card = document.querySelector(".main-content .card");
    document.querySelectorAll("table").forEach(el => el.remove());

    SlayerTable1 = new ReactiveTable("Magic Find (Caps at 900)", "All Stats Boost % (Caps at 29%)", "Bonus Magic Find % (Caps at 30%)", "Final Magic Find");
    SlayerTable1.addRow(0, "0%", "0%", 0);
    SlayerTable2 = new ReactiveTable("", "Drop", "Requirement", "Loot Table", "Weight", "Chance", "Max Meter", "Avg Amount", "Avg Kills to Meter");

    Object.entries(meterData[state.rightTabMode]).forEach(([name, info]) => {
      SlayerTable2.addRow(info.image || `${name}.png`, name, info.r, info.table, "", "", info.xpRequired, "", "");
    });
    
    card.appendChild(SlayerTable1.getElement());
    card.appendChild(SlayerTable2.getElement());
  }

  Object.entries(meterData[state.rightTabMode]).forEach(([name, info]) => {
    const rowId = name;
    const wKey = "w" + state.slayerTier;
    const wVal = info[wKey];
    const tableKey = state.rightTabMode + state.slayerTier + info.table;
    const mf = (1 + (state.finalMf/100))
    
    if (wVal) {
      SlayerTable2.showRow(rowId);
      const baseC = wVal / slayerWeightSum[tableKey]
      const c = info.dye
        ? (wVal * state.vincent * mf)
        : baseC > 0.05 ? baseC*100 : ((baseC * mf) * 100);
      const M = (info.xpRequired / meterValue());
      const n = ((-M - 1 + Math.sqrt((M + 1) * (M + 1) + 4 * M / (c / 100))) / 2)

      SlayerTable2.editCellById(4, rowId, info.dye ? "-" : wVal);
      SlayerTable2.editCellById(5, rowId, `${c.fixed(4)}%`);
      SlayerTable2.editCellById(7, rowId, info["am"+state.slayerTier] || 1);
      n > M ? SlayerTable2.editCellById(8, rowId, M.fixed(2), "orange") : SlayerTable2.editCellById(8, rowId, n.fixed(2));
    } else {
      SlayerTable2.hideRow(rowId);
    }
  });

  if (toggles2 && typeof toggles2.set === "function") {
    if (hasT5.has(state.rightTabMode)) toggles2.show()
    else toggles2.hide()
  }
}
function updateMF() {
  magicFind.value = Math.max(0, Math.min(Math.round(magicFind.value), 900))
  magicFindPerc.value = Math.max(0, Math.min(Math.round(magicFindPerc.value), 29))
  magicFindExtraPerc.value = Math.max(0, Math.min(Math.round(magicFindExtraPerc.value), 30))
  state.mf = magicFind.value | 0;
  state.allStatBoost = magicFindPerc.value | 0;
  state.mfBoost = magicFindExtraPerc.value | 0;
  state.finalMf = Math.min((state.mf + state.mfBoost) * (1 + (state.allStatBoost + state.mfBoost) / 100), 900);
  SlayerTable1.editCell(0, 0, state.mf);
  SlayerTable1.editCell(1, 0, state.allStatBoost + "%");
  SlayerTable1.editCell(2, 0, state.mfBoost + "%");
  SlayerTable1.editCell(3, 0, state.finalMf.fixed(1));
  updateSlayerTier()
}

// vincent and daeman pity global functions
function updateVincent() {
  state.vincent = [1, 2, 3][vincent.value];
  switch (state.mode) {
    case "experiment":
      recalculateExperiment();
      return;
    case "nucleus":
      updateExtraRolls()
      return;
    case "slayer":
      updateSlayerTier();
      return;
  }
}

function pity() {
  state.pity = daeman.value;
  switch (state.mode) {
    case "experiment":
      recalculateExperiment();
      return;
    case "nucleus":
      updateExtraRolls()
      return;
    case "slayer":
      updateSlayerTier();
      return;
  }
}

// render part
function setMode(button) {
  const buttons = document.querySelectorAll(".sidebar-btn");
  buttons.forEach(btn => {
    btn.classList.remove("selected-sky", "selected-cyan", "selected-yellow", "selected-red");
  });

  const color = button.dataset.color;
  button.classList.add(`selected-${color}`);
}

const categoryPanels = {
  slayer: ["Zombie", "Spider", "Wolf", "Vampire", "Enderman", "Blaze"],
  dungeons: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "M1", "M2", "M3", "M4", "M5", "M6", "M7"],
  experiment: [], // auto mode
  nucleus: [],    // auto mode
};

function selectLeftTab(mode) {
  document.querySelectorAll("table").forEach(el => el.remove());

  const buttons = document.querySelectorAll(".sidebar-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active-sky", "active-cyan", "active-yellow", "active-red");
  });

  const selectedBtn = document.getElementById(`btn-${mode}`);
  if (selectedBtn) {
    selectedBtn.classList.add(`active-${getLeftTabColor(mode)}`);
  }

  renderCategoryButtons(mode);
}

function getLeftTabColor(mode) {
  switch (mode) {
    case "dungeons": return "sky";
    case "experiment": return "cyan";
    case "slayer": return "yellow";
    case "nucleus": return "red";
    default: return "gray";
  }
}

async function renderCategoryButtons(mode) {
  state.mode = mode
  const meterData = await meterDataPromise;
  const container = document.getElementById("right-category-container");
  const card = document.querySelector(".main-content .card");
  container.innerHTML = "";
  const toggleBar = document.getElementById("exp-toggle-bar");
  toggleBar.innerHTML = "";

  if (mode === "dungeons") {
    card.style.maxWidth = "730px";
  } else {
    card.style.maxWidth = "unset";
  }

  if (mode === "slayer") {
    const buttons = ["Zombie", "Spider", "Wolf", "Vampire", "Enderman", "Blaze"].map(name => createRightButton(name));
    buttons.forEach(btn => container.appendChild(btn));
    selectMode("Zombie")

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";

    const note = document.createElement("div");
    note.className = "greyDes"
    note.textContent = "You need to have at least 10% of xp in slayer spawning progress to start spawning Mini-Bosses!";
    wrapper.appendChild(note);

    const note2 = document.createElement("div");
    note2.className = "blueDes"
    note2.textContent = "All Stats Boost % boosts Magic Find by %, it sources from Jerry (10%), Renowned Reforge (1*4%), Superior Armor Ability (5%), Leg. Ender Dragon or Blaze Pets (10%) etc. Every 1% multiplies MF by 1%.";
    wrapper.appendChild(note2);

    const note3 = document.createElement("div");
    note3.className = "limeDes"
    note3.textContent = "Bonus MF % is the boost that specifically boosts MF: Aatrox Path Finder (20%), Shuriken (5%), Clover Helmet (5%) etc. Every 1% adds +1 MF and +1% MF.";
    wrapper.appendChild(note3);

    const note4 = document.createElement("div");
    note4.className = "pinkDes"
    note4.textContent = "If Avg Kills to Meter is ORANGE, you will meter it most of the time (metering faster than expectation value) Avg Kills to Meter is the total kills you need to go for WITH RNG Meter selected!";
    wrapper.appendChild(note4);

    document.querySelectorAll("table").forEach(el => el.remove());
    //tables
    const card = document.querySelector(".main-content .card");

    SlayerTable1 = new ReactiveTable("Magic Find (Caps at 900)", "All Stats Boost % (Caps at 29%)", "Bonus Magic Find % (Caps at 30%)", "Final Magic Find");
    SlayerTable1.addRow(0, "0%", "0%", 0);
    SlayerTable2 = new ReactiveTable("", "Drop", "Requirement", "Loot Table", "Weight", "Chance", "Max Meter", "Avg Amount", "Avg Kills to Meter");

    Object.entries(meterData[state.rightTabMode]).forEach(([name, info]) => {
      SlayerTable2.addRow(info.image || `${name}.png`, name, info.r, info.table, "", "", info.xpRequired, "", "");
    });

    //toggler
    const toggleBars = document.createElement("div");
    toggleBars.className = "experiment-toggle-container";

    const toggles1 = new Toggler("⊘", "2x", vincent, "3x", "Vincent", "vincent.png", updateVincent);
    const box1 = new InputBox(magicFind, "magic_find.png", "Magic Find", updateMF);
    const box2 = new InputBox(magicFindPerc, "magic_find.png", "All Stats Boost %", updateMF);
    const box3 = new InputBox(magicFindExtraPerc, "magic_find.png", "Bonus MF %", updateMF);
    toggles2 = new Toggler("Tier 4", "Tier 5", tier, null, "Slayer Tier", "stone_sword.png", updateSlayerTier);

    const toggleRows = document.createElement("div");
    toggleRows.style.display = "flex";
    toggleRows.style.flexDirection = "row";
    toggleRows.style.gap = "24px"
    toggleRows.style.alignItems = "center";

    const gap = document.createElement("div");
    gap.className = "gap";
    wrapper.appendChild(gap)

    toggleRows.appendChild(toggles1.getElement());
    toggleRows.appendChild(box1.getElement());
    toggleRows.appendChild(box2.getElement());
    toggleRows.appendChild(box3.getElement());
    if (hasT5.has(state.rightTabMode)) toggleRows.appendChild(toggles2.getElement());
    toggleBars.appendChild(toggleRows);
    wrapper.appendChild(toggleBars)
    container.appendChild(wrapper);

    card.appendChild(SlayerTable1.getElement());
    card.appendChild(SlayerTable2.getElement());
    
    //defaults
    updateVincent();
    updateSlayerTier();
  } else if (mode === "dungeons") {
    const buttons = [];
    const floors = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "M1", "M2", "M3", "M4", "M5", "M6", "M7"];
    floors.forEach(f => {
      const btn = createRightButton(f);
      btn.classList.add("dungeon-button");
      buttons.push(btn);
    });
    buttons.forEach(btn => container.appendChild(btn));

    const wrapper = document.createElement("div");
    const note = document.createElement("div");
    note.textContent = "Coming soon in 3-5 business days!";
    note.style.color = "magenta";
    note.style.fontSize = "50px";
    note.style.marginTop = "20px";
    note.style.textAlign = "center";
    wrapper.appendChild(note);
    container.appendChild(wrapper);

  } else if (mode === "experiment" || mode === "nucleus") {
    const name = mode === "experiment" ? "Experiment" : "Nucleus Runs";
    const btn = createRightButton(name);
    btn.classList.add("selected-gold");
    btn.disabled = true;

    if (mode === "experiment") {
      //button wrappers
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.alignItems = "center";
      wrapper.appendChild(btn);

      const note = document.createElement("div");
      note.className = "greyDes"
      note.textContent = "Titanic Bottle, Experiment the Fish, Metaphysical Serums, and Rare Tier Books are excluded because wiki and in-game meter data are too inconsistent.";
      wrapper.appendChild(note);

      const note2 = document.createElement("div");
      note2.className = "pinkDes"
      note2.textContent = "You get 1 Meter XP every ~830 Enchanting XP, after multiplied by wisdom. Because meter number is way LOWER than the actual meter xp it should've been, this page will only show the estimated rounds of experiments to meter an item.";

      wrapper.appendChild(note2);
      container.appendChild(wrapper);

      //toggler
      const toggleBar = document.createElement("div");
      toggleBar.className = "experiment-toggle-container";

      const toggle1 = new Toggler("⊘", "Equipped", mythicguardian, null, "MYTHIC Lv.100 Guardian", "guardian.png", guardian);
      const toggle2 = new Toggler("⊘", "Yes", eman8, null, "Enderman Slayer Lv.8", "ender_pearl.png", updateChance_Ench);
      const toggle3 = new Toggler("⊘", "2x", vincent, "3x", "Vincent", "vincent.png", updateVincent);

      const toggleRow = document.createElement("div");
      toggleRow.style.display = "flex";
      toggleRow.style.flexDirection = "row";
      toggleRow.style.gap = "24px"; // spacing between toggler sets
      toggleRow.style.alignItems = "center";

      toggleRow.appendChild(toggle1.getElement());
      toggleRow.appendChild(toggle2.getElement());
      toggleRow.appendChild(toggle3.getElement());
      toggleBar.appendChild(toggleRow);
      container.appendChild(toggleBar);

      const toggle4 = new Toggler("Metaphysical", "Transcendent", tabletype, "Supreme", "Experiment Tier (Lv.50/Lv.40/Lv.30)", "pink_dye.png", updateBase_Ench);
      container.appendChild(toggle4.getElement());

      const wisdomOptionsBox = document.createElement("div");
      wisdomOptionsBox.className = "experiment-wisdom-options-container";

      const toggle5 = new Toggler("⊘", "Yes", cookieBuff, null, "Cookie Buff", "enchanted_cookie.gif", updateWisdom_Ench);
      const toggle6 = new Toggler("⊘", "Yes", enchantingPot, null, "Ench Pot (God Pot)", "potion_of_water_breathing.gif", updateWisdom_Ench);
      const toggle7 = new Toggler("⊘", "Lv.7+", riftNecklace, null, "Rift Necklace", "rift_necklace.png", updateWisdom_Ench);

      const wisdomOptions = document.createElement("div");
      wisdomOptions.style.display = "flex";
      wisdomOptions.style.flexDirection = "row";
      wisdomOptions.style.gap = "24px"; // spacing between toggler sets
      wisdomOptions.style.alignItems = "center";
      wisdomOptions.appendChild(toggle5.getElement());
      wisdomOptions.appendChild(toggle6.getElement());
      wisdomOptions.appendChild(toggle7.getElement());
      wisdomOptionsBox.appendChild(wisdomOptions);
      container.appendChild(wisdomOptionsBox);

      const toggle8 = new Toggler("⊘", "+2", quantum5, null, "Quantum V weekend wisdom", "wisdom.png", updateWisdom_Ench);
      const dropdown1 = new DropDown("Daeman Attribute", "shard_daemon.png", daeman, [...Array(11).keys()], pity);
      const wisdomOptionsBox2 = document.createElement("div");
      wisdomOptionsBox2.className = "experiment-wisdom-options-container2";
      const wisdomOptions2 = document.createElement("div");
      wisdomOptions2.style.display = "flex";
      wisdomOptions2.style.flexDirection = "row";
      wisdomOptions2.style.gap = "24px"; // spacing between toggler sets
      wisdomOptions2.style.alignItems = "center";
      wisdomOptions2.appendChild(toggle8.getElement());
      wisdomOptions2.appendChild(dropdown1.getElement());
      wisdomOptionsBox2.appendChild(wisdomOptions2);
      container.appendChild(wisdomOptionsBox2);

      // Add Max Wisdom and Max Daeman buttons
      const controlButtonRow = document.createElement("div");
      controlButtonRow.style.display = "flex";
      controlButtonRow.style.justifyContent = "center";
      controlButtonRow.style.gap = "20px";
      controlButtonRow.style.marginTop = "10px";

      const btnMaxWisdom = document.createElement("button");
      btnMaxWisdom.textContent = "Max Wisdom";
      btnMaxWisdom.className = "right-button";
      btnMaxWisdom.onclick = () => {
        toggle1.set(1);
        toggle2.set(1);
        toggle5.set(1);
        toggle6.set(1);
        toggle7.set(1);
        toggle8.set(1);
      };

      const btnMaxDaeman = document.createElement("button");
      btnMaxDaeman.textContent = "Max Daeman";
      btnMaxDaeman.className = "right-button";
      btnMaxDaeman.onclick = () => {
        daeman.value = 10;
        if (dropdown1 && typeof dropdown1.set === "function") {
          dropdown1.set(10);
        }
      };

      controlButtonRow.appendChild(btnMaxWisdom);
      controlButtonRow.appendChild(btnMaxDaeman);
      container.appendChild(controlButtonRow);

      //defaults
      updateVincent();
      updateBase_Ench();
      //tables
      const card = document.querySelector(".main-content .card");
      enchTable1 = new ReactiveTable("Avg Ench XP per round", "Avg Meter XP per round");
      card.appendChild(enchTable1.getElement());
      let r = (state.runsRequired / state.totalWisdom / (1 + state.pity / 100)).fixed(2)
      let r2 = (state.baseXpPerRound * state.totalWisdom * (1 + state.pity / 100) / 830).fixed(2)
      enchTable1.addRow((state.baseXpPerRound * state.totalWisdom).fixed(1), r2)

      enchTable2 = new ReactiveTable("", "Drop", "Chance", "Max Meter", "Avg Rounds to Meter");
      card.appendChild(enchTable2.getElement());

      let baseBook = (state.baseChance * state.totalBonusChance).fixed(4)
      let dye = (state.baseNadeshiko * state.totalBonusChance * state.vincent).fixed(4)
      Object.entries(meterData.Experiment).forEach(([name, info]) => {
        enchTable2.addRow(info.image || `${name}.png`, name, `${info.dye ? dye : baseBook}%`, info.xpRequired, info.f ? (r * info.f).fixed(2) : r);
      });
    } else {
      //button wrappers
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.alignItems = "center";
      wrapper.appendChild(btn);

      const note = document.createElement("div");
      note.className = "greyDes"
      note.textContent = "Anything that's not in in-game Crystal Nucleus RNG Meter is automatically ignored in this page.";
      wrapper.appendChild(note);

      //tables
      const card = document.querySelector(".main-content .card");
      NucleusTable = new ReactiveTable("", "Drop", "Chance Per Roll", `Chance Per Bundle (${state.rollsPerBundle}R)`, "Max Meter", "Avg Runs to Meter");

      Object.entries(meterData["Nucleus Runs"]).forEach(([name, info]) => {
        c = info.dye ? (0.0002 * state.vincent).fixed(4) : ((info.w / nucleusWeightSum) * 100).fixed(4)
        NucleusTable.addRow(info.image || `${name}.png`, name, `${c}%`, `${(c * state.rollsPerBundle).fixed(4)}%`, info.xpRequired, "N/A");
      });

      //toggler
      const toggleBarNu = document.createElement("div");
      toggleBarNu.className = "experiment-toggle-container";

      const toggleNu1 = new Toggler("⊘", "2x", vincent, "3x", "Vincent", "vincent.png", updateVincent);
      const toggleNu2 = new Toggler("⊘", "Unlocked", higherRoller, null, "Higher Roller", "compass.png", updateExtraRolls);
      const toggleNu3 = new Toggler("⊘", "Equipped", mole, null, "Mole Pet", "mole.png", updateExtraRolls);

      const toggleRowNu = document.createElement("div");
      toggleRowNu.style.display = "flex";
      toggleRowNu.style.flexDirection = "row";
      toggleRowNu.style.gap = "24px"
      toggleRowNu.style.alignItems = "center";

      const gap = document.createElement("div");
      gap.className = "gap";
      wrapper.appendChild(gap)

      toggleRowNu.appendChild(toggleNu1.getElement());
      toggleRowNu.appendChild(toggleNu2.getElement());
      toggleRowNu.appendChild(toggleNu3.getElement());
      toggleBarNu.appendChild(toggleRowNu);
      wrapper.appendChild(toggleBarNu)
      container.appendChild(wrapper);

      card.appendChild(NucleusTable.getElement());

      //defaults
      updateExtraRolls();
    }
  }
}

function createRightButton(text) {
  const button = document.createElement("button");
  button.className = "right-button";
  button.textContent = text;
  button.addEventListener("click", () => {
    document.querySelectorAll(".right-button").forEach(btn => {
      btn.classList.remove("selected-gold");
    });
    button.classList.add("selected-gold");
    selectMode(text);
  });
  return button;
}

function selectMode(mode) {
  state.rightTabMode = mode;
  document.querySelectorAll(".right-button").forEach(btn => {
    btn.classList.remove("selected-gold");
  });
  const match = Array.from(document.querySelectorAll(".right-button")).find(btn => btn.textContent === mode);
  if (match) {
    match.classList.add("selected-gold");
  }
  switch(state.mode) {
    case "slayer":
      updateSlayerTier(true);
      return;
  }
}

function getModeColor(mode) {
  switch (mode) {
    case "slayer": return "sky";
    case "dungeons": return "cyan";
    default: return "yellow";
  }
}

function formatModeName(mode) {
  switch (mode) {
    case "nucleus": return "Nucleus Runs";
    case "experiment": return "Experimentation";
    default: return mode.charAt(0).toUpperCase() + mode.slice(1);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  selectLeftTab('experiment');
});
