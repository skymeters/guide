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
      img.alt = "Toggle image";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "contain";
      img.style.display = "block";
      img.loading = "lazy";

      // Lazy-load from image-cache
      caches.open("image-cache").then(async cache => {
        const cachedResponse = await cache.match(`cached/${image}`);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          img.src = URL.createObjectURL(blob);
        }
      });

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
      img.alt = "Toggle image";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "contain";
      img.style.display = "block";
      img.loading = "lazy";

      // Lazy-load from image-cache
      caches.open("image-cache").then(async cache => {
        const cachedResponse = await cache.match(`cached/${image}`);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          img.src = URL.createObjectURL(blob);
        }
      });

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
      img.alt = "Toggle image";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "contain";
      img.style.display = "block";
      img.loading = "lazy";

      // Lazy-load from image-cache
      caches.open("image-cache").then(async cache => {
        const cachedResponse = await cache.match(`cached/${image}`);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          img.src = URL.createObjectURL(blob);
        }
      });

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
        img.alt = "Toggle image";
        img.style.width = "40px";
        img.style.height = "40px";
        img.style.objectFit = "contain";
        img.style.display = "block";
        img.loading = "lazy";

        // Lazy-load from image-cache
        caches.open("image-cache").then(async cache => {
          const cachedResponse = await cache.match(`cached/${cellValue}`);
          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            img.src = URL.createObjectURL(blob);
          }
        });

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
      img.alt = "Toggle image";
      img.style.width = "40px";
      img.style.height = "40px";
      img.style.objectFit = "contain";
      img.style.display = "block";
      img.loading = "lazy";

      // Lazy-load from image-cache
      caches.open("image-cache").then(async cache => {
        const cachedResponse = await cache.match(`cached/${value}`);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          img.src = URL.createObjectURL(blob);
        }
      });

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

export { Toggler, InputBox, DropDown, ReactiveTable };
