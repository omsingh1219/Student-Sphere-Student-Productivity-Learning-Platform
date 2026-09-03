/* ==========================================================
   USER ONBOARDING & AUTH with LOCAL PROFILES
========================================================== */
let currentUser = null;
let authMode = 'signin'; // 'signin' or 'signup'

// Helper to access user-specific data
function getStorage(key, defaultVal = null) {
    if (!currentUser) return defaultVal;
    let val = localStorage.getItem(`${currentUser.email}_${key}`);
    return val ? val : defaultVal;
}

function setStorage(key, val) {
    if (!currentUser) return;
    localStorage.setItem(`${currentUser.email}_${key}`, val);
}

window.onload = function () {
    checkUser();
    updateClock();
};

function checkUser() {
    // Check if a user was last logged in (persist session)
    let lastEmail = localStorage.getItem("lastUserEmail");
    if (lastEmail) {
        let profile = JSON.parse(localStorage.getItem(`profile_${lastEmail}`));
        if (profile) {
            currentUser = profile;
            enterApp();
            return;
        }
    }
    // No session, show auth
    document.getElementById("authOverlay").classList.remove("hidden");
    toggleAuthMode('signin');
}

function toggleAuthMode(mode) {
    authMode = mode;
    let nameInput = document.getElementById("userName");
    let btn = document.getElementById("authBtn");
    let signInTab = document.getElementById("tabSignIn");
    let signUpTab = document.getElementById("tabSignUp");

    if (mode === 'signup') {
        nameInput.classList.remove("hidden");
        btn.innerText = "Create Account";
        signInTab.classList.remove("active");
        signUpTab.classList.add("active");
    } else {
        nameInput.classList.add("hidden");
        btn.innerText = "Sign In";
        signUpTab.classList.remove("active");
        signInTab.classList.add("active");
    }
}

function handleAuth() {
    let name = document.getElementById("userName").value.trim();
    let email = document.getElementById("userEmail").value.trim();
    let pass = document.getElementById("userPass").value.trim();

    if (!email || !pass) return showToast("Enter Email & Password", "error");
    if (authMode === 'signup' && !name) return showToast("Enter Name", "error");

    let profileKey = `profile_${email}`;
    let existingUser = JSON.parse(localStorage.getItem(profileKey));

    if (authMode === 'signup') {
        // Sign Up Logic
        if (existingUser) {
            showToast("Account already exists! Please Sign In.", "error");
            toggleAuthMode('signin');
            return;
        }
        currentUser = { name, email, pass };
        localStorage.setItem(profileKey, JSON.stringify(currentUser));
        localStorage.setItem("lastUserEmail", email);

        document.getElementById("authOverlay").classList.add("hidden");
        showWelcome(currentUser);
        showToast("Account Created! 🎉", "success");

    } else {
        // Sign In Logic
        if (!existingUser) {
            showToast("No account found. Please Sign Up.", "error");
            toggleAuthMode('signup');
            return;
        }
        if (existingUser.pass !== pass) {
            showToast("Wrong Password!", "error");
            return;
        }

        currentUser = existingUser;
        localStorage.setItem("lastUserEmail", email);

        document.getElementById("authOverlay").classList.add("hidden");
        showToast(`Welcome back, ${currentUser.name}!`, "success");
        enterApp(); // Skip welcome screen for re-login, just enter
    }
}

function handleGoogleLogin() {
    // Simulated Google Login
    let email = "googleuser@gmail.com";
    let name = "Google User";
    let profileKey = `profile_${email}`;

    // Check if mock user exists, if not create
    let existingUser = JSON.parse(localStorage.getItem(profileKey));
    if (!existingUser) {
        let pass = "google-auth-token"; // Dummy pass
        currentUser = { name, email, pass };
        localStorage.setItem(profileKey, JSON.stringify(currentUser));
        showToast("Linked with Google Account!", "success");
    } else {
        currentUser = existingUser;
        showToast("Logged in with Google", "success");
    }

    localStorage.setItem("lastUserEmail", email);
    document.getElementById("authOverlay").classList.add("hidden");
    enterApp();
}

function logout() {
    localStorage.removeItem("lastUserEmail");
    location.reload();
}

