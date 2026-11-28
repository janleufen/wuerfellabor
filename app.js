import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, push, get, remove, query, orderByChild, equalTo, onValue, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/auto/+esm";
import { positions, createBrickIllustration } from "./brick-artwork.js";

const colors = ["#197c68", "#e8bd43", "#477d9a", "#c95c87"];
const params = new URLSearchParams(location.search);
const sessionId = params.get("session");
const isStudent = params.get("role") === "student";
const connected = Object.values(firebaseConfig).every((value) => !value.startsWith("YOUR_"));
const connection = document.querySelector(".connection");
const connectionLabel = document.querySelector("#connection-label");

function showSetup() {
  document.querySelector("#setup-note").hidden = false;
  document.querySelector("#create-session").disabled = true;
  document.querySelector("#session-name").disabled = true;
  if (sessionId && isStudent) {
    document.querySelector("#student-loading-status").textContent = "Die Teilnahme ist noch nicht eingerichtet.";
  }
  connection.classList.add("offline");
  connectionLabel.textContent = "Nicht eingerichtet";
}

function renderBrick(position) {
  const element = document.createElement("button");
  element.className = "brick-button";
  element.type = "button";
  element.setAttribute("aria-label", position.name);
  element.append(createBrickIllustration(position));
  const label = document.createElement("span");
  label.className = "brick-label";
  label.textContent = position.name;
  element.append(label);
  return element;
}

function setView(view) {
  document.querySelector("#student-loading-view").hidden = view !== "loading";
  document.querySelector("#welcome-view").hidden = view !== "welcome";
  document.querySelector("#teacher-view").hidden = view !== "teacher";
  document.querySelector("#student-view").hidden = view !== "student";
}

function sessionUrl(role = "student") {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ session: sessionId, role }).toString();
  return url.href;
}

async function loadSessions() {
  const sessionList = document.querySelector("#session-list");
  const emptyMessage = document.querySelector("#no-sessions");
  sessionList.replaceChildren();
  emptyMessage.hidden = true;
  const snapshot = await get(query(ref(database, "sessions"), orderByChild("ownerUid"), equalTo(uid)));
  const sessions = [];
  snapshot.forEach((sessionSnapshot) => {
    sessions.push({ id: sessionSnapshot.key, ...sessionSnapshot.val() });
  });
  sessions.sort((left, right) => (right.createdAt || 0) - (left.createdAt || 0));
  emptyMessage.hidden = sessions.length > 0;
  sessions.forEach((session) => {
    const item = document.createElement("li");
    item.className = "session-entry";
    const openButton = document.createElement("button");
    openButton.className = "session-open";
    openButton.type = "button";
    openButton.textContent = session.name || "Unbenannte Runde";
    openButton.addEventListener("click", () => {
      location.search = new URLSearchParams({ session: session.id }).toString();
    });
    const created = document.createElement("span");
    created.className = "session-date";
    created.textContent = session.createdAt ? new Date(session.createdAt).toLocaleString("de-DE") : "";
    const deleteButton = document.createElement("button");
    deleteButton.className = "session-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Löschen";
    deleteButton.setAttribute("aria-label", `${session.name || "Unbenannte Runde"} löschen`);
    deleteButton.addEventListener("click", async () => {
      if (!window.confirm(`Runde „${session.name || "Unbenannte Runde"}“ und alle Würfe löschen?`)) return;
      deleteButton.disabled = true;
      try {
        await remove(ref(database, `sessions/${session.id}`));
        await loadSessions();
      } catch (error) {
        document.querySelector("#session-feedback").textContent = "Die Runde konnte nicht gelöscht werden. Prüfe die Verbindung.";
        console.error(error);
        deleteButton.disabled = false;
      }
    });
    item.append(openButton, created, deleteButton);
    sessionList.append(item);
  });
}

async function copyJoinLink() {
  await navigator.clipboard.writeText(sessionUrl());
  const button = document.querySelector("#copy-link");
  button.innerHTML = "Kopiert <span aria-hidden=\"true\">✓</span>";
  setTimeout(() => { button.innerHTML = "Link kopieren <span aria-hidden=\"true\">↗</span>"; }, 1800);
}

