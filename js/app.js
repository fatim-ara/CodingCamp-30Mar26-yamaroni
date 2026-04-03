/**
 * Personal Finance Tracker — js/app.js
 *
 * Architecture: state → render cycle
 *   User action → mutate transactions[] → saveToStorage() → render()
 *
 * External dependency: Chart.js (loaded via CDN in index.html)
 */

// ============================================================
// Task 3.1 — State & Storage Key
// ============================================================

/** In-memory list of all transactions. Single source of truth. */
let transactions = [];

/** localStorage key used to persist the transactions array. */
const STORAGE_KEY = "pft_transactions";

/** Holds the active Chart.js instance so we can destroy it before re-creating. */
let chartInstance = null;

// ============================================================
// Task 3.2 — loadFromStorage()
// ============================================================

/**
 * Reads the transactions array from localStorage and parses it.
 * On any error (storage unavailable, invalid JSON, etc.) the
 * in-memory state is reset to an empty array and the warning
 * banner is shown.
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    transactions = raw ? JSON.parse(raw) : [];
  } catch (err) {
    // Storage unavailable or JSON parse failure
    transactions = [];
    showStorageWarning();
  }
}

// ============================================================
// Task 3.3 — saveToStorage()
// ============================================================

/**
 * Serializes the current transactions array to localStorage.
 * On failure (e.g. quota exceeded) the warning banner is shown
 * but the in-memory state is NOT mutated.
 */
function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    // Write failed — warn the user but keep in-memory state intact
    showStorageWarning();
  }
}

// ============================================================
// Storage warning helper
// ============================================================

/** Reveals the #storage-warning banner. */
function showStorageWarning() {
  const banner = document.getElementById("storage-warning");
  if (banner) {
    banner.hidden = false;
  }
}

// ============================================================
// Task 4.1 — validateForm()
// ============================================================

/**
 * Validates the three form fields.
 * @param {string} name     - Item name value (trimmed)
 * @param {string} amount   - Amount value (raw string from input)
 * @param {string} category - Selected category value
 * @returns {string|null}   - Error message string, or null when all valid
 */
function validateForm(name, amount, category) {
  if (!name || name.trim() === "") {
    return "Item name is required.";
  }

  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return "Amount must be a positive number.";
  }

  if (!category || category.trim() === "") {
    return "Please select a category.";
  }

  return null;
}

// ============================================================
// Task 4.2 — addTransaction()
// ============================================================

/**
 * Creates a new transaction object, appends it to the array,
 * persists to storage, and triggers a full re-render.
 * @param {string} name
 * @param {string} amount   - Raw string; will be parsed to float
 * @param {string} category
 */
function addTransaction(name, amount, category) {
  const transaction = {
    id: crypto.randomUUID(),
    name: name.trim(),
    amount: parseFloat(amount),
    category,
  };

  transactions.push(transaction);
  saveToStorage();
  render();
}

// ============================================================
// Task 4.3 — deleteTransaction()
// ============================================================

/**
 * Removes the transaction with the given id from the array,
 * persists to storage, and triggers a full re-render.
 * @param {string} id - UUID of the transaction to remove
 */
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  saveToStorage();
  render();
}

// ============================================================
// Task 5.1 — renderBalance()
// ============================================================

/**
 * Sums all transaction amounts and updates the #balance element.
 * Displays $0.00 when the transactions array is empty.
 */
function renderBalance() {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const balanceEl = document.getElementById("balance");
  if (balanceEl) {
    balanceEl.textContent = formatCurrency(total);
  }
}

// ============================================================
// Task 5.3 — renderList()
// ============================================================

/**
 * Clears and rebuilds the #transaction-list <ul> from the
 * current transactions array.
 * Shows an empty-state paragraph when there are no transactions.
 */