function showWelcome(user) {
    let welcomeOverlay = document.getElementById("welcomeOverlay");
    let welcomeMsg = document.getElementById("welcomeMsg");
    let quoteMsg = document.getElementById("quoteMsg");

    welcomeOverlay.classList.remove("hidden");

    // Greeting based on time
    let hour = new Date().getHours();
    let greeting = "Welcome";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    welcomeMsg.innerText = `${greeting}, ${user.name}!`;

    // Random Quotes
    const quotes = [
        "Your only limit is your mind.",
        "Dream big and dare to fail.",
        "Action is the foundational key to all success.",
        "Don't watch the clock; do what it does. Keep going.",
        "Believe you can and you're halfway there."
    ];
    quoteMsg.innerText = `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
}

function launchApp() {
    let plane = document.getElementById("flyPlane");
    if (plane) {
        plane.classList.remove("hidden");
        plane.classList.add("flying");

        // Wait for animation to finish then enter
        setTimeout(() => {
            enterApp();
            plane.classList.remove("flying");
            plane.classList.add("hidden");
        }, 800);
    } else {
        enterApp();
    }
}

/* ==========================================================
   FOCUS MODE
========================================================== */
let focusInterval = null;
let focusStartTime = null;
const FOCUS_TARGET_MIN = 120; // 2 Hours

function toggleFocusMode() {
    let overlay = document.getElementById("focusOverlay");

    if (overlay.classList.contains("hidden")) {
        // Start Focus
        overlay.classList.remove("hidden");
        focusStartTime = new Date();
        document.body.style.overflow = "hidden"; // Lock scroll

        // Start Appreciation Bar
        clearInterval(focusInterval);
        focusInterval = setInterval(updateFocusBar, 60000); // Update every min
        updateFocusBar();

        showToast("Deep Focus Started! 🎯", "success");
    }
}

function updateFocusBar() {
    if (!focusStartTime) return;

    let now = new Date();
    let diffMins = Math.floor((now - focusStartTime) / 60000);
    let percent = (diffMins / FOCUS_TARGET_MIN) * 100;

    if (percent > 100) percent = 100;

    document.getElementById("focusProgressBar").style.width = `${percent}%`;
    document.getElementById("focusTimeDisplay").innerText =
        `${diffMins} mins / ${FOCUS_TARGET_MIN} mins`;
}

function attemptExitFocus() {
    let now = new Date();
    let diffMins = Math.floor((now - focusStartTime) / 60000);

    if (diffMins < FOCUS_TARGET_MIN) {
        // Motivation
        let confirmExit = confirm(
            `Wait! You've only focused for ${diffMins} mins.\n\n` +
            `Target: 120 mins.\n\n` +
            `"Pain is temporary. Quitting lasts forever."\n\n` +
            `Are you sure you want to give up?`
        );
        if (confirmExit) exitFocus(false);
    } else {
        // Reward
        alert(`🎉 AMAZING! You focused for ${diffMins} minutes!\n\n` +
            `Reward Unlocked: 🎮 Go play 30 mins of Video Games!\n\n` +
            `We are proud of you.`);
        exitFocus(true);
    }
}

function exitFocus(isSuccess) {
    document.getElementById("focusOverlay").classList.add("hidden");
    document.body.style.overflow = "auto";
    clearInterval(focusInterval);
    focusStartTime = null;

    if (isSuccess) showToast("Session Completed! 🏆", "success");
}

function saveFocusNote() {
    let type = document.getElementById("focusNoteType").value;
    let content = document.getElementById("focusNoteInput").value.trim();

    if (!content) return showToast("Type something first!", "error");

    // format as title: [Type] Date
    let title = `[${type}] Focus Session ${new Date().toLocaleDateString()}`;

    // Add to Notes Module
    notes.push({ title, body: content });
    setStorage("notesList", JSON.stringify(notes));

    // Also save locally if they want to access in dashboard
    document.getElementById("focusNoteInput").value = "";
    showToast("Note Saved to Dashboard! 📘", "success");

    // Refresh main notes UI
    if (document.getElementById("notesContainer")) renderNotes();
}

function enterApp() {
    document.getElementById("welcomeOverlay").classList.add("hidden");
    document.getElementById("mainHeader").classList.remove("hidden");

    // Hero Section
    let hero = document.getElementById("hero");
    if (hero) {
        hero.classList.remove("hidden");
        // Update name in hero
        if (currentUser && currentUser.name) {
            let firstName = currentUser.name.split(" ")[0];
            document.getElementById("heroName").innerText = firstName;
        }
        startTypingEffect();
    }

    document.getElementById("mainContainer").classList.remove("hidden");

    // Rewrite global variables using new storage
    loadUserData();

    // Animation for container
    document.getElementById("mainContainer").style.animation = "fadeIn 1s ease";
}