function startChart() {
  const context = document.querySelector("#frequency-chart");
  const legend = document.querySelector("#legend");
  const countContainer = document.querySelector("#face-counts");
  const counts = Array(positions.length).fill(0);
  let total = 0;
  const chart = new Chart(context, {
    type: "line",
    data: {
      labels: [],
      datasets: counts.map((_, index) => ({
        label: positions[index].name,
        data: [],
        borderColor: colors[index],
        backgroundColor: colors[index],
        borderWidth: 1,
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 5,
        pointHitRadius: 8,
        tension: 0,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { intersect: false, mode: "index" },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ${item.formattedValue}%` } } },
      scales: {
        x: { title: { display: true, text: "Anzahl der Würfe", color: "#747d76", font: { family: "DM Mono", size: 10 } }, grid: { display: false }, ticks: { maxTicksLimit: 8, color: "#747d76" } },
        y: { min: 0, max: 100, title: { display: true, text: "Wahrscheinlichkeit", color: "#747d76", font: { family: "DM Mono", size: 10 } }, grid: { color: "#e7e9e2" }, ticks: { stepSize: 10, color: "#747d76", callback: (value) => `${Math.round(Number(value) / 10)}/10` } },
      },
    },
  });
  counts.forEach((_, index) => {
    const item = document.createElement("span");
    item.className = "legend-item";
    item.innerHTML = `<span class="legend-dot" style="background:${colors[index]}"></span>${positions[index].name}`;
    legend.append(item);
    const cell = document.createElement("div");
    cell.className = "count-cell";
    cell.innerHTML = `<span class="legend-dot" style="background:${colors[index]}"></span><span>${positions[index].name}: <strong id="count-${index + 1}">0</strong></span>`;
    countContainer.append(cell);
  });
  onChildAdded(ref(database, `sessions/${sessionId}/rolls`), (snapshot) => {
    const roll = snapshot.val();
    const face = Number(roll.face);
    if (!Number.isInteger(face) || face < 1 || face > positions.length) return;
    counts[face - 1] += 1;
    total += 1;
    chart.data.labels.push(total);
    counts.forEach((count, index) => chart.data.datasets[index].data.push((count / total) * 100));
    document.querySelector("#total-rolls").textContent = total;
    document.querySelector(`#count-${face}`).textContent = counts[face - 1];
    chart.update();
  });
}

let database;
let uid;

async function initialize() {
  if (sessionId && isStudent) setView("loading");
  if (!connected) {
    showSetup();
    return;
  }
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    await setPersistence(auth, browserLocalPersistence);
    await auth.authStateReady();
    const user = auth.currentUser || (await signInAnonymously(auth)).user;
    uid = user.uid;
    database = getDatabase(app);
    onValue(ref(database, ".info/connected"), (snapshot) => {
      const online = snapshot.val() === true;
      connection.classList.toggle("online", online);
      connection.classList.toggle("offline", !online);
      connectionLabel.textContent = online ? "Verbunden" : "Verbindung wird hergestellt";
    }, (error) => {
      connection.classList.add("offline");
      connectionLabel.textContent = "Verbindung fehlgeschlagen";
      console.error(error);
    });
    if (sessionId) {
      await openSession();
    } else {
      try {
        await loadSessions();
      } catch (error) {
        const permissionDenied = error.code === "PERMISSION_DENIED";
        document.querySelector("#session-feedback").textContent = permissionDenied
          ? "Firebase verweigert den Zugriff auf die Sitzungsliste. Veröffentliche die aktuellen Datenbankregeln aus database.rules.json."
          : "Die Sitzungsliste konnte nicht geladen werden. Prüfe die Verbindung.";
        console.error("Sitzungsliste konnte nicht geladen werden.", error);
      }
    }
  } catch (error) {
    connection.classList.add("offline");
    connectionLabel.textContent = "Verbindung fehlgeschlagen";
    if (sessionId && isStudent) {
      document.querySelector("#student-loading-status").textContent = "Anmeldung fehlgeschlagen. Prüfe die Verbindung und lade die Seite erneut.";
    }
    console.error(error);
  }
}

async function openSession() {
  const sessionRef = ref(database, `sessions/${sessionId}`);
  if (isStudent) {
    setView("student");
    document.querySelector("#round-id").textContent = `RUNDE ${sessionId.slice(0, 8).toUpperCase()}`;
    const diceButtons = document.querySelector("#dice-buttons");
    for (let face = 1; face <= positions.length; face += 1) {
      const button = renderBrick(positions[face - 1]);
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await set(push(ref(database, `sessions/${sessionId}/rolls`)), { face, by: uid, at: Date.now() });
          document.querySelector("#student-feedback").textContent = `${positions[face - 1].name} wurde gezählt.`;
        } catch (error) {
          document.querySelector("#student-feedback").textContent = "Der Wurf konnte nicht gespeichert werden. Prüfe die Verbindung.";
          console.error(error);
        } finally {
          button.disabled = false;
        }
      });
      diceButtons.append(button);
    }
    onChildAdded(ref(database, `sessions/${sessionId}/rolls`), () => {
      const total = document.querySelector("#student-total-rolls");
      total.textContent = Number(total.textContent) + 1;
    });
  } else {
    setView("teacher");
    const sessionSnapshot = await get(sessionRef);
    const sessionName = sessionSnapshot.val()?.name || `Runde ${sessionId.slice(0, 8).toUpperCase()}`;
    document.querySelector("#session-title").textContent = sessionName;
    document.querySelector("#round-id").textContent = `RUNDE ${sessionId.slice(0, 8).toUpperCase()}`;
    document.querySelector("#session-short-code").textContent = sessionId.slice(0, 8).toUpperCase();
    new QRCode(document.querySelector("#qr-code"), { text: sessionUrl(), width: 100, height: 100, correctLevel: QRCode.CorrectLevel.M });
    document.querySelector("#copy-link").addEventListener("click", copyJoinLink);
    document.querySelector("#share-session").addEventListener("click", copyJoinLink);
    document.querySelector("#new-session").addEventListener("click", () => { location.href = location.pathname; });
    startChart();
  }
}

document.querySelector("#create-session").addEventListener("click", async () => {
  if (!database || !uid) return;
  const nameInput = document.querySelector("#session-name");
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    document.querySelector("#session-feedback").textContent = "Gib der Runde zuerst einen Namen.";
    return;
  }
  const button = document.querySelector("#create-session");
  button.disabled = true;
  try {
    const newSession = push(ref(database, "sessions"));
    await set(newSession, { ownerUid: uid, active: true, name, createdAt: Date.now() });
    location.search = new URLSearchParams({ session: newSession.key }).toString();
  } catch (error) {
    document.querySelector("#session-feedback").textContent = "Die Runde konnte nicht erstellt werden. Prüfe die Verbindung.";
    console.error(error);
    button.disabled = false;
  }
});

initialize();