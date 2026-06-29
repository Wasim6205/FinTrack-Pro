let currentUser = null;
let transactions = [];
let darkMode = false;
let currencyCode = "USD"; // by default

const $ = (id) => document.getElementById(id);
const authContainer = $("authContainer");
const app = $("app");
const loginForm = $("loginForm");
const signupForm = $("signupForm");
const authLoginTab = $("authLoginTab");
const authSignupTab = $("authSignupTab");
const loginEmail = $("loginEmail");
const loginPassword = $("loginPassword");
const signupName = $("signupName");
const signupEmail = $("signupEmail");
const signupPassword = $("signupPassword");
const logoutBtn = $("logoutBtn");
const userGreeting = $("userGreeting");
const displayBalance = $("displayBalance");
const displayIncome = $("displayIncome");
const displayExpense = $("displayExpense");
const displayCount = $("displayCount");
const transactionsBody = $("transactionsBody");
const emptyTransactions = $("emptyTransactions");
const searchInput = $("searchInput");
const filterType = $("filterType");
const addTransactionBtn = $("addTransactionBtn");
const modal = $("transactionModal");
const closeModalBtn = $("closeModalBtn");
const transactionForm = $("transactionForm");
const txnDescription = $("txnDescription");
const txnAmount = $("txnAmount");
const txnDate = $("txnDate");
const txnCategory = $("txnCategory");
const darkModeToggle = $("darkModeToggle");
const resetDataBtn = $("resetDataBtn");
const chartBars = $("chartBars");
const tabDashboard = $("tabDashboard");
const tabSettings = $("tabSettings");
const currencySelect = $("currencySelect");


function getCurrencySymbol(code) {
  const map = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    JPY: "¥",
  };
  return map[code] || "$";
}

function formatCurrency(amount, code = currencyCode) {
  const symbol = getCurrencySymbol(code);
  try {
    const formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch {
    return symbol + Number(amount).toFixed(2);
  }
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getCategoryColor(cat) {
  const colors = {
    "Food & Dining": "#f59e0b",
    Transportation: "#3b82f6",
    Shopping: "#ec4899",
    Entertainment: "#8b5cf6",
    "Bills & Utilities": "#ef4444",
    Healthcare: "#14b8a6",
    Education: "#06b6d4",
    Salary: "#22c55e",
    Investment: "#6366f1",
    Other: "#6b7280",
  };
  return colors[cat] || "#6b7280";
}

//  Local Storage

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem("fintrack_users")) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem("fintrack_users", JSON.stringify(users));
}

function loadTransactionsForUser(email) {
  try {
    const all = JSON.parse(localStorage.getItem("fintrack_transactions")) || {};
    return all[email] || [];
  } catch {
    return [];
  }
}

function saveTransactionsForUser(email, data) {
  const all = JSON.parse(localStorage.getItem("fintrack_transactions")) || "{}";
  const parsed = typeof all === "string" ? JSON.parse(all) : all;
  parsed[email] = data;
  localStorage.setItem("fintrack_transactions", JSON.stringify(parsed));
}

function loadCurrencyForUser(email) {
  try {
    const all = JSON.parse(localStorage.getItem("fintrack_currencies")) || {};
    return all[email] || "USD";
  } catch {
    return "USD";
  }
}

function saveCurrencyForUser(email, code) {
  const all = JSON.parse(localStorage.getItem("fintrack_currencies")) || "{}";
  const parsed = typeof all === "string" ? JSON.parse(all) : all;
  parsed[email] = code;
  localStorage.setItem("fintrack_currencies", JSON.stringify(parsed));
}

function loadDarkMode() {
  return localStorage.getItem("fintrack_dark") === "true";
}

function saveDarkMode(val) {
  localStorage.setItem("fintrack_dark", String(val));
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem("fintrack_session"));
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem("fintrack_session", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("fintrack_session");
}


function showAuth() {
  authContainer.classList.remove("hidden");
  app.classList.add("hidden");
}

function showApp() {
  authContainer.classList.add("hidden");
  app.classList.remove("hidden");
}

function switchAuthTab(tab) {
  if (tab === "login") {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    authLoginTab.className =
      "flex-1 py-2.5 text-sm font-semibold bg-indigo-500 text-white transition";
    authSignupTab.className =
      "flex-1 py-2.5 text-sm font-semibold bg-[var(--bg-primary)] text-[var(--text-secondary)] transition";
  } else {
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
    authSignupTab.className =
      "flex-1 py-2.5 text-sm font-semibold bg-indigo-500 text-white transition";
    authLoginTab.className =
      "flex-1 py-2.5 text-sm font-semibold bg-[var(--bg-primary)] text-[var(--text-secondary)] transition";
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please enter email and password.",
    });
    return;
  }
  const users = loadUsers();
  if (!users[email] || users[email].password !== password) {
    Swal.fire({
      icon: "error",
      title: "Invalid Credentials",
      text: "Email or password is incorrect.",
    });
    return;
  }
  currentUser = { email, name: users[email].name };
  saveSession(currentUser);
  initApp();
  Swal.fire({
    icon: "success",
    title: "Welcome back!",
    text: `Hello, ${currentUser.name}`,
    timer: 1500,
    showConfirmButton: false,
  });
}