/* ==========================================================
   TOAST NOTIFICATIONS (Replaces Alert)
========================================================== */
function showToast(msg, type = "info") {
    let box = document.getElementById("toastBox");
    if (!box) {
        box = document.createElement("div");
        box.id = "toastBox";
        document.body.appendChild(box);
    }

    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = type === "success" ? `✅ ${msg}` : `🔔 ${msg}`;

    // Color coding based on type
    if (type === "error") toast.style.borderLeftColor = "#ef4444";
    if (type === "success") toast.style.borderLeftColor = "#10b981";

    box.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/* ==========================================================
   SIDEBAR TOGGLE
========================================================== */
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function scrollToSection(id) {
    if (document.getElementById("mainContainer").classList.contains("hidden")) {
        enterApp();
    }
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
    if (window.innerWidth < 768) toggleSidebar();
}

/* ==========================================================
   DATA LOADING & GLOBAL VARS
========================================================== */
let darkMode, todos, budgetEntries, notes, snippets, pomoCount, subjects, habits, flashcards, waterCount, waterDate, waterHistory;

function loadUserData() {
    // Dark Mode
    darkMode = getStorage("darkMode");
    if (darkMode === "enabled") enableDark();
    else disableDark();

    // To-Do
    todos = JSON.parse(getStorage("todos", "[]"));
    renderTodos();

    // Budget
    budgetEntries = JSON.parse(getStorage("budget", "[]"));
    renderBudget();
    updateBudgetChart();

    // Notes
    notes = JSON.parse(getStorage("notesList", "[]"));
    renderNotes();

    // Snippets
    snippets = JSON.parse(getStorage("snippetsList", "[]"));
    renderSnippets();

    // Skills
    if (document.getElementById("skillsText")) {
        document.getElementById("skillsText").value = getStorage("skills", "");
        document.getElementById("skillsText").oninput = () => {
            setStorage("skills", document.getElementById("skillsText").value);
        };
    }

    // Pomodoro
    pomoCount = Number(getStorage("pomoCount", 0));
    if (document.getElementById("pomoCount")) document.getElementById("pomoCount").innerText = pomoCount;

    // SGPA
    subjects = JSON.parse(getStorage("sgpaList", "[]"));
    renderSubjects();

    // Habits
    habits = JSON.parse(getStorage("habits", "[]"));
    let today = new Date().toDateString();
    let savedDate = getStorage("habitDate");
    if (savedDate !== today) {
        habits.forEach(h => h.completed = false);
        setStorage("habitDate", today);
        setStorage("habits", JSON.stringify(habits));
    }
    renderHabits();

    // Flashcards
    flashcards = JSON.parse(getStorage("flashcards", "[]"));
    renderFlashcardUI();

    // Hydration
    waterCount = Number(getStorage("waterCount", 0));
    waterDate = getStorage("waterDate");
    waterHistory = JSON.parse(getStorage("waterHistory", "[]"));
    checkWaterReset();
    updateWaterUI();
}

/* ==========================================================
   DARK MODE
========================================================== */
function enableDark() {
    document.body.classList.add("dark");
    setStorage("darkMode", "enabled");
}

function disableDark() {
    document.body.classList.remove("dark");
    setStorage("darkMode", "disabled");
}

function toggleDark() {
    if (document.body.classList.contains("dark")) {
        disableDark();
        showToast("Light Mode Enabled");
    } else {
        enableDark();
        showToast("Dark Mode Enabled");
    }
}

/* ==========================================================
   TO-DO LIST
========================================================== */
function renderTodos() {
    let list = document.getElementById("todoList");
    if (!list) return;
    list.innerHTML = "";

    todos.forEach((t, i) => {
        list.innerHTML += `
            <div class="todoItem">
                <span>${t}</span>
                <button onclick="deleteTask(${i})" style="background:#ef4444">❌</button>
            </div>
        `;
    });
}

function addTask() {
    let input = document.getElementById("todoInput");
    if (input.value.trim() === "") return;

    todos.push(input.value.trim());
    setStorage("todos", JSON.stringify(todos));
    input.value = "";
    renderTodos();
    showToast("Task Added", "success");
}

function deleteTask(i) {
    todos.splice(i, 1);
    setStorage("todos", JSON.stringify(todos));
    renderTodos();
    showToast("Task Removed", "error");
}

/* ==========================================================
   BUDGET PLANNER
========================================================== */
function addBudget() {
    let date = document.getElementById("budgetDate").value;
    let amount = parseFloat(document.getElementById("budgetAmount").value);

    if (!date || isNaN(amount)) {
        showToast("Please enter valid date & amount", "error");
        return;
    }

    budgetEntries.push({ date, amount });
    setStorage("budget", JSON.stringify(budgetEntries));

    renderBudget();
    updateBudgetChart();
    showToast("Entry Added", "success");
}

function renderBudget() {
    let table = document.getElementById("budgetTable");
    if (!table) return;
    table.innerHTML = "";

    budgetEntries.forEach((entry) => {
        table.innerHTML += `<tr><td>${entry.date}</td><td>$${entry.amount}</td></tr>`;
    });
}

/* Chart */
let budgetCtx = document.getElementById("budgetChart");
let budgetChart;

function updateBudgetChart() {
    if (!budgetCtx) return;
    let monthly = {};
    if (budgetEntries) {
        budgetEntries.forEach((e) => {
            let month = e.date.substring(0, 7);
            if (!monthly[month]) monthly[month] = 0;
            monthly[month] += Number(e.amount);
        });
    }

    let labels = Object.keys(monthly);
    let data = Object.values(monthly);

    if (budgetChart) budgetChart.destroy();

    budgetChart = new Chart(budgetCtx.getContext("2d"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Monthly Expenses",
                backgroundColor: "#6366f1",
                borderRadius: 4,
                data
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } }
        }
    });
}

