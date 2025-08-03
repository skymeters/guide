const state = {
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
  vincent: 0,
  pity: 0,
  baseChance: 0,
  baseNadeshiko: 0,
  baseXpPerRound: 0,
  runsRequired: 0,
};

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

//global table variables
let enchTable1 = null;
let enchTable2 = null;

class Toggler {
  constructor(label1, label2, stateRef, label3 = null, description = null, image = null, imageScaler = 1, onChange = null) {
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
      img.style.width = `${100 * imageScaler}px`;
      img.style.height = "auto";
      img.style.objectFit = "contain";
      outerWrapper.appendChild(img);
      img.style.display = "block";
      img.style.margin = "0 auto";
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

  getElement() {
    return this.wrapper;
  }
}

class DropDown {
  constructor(description = null, image = null, imageScaler = 1, stateRef, optionList = [], onChange = null) {
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
      img.style.width = `${100 * imageScaler}px`;
      img.style.height = "auto";
      img.style.objectFit = "contain";
      img.style.display = "block";
      img.style.margin = "0 auto";
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

    cells.forEach(cellValue => {
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
    });

    this.tbody.appendChild(row);
    this.rowCount++;
  }

  _fillCell(td, value) {
    td.innerHTML = ""; // clear previous content
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
      td.style.color = "white";
    }
  }

