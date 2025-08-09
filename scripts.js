import {Toggler, InputBox, DropDown, ReactiveTable} from "./classes.js"

async function preloadImagesWithCache() {
  const cache = await caches.open("image-cache");
  const versionRes = await fetch("https://app-d983.onrender.com/api/img_diff");
  const { version } = await versionRes.json();

  const cachedVersion = localStorage.getItem("image_version");
  const shouldReload = cachedVersion !== version;

  if (shouldReload) {
    const res = await fetch("https://app-d983.onrender.com/api/Images");
    const images = await res.json();

    for (const [filename, base64] of Object.entries(images)) {
      const blob = await (await fetch(`data:image/${filename.split('.').pop()};base64,${base64}`)).blob();
      const response = new Response(blob, { status: 200, statusText: "OK" });
      const url = `cached/${filename}`;
      await cache.put(url, response);
    }

    localStorage.setItem("image_version", version);
  }
}

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
const hasDye = new Set(["M5", "M7"])
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

const rating = {};
const kismet = {};

//global table variables
let enchTable1 = null;
let enchTable2 = null;
let NucleusTable = null;
let SlayerTable1 = null;
let SlayerTable2 = null;
let toggles2 = null;
let toggled1 = null;
let DungeonsTable = null;

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
      const baseC = wVal / meterData.slayerWeightSum[tableKey]
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

//dungeons
async function updateDungeons(switched = false) {
  const meterData = await meterDataPromise;
  
  if (switched) {
    const card = document.querySelector(".main-content .card");
    document.querySelectorAll("table").forEach(el => el.remove());

    DungeonsTable = new ReactiveTable("", "Drop", "Open Price", "Highest Tier Chest", "Weight", "Max Meter", "S Chance", "S+ Chance", "Avg Runs to Meter");

    Object.entries(meterData[state.rightTabMode]).forEach(([name, info]) => {
      DungeonsTable.addRow(info.image || `${name}.png`, name, info.table, "", info.xpRequired, "", "", "", "");
    });
    
    card.appendChild(DungeonsTable.getElement());
  }

  Object.entries(meterData[state.rightTabMode]).forEach(([name, info]) => {
  });
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
    case "dungeons":
      updateDungeons();
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
    case "dungeons":
      updateDungeons();
      return;
  }
}

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

  card.style.maxWidth = "unset";

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
    const dungeonWrapper = document.createElement("div");
    dungeonWrapper.classList.add("dungeon-wrapper");

    ["F", "M"].forEach(t => {
      const buttons = [];
      for(let i = 1;i<=7;i++) {
        const btn = createRightButton(t+i);
    btn.classList.add("dungeon-button", "right-button");
        buttons.push(btn);
      }
      buttons.forEach(btn => dungeonWrapper.appendChild(btn));
    });
    
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";

    const note = document.createElement("div");
    note.className = "pinkDes"
    note.textContent = "RNG Meter adds score*70% xp with S, and full score as xp with S+";
    wrapper.appendChild(note);
    
    const note2 = document.createElement("div");
    note2.className = "pinkDes"
    note2.textContent = "Despite some items can appear in multiple chests, RNG Meter only buffs the HIGHEST tier chest an item can be in!";
    wrapper.appendChild(note2);

    //toggler
    const toggleBars = document.createElement("div");
    toggleBars.className = "experiment-toggle-container";

    toggled1 = new Toggler("⊘", "2x", vincent, "3x", "Vincent", "vincent.png", updateVincent);
    const toggled2 = new Toggler("S", "S+", rating, null, "Rating", "dungeoneering.png", updateDungeons);
    const toggled3 = new Toggler("⊘", "Yes", kismet, null, "Use Kismet Every Runs", "enchanted_feather.gif", updateDungeons);

    const toggleRows = document.createElement("div");
    toggleRows.style.display = "flex";
    toggleRows.style.flexDirection = "row";
    toggleRows.style.gap = "24px"
    toggleRows.style.alignItems = "center";

    const gap = document.createElement("div");
    gap.className = "gap";
    wrapper.appendChild(gap)

    if (hasDye.has(state.rightTabMode)) toggleRows.appendChild(toggled1.getElement());
    toggleRows.appendChild(toggled2.getElement());
    toggleRows.appendChild(toggled3.getElement());
    toggleBars.appendChild(toggleRows);
    wrapper.appendChild(toggleBars)
    container.appendChild(dungeonWrapper);
    container.appendChild(wrapper);
    selectMode("M7")

    const card = document.querySelector(".main-content .card");
    DungeonsTable = new ReactiveTable("", "Drop", "Open Price", "Highest Tier Chest", "Weight", "Max Meter", "S Chance", "S+ Chance", "Avg Runs to Meter");

    Object.entries(meterData[state.rightTabMode]).forEach(([name, info]) => {
      DungeonsTable.addRow(info.image || `${name}.png`, name, info.table, "", info.xpRequired, "", "", "", "");
    });
    
    card.appendChild(DungeonsTable.getElement());

    //defaults
    updateVincent();
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
        let c = info.dye ? (0.0002 * state.vincent).fixed(4) : ((info.w / nucleusWeightSum) * 100).fixed(4)
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
    case "dungeons":
      updateDungeons(true);
      return;
  }
}

async function startApiWakeLoop(url = "https://app-d983.onrender.com/hz") {
  document.body.classList.add("api-wait-active");
  try {
    await waitUntilOk(url);
  } finally {
    document.body.classList.remove("api-wait-active");
  }
}

async function waitUntilOk(url) {
  while (true) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(timer);
      if (res.ok) return true;
    } catch (_) { }
    await new Promise(r => setTimeout(r, 1000));
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.selectLeftTab = selectLeftTab;
  selectLeftTab("experiment");
  (async () => {
    const RELOAD_FLAG = "preloadRetryDone";
    const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
    startApiWakeLoop().catch(err => console.error("startApiWakeLoop error:", err));

    let cancelWatchdog = () => {};
    if (!alreadyReloaded) {
      const t = setTimeout(() => {
        sessionStorage.setItem(RELOAD_FLAG, "1");
        window.location.reload();
      }, 5000);
      cancelWatchdog = () => clearTimeout(t);
    }
    try {
      await preloadImagesWithCache();
      cancelWatchdog();
    } catch (err) {
      cancelWatchdog();
      if (!alreadyReloaded) {
        sessionStorage.setItem(RELOAD_FLAG, "1");
        window.location.reload();
        return;
      } else {
        console.error("preloadImagesWithCache failed after retry:", err);
      }
    }
  })()
});

function handleViewportLock() {
  const isPortrait = window.innerWidth < window.innerHeight;
  document.body.classList.toggle("portrait-active", isPortrait);
}

window.addEventListener("resize", handleViewportLock);
window.addEventListener("orientationchange", handleViewportLock);
document.addEventListener("DOMContentLoaded", handleViewportLock);