/* ==========================================================
   NOTES MANAGER (Multi-Save)
========================================================== */
function renderNotes() {
    let container = document.getElementById("notesContainer");
    if (!container) return;
    container.innerHTML = "";
    notes.forEach((n, i) => {
        container.innerHTML += `
            <div class="note-card">
                <h4>${n.title}</h4>
                <p>${n.body}</p>
                <button class="delete-btn" onclick="deleteNote(${i})">🗑️</button>
            </div>
        `;
    });
}

function saveNote() {
    let title = document.getElementById("noteTitle").value.trim();
    let body = document.getElementById("noteBody").value.trim();
    if (!title || !body) return showToast("Empty note!", "error");

    notes.unshift({ title, body, date: new Date().toLocaleDateString() });
    setStorage("notesList", JSON.stringify(notes));
    renderNotes();
    document.getElementById("noteTitle").value = "";
    document.getElementById("noteBody").value = "";
    showToast("Note Saved!", "success");
}

function deleteNote(i) {
    notes.splice(i, 1);
    setStorage("notesList", JSON.stringify(notes));
    renderNotes();
}

/* ==========================================================
   CODE SNIPPETS MANAGER
========================================================== */
function renderSnippets() {
    let list = document.getElementById("snippetList");
    if (!list) return;
    list.innerHTML = "";
    snippets.forEach((s, i) => {
        list.innerHTML += `
            <div class="note-card" style="border-left-color: #10b981;">
                <h4>${s.title}</h4>
                <p style="font-family:monospace; background:rgba(0,0,0,0.1); padding:0.5rem; border-radius:4px;">${s.code}</p>
                <button class="delete-btn" onclick="deleteSnippet(${i})">🗑️</button>
            </div>
        `;
    });
}

function saveSnippet() {
    let title = document.getElementById("snippetTitle").value.trim();
    let code = document.getElementById("snippetCode").value.trim();
    if (!title || !code) return showToast("Empty snippet!", "error");

    snippets.unshift({ title, code });
    setStorage("snippetsList", JSON.stringify(snippets));
    renderSnippets();
    document.getElementById("snippetTitle").value = "";
    document.getElementById("snippetCode").value = "";
    showToast("Snippet Saved!", "success");
}

function deleteSnippet(i) {
    snippets.splice(i, 1);
    setStorage("snippetsList", JSON.stringify(snippets));
    renderSnippets();
}

/* ==========================================================
   APP LAUNCHER
========================================================== */
function openApp(url) {
    window.open(url, '_blank');
}
function renderSubjects() {
    let container = document.getElementById("subjectList");
    if (!container) return; // Guard clause in case element missing
    container.innerHTML = "";

    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach((s, i) => {
        let points = Number(s.credit) * Number(s.grade);
        totalPoints += points;
        totalCredits += Number(s.credit);

        container.innerHTML += `
            <div class="note-card" style="border-left-color: var(--secondary);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="margin:0">${s.subject}</h4>
                    <span style="font-weight:bold; color:var(--text-main);">${s.credit} Cr</span>
                </div>
                <p style="margin:0.5rem 0; color:var(--text-secondary)">Grade Point: <b>${s.grade}</b></p>
                <button class="delete-btn" onclick="deleteSubject(${i})">🗑️</button>
            </div>
        `;
    });

    // Calc SGPA
    let sgpa = totalCredits === 0 ? 0 : (totalPoints / totalCredits).toFixed(2);
    let sgpaEl = document.getElementById("sgpaValue");
    if (sgpaEl) sgpaEl.innerText = sgpa;
}