function handleSignup(e) {
  e.preventDefault();
  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  if (!name || !email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill in all fields.",
    });
    return;
  }
  if (password.length < 6) {
    Swal.fire({
      icon: "warning",
      title: "Weak Password",
      text: "Password must be at least 6 characters.",
    });
    return;
  }
  const users = loadUsers();
  if (users[email]) {
    Swal.fire({
      icon: "error",
      title: "Email Taken",
      text: "An account with this email already exists.",
    });
    return;
  }
  users[email] = { name, password };
  saveUsers(users);
  currentUser = { email, name };
  saveSession(currentUser);
  initApp();
  Swal.fire({
    icon: "success",
    title: "Account Created!",
    text: `Welcome, ${name}`,
    timer: 1500,
    showConfirmButton: false,
  });
}

function handleLogout() {
  Swal.fire({
    title: "Logout?",
    text: "You will be signed out.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, logout",
    cancelButtonText: "Cancel",
  }).then((res) => {
    if (res.isConfirmed) {
      clearSession();
      currentUser = null;
      transactions = [];
      showAuth();
      Swal.fire({
        icon: "info",
        title: "Logged Out",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  });
}

//  Transactions

function loadTransactions() {
  if (!currentUser) return;
  transactions = loadTransactionsForUser(currentUser.email);
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveTransactions() {
  if (!currentUser) return;
  saveTransactionsForUser(currentUser.email, transactions);
}

function addTransaction(type, description, amount, date, category) {
  const txn = {
    id: generateId(),
    type,
    description: description.trim(),
    amount: parseFloat(amount),
    date,
    category: category || "Other",
  };
  transactions.unshift(txn);
  saveTransactions();
  renderAll();
  Swal.fire({
    icon: "success",
    title: "Added!",
    text: "Transaction saved successfully.",
    timer: 1200,
    showConfirmButton: false,
  });
}

function deleteTransaction(id) {
  Swal.fire({
    title: "Delete transaction?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
  }).then((res) => {
    if (res.isConfirmed) {
      transactions = transactions.filter((t) => t.id !== id);
      saveTransactions();
      renderAll();
      Swal.fire({
        icon: "info",
        title: "Deleted",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  });
}

function resetAllData() {
  Swal.fire({
    title: "Reset All Data?",
    text: "This will permanently delete ALL your transactions.",
    icon: "error",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Yes, reset everything",
    cancelButtonText: "Cancel",
  }).then((res) => {
    if (res.isConfirmed) {
      transactions = [];
      saveTransactions();
      renderAll();
      Swal.fire({
        icon: "info",
        title: "Reset Complete",
        text: "All data has been cleared.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}

//  Render

function renderStats() {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;
  displayBalance.textContent = formatCurrency(balance);
  displayIncome.textContent = formatCurrency(totalIncome);
  displayExpense.textContent = formatCurrency(totalExpense);
  displayCount.textContent = transactions.length;
}

function renderTransactions(filter = "all", search = "") {
  const tbody = transactionsBody;
  const empty = emptyTransactions;
  let filtered = [...transactions];

  if (filter !== "all") {
    filtered = filtered.filter((t) => t.type === filter);
  }
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }
  empty.classList.add("hidden");

  tbody.innerHTML = filtered
    .map((t) => {
      const isIncome = t.type === "income";
      const badgeClass = isIncome ? "badge-income" : "badge-expense";
      const sign = isIncome ? "+" : "-";
      const color = isIncome
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";
      return `
                    <tr>
                        <td class="whitespace-nowrap">${t.date}</td>
                        <td class="font-medium">${t.description}</td>
                        <td>
                            <span class="category-badge" style="border-color:${getCategoryColor(t.category)}; color:${getCategoryColor(t.category)};">
                                ${t.category}
                            </span>
                        </td>
                        <td class="text-right font-semibold ${color}">${sign}${formatCurrency(t.amount)}</td>
                        <td class="text-center">
                            <button class="text-red-400 hover:text-red-600 transition text-sm delete-txn" data-id="${t.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
    })
    .join("");

  tbody.querySelectorAll(".delete-txn").forEach((btn) => {
    btn.addEventListener("click", () => deleteTransaction(btn.dataset.id));
  });
}

function renderChart() {
  // Last 7 days
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const labels = days.map((d) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("en-US", { weekday: "short" });
  });

  const incomeData = days.map((d) =>
    transactions
      .filter((t) => t.type === "income" && t.date === d)
      .reduce((sum, t) => sum + t.amount, 0),
  );
  const expenseData = days.map((d) =>
    transactions
      .filter((t) => t.type === "expense" && t.date === d)
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const maxVal = Math.max(0, ...incomeData, ...expenseData) || 1;

  chartBars.innerHTML = labels
    .map((label, i) => {
      const inc = incomeData[i] || 0;
      const exp = expenseData[i] || 0;
      const incPct = (inc / maxVal) * 100;
      const expPct = (exp / maxVal) * 100;
      return `
                    <div class="chart-bar">
                        <div class="value-label">${formatCurrency(inc)}</div>
                        <div class="bar income" style="height:${Math.max(incPct, 2)}%;"></div>
                        <div class="value-label" style="color:#ef4444;">${formatCurrency(exp)}</div>
                        <div class="bar expense" style="height:${Math.max(expPct, 2)}%;"></div>
                        <div class="label">${label}</div>
                    </div>
                `;
    })
    .join("");
}

function renderAll() {
  renderStats();
  renderTransactions(filterType.value, searchInput.value);
  renderChart();
}

//  Dark Mode

function applyDarkMode(isDark) {
  darkMode = isDark;
  saveDarkMode(isDark);
  if (isDark) {
    document.documentElement.classList.add("dark");
    darkModeToggle.classList.add("active");
  } else {
    document.documentElement.classList.remove("dark");
    darkModeToggle.classList.remove("active");
  }
}

function toggleDarkMode() {
  applyDarkMode(!darkMode);
}

//  Currency

function loadCurrency() {
  if (!currentUser) return;
  const code = loadCurrencyForUser(currentUser.email);
  currencyCode = code;
  currencySelect.value = code;
}

function saveCurrency(code) {
  if (!currentUser) return;
  currencyCode = code;
  saveCurrencyForUser(currentUser.email, code);
  renderAll();
  Swal.fire({
    icon: "success",
    title: "Currency updated",
    timer: 1000,
    showConfirmButton: false,
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Modal
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function openModal() {
  modal.classList.add("active");
  txnDate.value = getToday();
  document.querySelector('input[name="txnType"][value="income"]').checked =
    true;
  txnDescription.value = "";
  txnAmount.value = "";
  txnCategory.value = "Food & Dining";
  txnDescription.focus();
}

function closeModal() {
  modal.classList.remove("active");
}

function handleTransactionSubmit(e) {
  e.preventDefault();
  const type = document.querySelector('input[name="txnType"]:checked').value;
  const description = txnDescription.value.trim();
  const amount = parseFloat(txnAmount.value);
  const date = txnDate.value;
  const category = txnCategory.value;

  if (!description) {
    Swal.fire({
      icon: "warning",
      title: "Missing Description",
      text: "Please enter a description.",
    });
    return;
  }
  if (!amount || amount <= 0) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Amount",
      text: "Please enter a valid amount greater than 0.",
    });
    return;
  }
  if (!date) {
    Swal.fire({
      icon: "warning",
      title: "Missing Date",
      text: "Please select a date.",
    });
    return;
  }

  addTransaction(type, description, amount, date, category);
  closeModal();
}



function switchTab(tab) {
  document
    .querySelectorAll(".nav-link")
    .forEach((el) => el.classList.remove("active"));
  if (tab === "dashboard") {
    tabDashboard.classList.remove("hidden");
    tabSettings.classList.add("hidden");
    document.querySelector('[data-tab="dashboard"]').classList.add("active");
    renderAll();
  } else {
    tabDashboard.classList.add("hidden");
    tabSettings.classList.remove("hidden");
    document.querySelector('[data-tab="settings"]').classList.add("active");
  }
}



function initApp() {
  const session = loadSession();
  if (session && session.email) {
    const users = loadUsers();
    if (users[session.email]) {
      currentUser = { email: session.email, name: users[session.email].name };
      showApp();
      userGreeting.textContent = `👋 ${currentUser.name}`;
      applyDarkMode(loadDarkMode());
      loadCurrency();
      loadTransactions();
      renderAll();
      switchTab("dashboard");
      return;
    } else {
      clearSession();
    }
  }
  showAuth();
}


// Auth
authLoginTab.addEventListener("click", () => switchAuthTab("login"));
authSignupTab.addEventListener("click", () => switchAuthTab("signup"));
loginForm.addEventListener("submit", handleLogin);
signupForm.addEventListener("submit", handleSignup);
logoutBtn.addEventListener("click", handleLogout);

// Transaction modal
addTransactionBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
transactionForm.addEventListener("submit", handleTransactionSubmit);

// Search & filter
searchInput.addEventListener("input", () =>
  renderTransactions(filterType.value, searchInput.value),
);
filterType.addEventListener("change", () =>
  renderTransactions(filterType.value, searchInput.value),
);

// Dark mode
darkModeToggle.addEventListener("click", toggleDarkMode);

// Currency
currencySelect.addEventListener("change", (e) => {
  saveCurrency(e.target.value);
});

// Reset data
resetDataBtn.addEventListener("click", resetAllData);

// Navigation
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    const tab = link.dataset.tab;
    if (tab === "dashboard") switchTab("dashboard");
    else if (tab === "settings") switchTab("settings");
  });
});


initApp();

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