  editCell(x, y, value) {
    const rows = this.table.querySelectorAll("tbody tr");
    if (y >= 0 && y < rows.length) {
      const cells = rows[y].children;
      if (x >= 0 && x < cells.length) {
        this._fillCell(cells[x], value);
      }
    }
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
  state.totalWisdom = 1 + Object.values(state.wisdom).reduce((a, b) => a + b, 0)/100;
  state.totalBonusChance = 1 + Object.values(state.bonusChance).reduce((a, b) => a + b, 0)/100;
  
  if (!enchTable2 || typeof enchTable2.editCell !== "function") return;

  let r = (state.runsRequired/state.totalWisdom/(1 + state.pity/100)).toFixed(2)
  let r2 = (state.baseXpPerRound*state.totalWisdom*(1 + state.pity/100)/830).toFixed(2)
  enchTable1.editCell(0, 0, (state.baseXpPerRound*state.totalWisdom).toFixed(1));
  enchTable1.editCell(1, 0, r2);

  const baseBook = (state.baseChance * state.totalBonusChance).toFixed(4) + "%";
  const baseNadeshiko = (state.baseNadeshiko * state.totalBonusChance * state.vincent).toFixed(4) + "%";
  
  enchTable2.editCell(2, 0, baseBook);
  enchTable2.editCell(4, 0, (r*0.3).toFixed(2));
  for (let i = 1; i < 10; i++) {
    enchTable2.editCell(2, i, baseBook);
    enchTable2.editCell(4, i, r);
  }
  enchTable2.editCell(2, 10, baseNadeshiko);
  enchTable2.editCell(4, 10, (r*5/state.vincent).toFixed(2));
}

// vincent and daeman pity global functions
function updateVincent() {
  state.vincent = [1, 2, 3][vincent.value];
  recalculateExperiment();
}

function pity() {
  state.pity = daeman.value;
  recalculateExperiment();
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

function renderCategoryButtons(mode) {
  const container = document.getElementById("right-category-container");
  const card = document.querySelector(".main-content .card");
  container.innerHTML = "";
  const toggleBar = document.getElementById("exp-toggle-bar");
  toggleBar.innerHTML = "";

  const screenW = window.innerWidth;

  if (screenW < 580) {
    card.style.maxWidth = "95vw";
  } else {
    if (mode === "dungeons") {
      card.style.maxWidth = "730px";
    } else if (mode === "slayer") {
      card.style.maxWidth = "970px";
    } else if (mode === "nucleus") {
      card.style.maxWidth = "350px";
    } else {
      card.style.maxWidth = "unset";
    }
  }

  if (mode === "slayer") {
    const buttons = ["Zombie", "Spider", "Wolf", "Vampire", "Enderman", "Blaze"].map(name => createRightButton(name));
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
      note2.textContent = "You get 1 Meter XP every ~830 Enchanting XP, after multiplied by wisdom. Because meter number is way LOWER than the actual xp required, this page will only show the estimated rounds of experiments to meter an item.";

      wrapper.appendChild(note2);
      container.appendChild(wrapper);

      //toggler
      const toggleBar = document.createElement("div");
      toggleBar.className = "experiment-toggle-container";

      const toggle1 = new Toggler("⊘", "Equipped", mythicguardian, null, "MYTHIC Lv.100 Guardian", "guardian.png", 0.5, guardian);
      const toggle2 = new Toggler("⊘", "Yes", eman8, null, "Enderman Slayer Lv.8", "ender_pearl.png", 0.5, updateChance_Ench);
      const toggle3 = new Toggler("⊘", "2x", vincent, "3x", "Vincent", "vincent.png", 0.4, updateVincent);

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

      const toggle4 = new Toggler("Metaphysical", "Transcendent", tabletype, "Supreme", "Experiment Tier (Lv.50/Lv.40/Lv.30)", "pink_dye.png", 0.4, updateBase_Ench);
      container.appendChild(toggle4.getElement());

      const wisdomOptionsBox = document.createElement("div");
      wisdomOptionsBox.className = "experiment-wisdom-options-container";

      const toggle5 = new Toggler("⊘", "Yes", cookieBuff, null, "Cookie Buff", "enchanted_cookie.gif", 0.5, updateWisdom_Ench);
      const toggle6 = new Toggler("⊘", "Yes", enchantingPot, null, "Ench Pot (God Pot)", "potion_of_water_breathing.gif", 0.5, updateWisdom_Ench);
      const toggle7 = new Toggler("⊘", "Lv.7+", riftNecklace, null, "Rift Necklace", "rift_necklace.png", 0.35, updateWisdom_Ench);

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

      const toggle8 = new Toggler("⊘", "+2", quantum5, null, "Quantum V weekend wisdom", "wisdom.png", 0.4, updateWisdom_Ench);
      const dropdown1 = new DropDown("Daeman Attribute", "shard_daemon.png", 0.4, daeman, [...Array(11).keys()], pity);
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
      const card = document.querySelector(".main-content .card");

      //table1
      enchTable1 = new ReactiveTable("Avg Ench XP per round", "Avg Meter XP per round");
      card.appendChild(enchTable1.getElement());
      let r = (state.runsRequired/state.totalWisdom/(1 + state.pity/100)).toFixed(2)
      let r2 = (state.baseXpPerRound*state.totalWisdom*(1 + state.pity/100)/830).toFixed(2)
      enchTable1.addRow((state.baseXpPerRound*state.totalWisdom).toFixed(1), r2)

      //table2
      enchTable2 = new ReactiveTable("", "Drop", "Chance", "Max Meter", "Avg Rounds to Meter", "Insta Sell", "Sell Offer");
      card.appendChild(enchTable2.getElement());

      let baseBook = (state.baseChance*state.totalBonusChance).toFixed(4)
      let baseNadeshiko = (state.baseNadeshiko*state.totalBonusChance*state.vincent).toFixed(4)
      enchTable2.addRow("guardian.png", "Leg Guardian Pet", `${baseBook}%`, 150000, (r*0.3).toFixed(2), 0, 0)
      enchTable2.addRow("golden_bounty.png", "Golden Bounty", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("pesthunting_guide.png", "A Beginner's Guide To Pesthunting", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("ensnared_snail.png", "Ensnared Snail", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("severed_pincer.png", "Severed Pincer", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("gold_bottle_cap.png", "Gold Bottle Cap", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("chain_end_times.png", "Chain of the End Times", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("octopus_tendril.png", "Octopus Tendril", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("troubled_bubble.png", "Troubled Bubble", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("enchanted_book.gif", "All Other T7 Books", `${baseBook}%`, 500000, r, 0, 0)
      enchTable2.addRow("nadeshiko.png", "Nadeshiko Dye", `${baseNadeshiko}%`, 2500000, (r*5).toFixed(2), 0, 0)
    } else {
      container.appendChild(btn); // for nucleus
      
      const wrapper = document.createElement("div");
      const note = document.createElement("div");
      note.textContent = "Coming soon in 3-5 business days!";
      note.style.color = "magenta";
      note.style.fontSize = "50px";
      note.style.marginTop = "20px";
      note.style.textAlign = "center";
      wrapper.appendChild(note);
      container.appendChild(wrapper);
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
  });
  return button;
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

// @media
function setupSidebarToggle() {
  if (window.innerWidth <= 768) {
    const btn = document.createElement("button");
    btn.className = "sidebar-toggle-btn";
    btn.innerText = "☰";
    btn.onclick = () => {
      document.querySelector(".sidebar").classList.toggle("open");
    };
    document.body.appendChild(btn);
  }
}

window.addEventListener("DOMContentLoaded", setupSidebarToggle);

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const body = document.body;
  sidebar.classList.toggle("open");
  body.classList.toggle("sidebar-hidden"); 

  setTimeout(() => window.dispatchEvent(new Event("resize")), 200);
}


let touchStartX = 0;

document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].screenX;
  const diff = touchEndX - touchStartX;

  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  if (diff > 50) {
    sidebar.classList.add("open");
  } else if (diff < -50) {
    sidebar.classList.remove("open");
  }
});

document.body.classList.add("sidebar-hidden");