function addSubject() {
    let subject = document.getElementById("sgpaSubject").value.trim();
    let credit = document.getElementById("sgpaCredit").value;
    let grade = document.getElementById("sgpaGrade").value;

    if (!subject || !credit) return showToast("Enter details!", "error");

    subjects.push({ subject, credit, grade });
    setStorage("sgpaList", JSON.stringify(subjects));

    renderSubjects();
    document.getElementById("sgpaSubject").value = "";
    document.getElementById("sgpaCredit").value = "";
    showToast("Subject Added!", "success");
}

function deleteSubject(i) {
    subjects.splice(i, 1);
    setStorage("sgpaList", JSON.stringify(subjects));
    renderSubjects();
}

/* ==========================================================
   CALCULATOR
========================================================== */
let calcValue = "";

function calcPress(v) {
    let scr = document.getElementById("calcScreen");
    if (!scr) return;
    if (v === "AC") {
        calcValue = "";
        scr.innerText = "0";
        return;
    }
    if (v === "DEL") {
        calcValue = calcValue.slice(0, -1);
        scr.innerText = calcValue || "0";
        return;
    }
    calcValue += v;
    scr.innerText = calcValue;
}

function calcResult() {
    let scr = document.getElementById("calcScreen");
    if (!scr) return;
    try {
        calcValue = eval(calcValue).toString();
        scr.innerText = calcValue;
    } catch {
        scr.innerText = "Error";
        calcValue = "";
    }
}

/* ==========================================================
   CLOCK
========================================================== */
function updateClock() {
    let now = new Date();
    let clockEl = document.getElementById("dateClock");
    if (clockEl) clockEl.innerText = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);

/* ==========================================================
   HABIT TRACKER
========================================================== */
function renderHabits() {
    let list = document.getElementById("habitList");
    if (!list) return;
    list.innerHTML = "";

    habits.forEach((h, i) => {
        list.innerHTML += `
            <div class="habit-item ${h.completed ? 'completed' : ''}">
                <div class="habit-info">
                    <h4>${h.name}</h4>
                    <span>🔥 Streak: ${h.streak}</span>
                </div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <div class="habit-check" onclick="toggleHabit(${i})">
                        ${h.completed ? '✓' : ''}
                    </div>
                    <button class="delete-btn" onclick="deleteHabit(${i})" style="width:auto; padding:0.5rem;">🗑️</button>
                </div>
            </div>
        `;
    });
}

function addHabit() {
    let input = document.getElementById("habitInput");
    let name = input.value.trim();
    if (!name) return showToast("Enter a habit!", "error");

    habits.push({ name, streak: 0, completed: false });
    setStorage("habits", JSON.stringify(habits));
    input.value = "";
    renderHabits();
    showToast("Habit added!", "success");
}

function toggleHabit(i) {
    if (habits[i].completed) {
        habits[i].completed = false;
        if (habits[i].streak > 0) habits[i].streak--;
    } else {
        habits[i].completed = true;
        habits[i].streak++;
        showToast("Great job!", "success");
    }
    setStorage("habits", JSON.stringify(habits));
    renderHabits();
}

function deleteHabit(i) {
    habits.splice(i, 1);
    setStorage("habits", JSON.stringify(habits));
    renderHabits();
}

/* ==========================================================
   FLASHCARDS
========================================================== */
let currentCard = 0;
let isFlipped = false;

function renderFlashcardUI() {
    let front = document.getElementById("flashFrontText");
    let back = document.getElementById("flashBackText");
    let indicator = document.getElementById("cardIndicator");
    let card = document.getElementById("flashcard");
    if (!front || !back || !indicator || !card) return;

    if (!flashcards || flashcards.length === 0) {
        front.innerText = "No cards yet";
        back.innerText = "Add one above!";
        indicator.innerText = "0 / 0";
        return;
    }

    if (currentCard >= flashcards.length) currentCard = 0;

    front.innerText = flashcards[currentCard].question;
    back.innerText = flashcards[currentCard].answer;
    indicator.innerText = `${currentCard + 1} / ${flashcards.length}`;

    // Reset flip
    isFlipped = false;
    card.classList.remove("flipped");
}