function renderList() {
  const list = document.getElementById("transaction-list");
  if (!list) return;

  // Clear existing content
  list.innerHTML = "";

  if (transactions.length === 0) {
    // Empty state — render as a list item so it sits inside the <ul>
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No transactions yet.";
    list.appendChild(empty);
    return;
  }

  transactions.forEach((t) => {
    const li = document.createElement("li");

    // Left side: name + meta
    const info = document.createElement("div");
    info.className = "transaction-info";

    const nameEl = document.createElement("span");
    nameEl.className = "transaction-name";
    nameEl.textContent = t.name;

    const meta = document.createElement("span");
    meta.className = "transaction-meta";
    meta.textContent = t.category;

    info.appendChild(nameEl);
    info.appendChild(meta);

    // Amount
    const amountEl = document.createElement("span");
    amountEl.className = "transaction-amount";
    amountEl.textContent = formatCurrency(t.amount);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "transaction-delete";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", `Delete ${t.name}`);
    deleteBtn.addEventListener("click", () => deleteTransaction(t.id));

    li.appendChild(info);
    li.appendChild(amountEl);
    li.appendChild(deleteBtn);

    list.appendChild(li);
  });
}

// ============================================================
// Task 5.5 — renderChart()
// ============================================================

/**
 * Category color map for the pie chart.
 */
const CATEGORY_COLORS = {
  Food: "#4f46e5",
  Transport: "#059669",
  Fun: "#f59e0b",
};

/**
 * Computes per-category spending totals and renders (or updates)
 * the Chart.js pie chart. Guards against Chart.js not being loaded.
 */
function renderChart() {
  // Guard: Chart.js may not have loaded (CDN failure)
  if (typeof Chart === "undefined") return;

  const canvas = document.getElementById("spending-chart");
  const emptyMsg = document.getElementById("chart-empty");

  if (!canvas || !emptyMsg) return;

  if (transactions.length === 0) {
    // No data — hide chart, show empty message
    canvas.hidden = true;
    emptyMsg.hidden = false;

    // Destroy any existing chart instance
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  // Compute per-category totals
  const totals = {};
  transactions.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  const labels = Object.keys(totals);
  const data = labels.map((label) => totals[label]);
  const colors = labels.map((label) => CATEGORY_COLORS[label] || "#94a3b8");

  // Show chart, hide empty message
  canvas.hidden = false;
  emptyMsg.hidden = true;

  // Destroy existing instance before creating a new one
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = new Chart(canvas, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed;
              return ` ${ctx.label}: ${formatCurrency(value)}`;
            },
          },
        },
      },
    },
  });
}

// ============================================================
// Task 5.7 — render()
// ============================================================

/**
 * Master render function. Rebuilds all dynamic UI sections
 * from the current in-memory transactions array.
 */
function render() {
  renderList();
  renderBalance();
  renderChart();
}

// ============================================================
// Task 7.1 — showFormError() / clearFormError()
// ============================================================

/**
 * Displays an inline validation error message in #form-error.
 * @param {string} msg - The error message to display
 */
function showFormError(msg) {
  const el = document.getElementById("form-error");
  if (el) el.textContent = msg;
}

/**
 * Clears any inline validation error message from #form-error.
 */
function clearFormError() {
  const el = document.getElementById("form-error");
  if (el) el.textContent = "";
}

// ============================================================
// Task 7.2 — resetForm()
// ============================================================

/**
 * Resets all fields in #transaction-form to their default state.
 */
function resetForm() {
  const form = document.getElementById("transaction-form");
  if (form) form.reset();
}

// ============================================================
// Task 7.3 — Form submit event listener
// ============================================================

/**
 * Wires the #transaction-form submit event.
 * Validates input, shows errors or adds the transaction.
 */
function initFormListener() {
  const form = document.getElementById("transaction-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("item-name").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;

    const error = validateForm(name, amount, category);

    if (error) {
      showFormError(error);
      return;
    }

    clearFormError();
    addTransaction(name, amount, category);
    resetForm();
  });
}

// ============================================================
// Utility helpers
// ============================================================

/**
 * Formats a number as a USD currency string (e.g. $12.50).
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ============================================================
// Task 8 — DOMContentLoaded bootstrap
// ============================================================

/**
 * Entry point. Runs after the DOM is fully parsed.
 * Loads persisted data, wires up event listeners, and renders.
 */
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  initFormListener();
  render();
});