function addFlashcard() {
    let q = document.getElementById("flashQuestion").value.trim();
    let a = document.getElementById("flashAnswer").value.trim();

    if (!q || !a) return showToast("Fill both sides!", "error");

    flashcards.push({ question: q, answer: a });
    setStorage("flashcards", JSON.stringify(flashcards));

    document.getElementById("flashQuestion").value = "";
    document.getElementById("flashAnswer").value = "";

    currentCard = flashcards.length - 1; // Go to new card
    renderFlashcardUI();
    showToast("Card Added!", "success");
}

function flipCard() {
    let card = document.getElementById("flashcard");
    if (!card) return;
    isFlipped = !isFlipped;
    if (isFlipped) card.classList.add("flipped");
    else card.classList.remove("flipped");
}

function nextCard() {
    if (flashcards.length === 0) return;
    currentCard = (currentCard + 1) % flashcards.length;
    renderFlashcardUI();
}

function prevCard() {
    if (flashcards.length === 0) return;
    currentCard = (currentCard - 1 + flashcards.length) % flashcards.length;
    renderFlashcardUI();
}

function deleteCurrentCard() {
    if (flashcards.length === 0) return;
    flashcards.splice(currentCard, 1);
    setStorage("flashcards", JSON.stringify(flashcards));
    if (currentCard >= flashcards.length) currentCard = Math.max(0, flashcards.length - 1);
    renderFlashcardUI();
    showToast("Card Deleted", "info");
}

/* ==========================================================
   HYDRATION TRACKER
========================================================== */

function checkWaterReset() {
    let today = new Date().toDateString();
    if (waterDate !== today) {
        // Save previous day's history if it exists and has count > 0
        if (waterDate && waterCount > 0) {
            waterHistory.unshift({ date: waterDate, count: waterCount });
            // Keep only last 7 days
            if (waterHistory.length > 7) waterHistory.pop();
            setStorage("waterHistory", JSON.stringify(waterHistory));
        }

        // Reset for new day
        waterCount = 0;
        setStorage("waterDate", today);
        setStorage("waterCount", 0);
        // Set waterDate to today so we don't reset again immediately
        waterDate = today;
    }
}

function updateWaterUI() {
    let grid = document.getElementById("waterGrid");
    let text = document.getElementById("waterText");
    if (!grid) return;

    grid.innerHTML = "";
    for (let i = 0; i < 8; i++) {
        let filled = i < waterCount;
        grid.innerHTML += `<div class="water-drop ${filled ? 'filled' : ''}"></div>`;
    }

    let percent = Math.round((waterCount / 8) * 100);
    text.innerText = `${waterCount} / 8 Glasses (${percent}%)`;
}

function renderWaterHistory() {
    let list = document.getElementById("waterHistoryList");
    if (!list) return;

    if (waterHistory.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--text-muted)">No history yet.</p>`;
        return;
    }

    list.innerHTML = `<h4 style="margin-bottom:0.5rem; border-bottom:1px solid #ddd; padding-bottom:5px;">Last 7 Days</h4>`;
    waterHistory.forEach(h => {
        list.innerHTML += `
            <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid rgba(0,0,0,0.05);">
                <span>${h.date}</span>
                <strong>${h.count} 💧</strong>
            </div>
        `;
    });
}

function toggleHistory() {
    let list = document.getElementById("waterHistoryList");
    if (list.classList.contains("hidden")) {
        renderWaterHistory();
        list.classList.remove("hidden");
    } else {
        list.classList.add("hidden");
    }
}

function addWater() {
    checkWaterReset();
    if (waterCount < 8) {
        waterCount++;
        setStorage("waterCount", waterCount);
        updateWaterUI();
        showToast("Stay Hydrated! 💧", "success");
    } else {
        showToast("Goal Reached! 🎉", "success");
    }
}

function removeWater() {
    checkWaterReset();
    if (waterCount > 0) {
        waterCount--;
        setStorage("waterCount", waterCount);
        updateWaterUI();
    }
}

// Initial Load
checkWaterReset();
updateWaterUI();

/* ==========================================================
   HERO TYPING EFFECT
========================================================== */
function startTypingEffect() {
    const textElement = document.getElementById("typingText");
    const words = ["Productivity", "Growth", "Focus", "Learning", "Success"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        if (!textElement) return;
        const currentWord = words[wordIndex];

        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Faster deletion
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 150; // Normal typing
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500; // Pause before next word
        }

        setTimeout(type, typeSpeed);
    }

    type();
}