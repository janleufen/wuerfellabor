import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, set, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.3/auto/+esm";

const colors = ["#197c68", "#e8bd43", "#477d9a", "#c95c87"];
const positions = [
  { name: "Aufrecht", className: "upright" },
  { name: "Auf dem Kopf", className: "upside-down" },
  { name: "Auf der langen Seite", className: "long-side" },
  { name: "Auf der kurzen Seite", className: "short-side" },
];
const params = new URLSearchParams(location.search);
const sessionId = params.get("session");
const isStudent = params.get("role") === "student";
const connected = Object.values(firebaseConfig).every((value) => !value.startsWith("YOUR_"));
const connection = document.querySelector(".connection");
const connectionLabel = document.querySelector("#connection-label");

function showSetup() {
  document.querySelector("#setup-note").hidden = false;
  document.querySelector("#create-session").disabled = true;
  connection.classList.add("offline");
  connectionLabel.textContent = "Nicht eingerichtet";
}

function renderBrick(position, button = false) {
  const element = document.createElement(button ? "button" : "div");
  if (button) {
    element.className = "brick-button";
    element.type = "button";
    element.setAttribute("aria-label", positions[position - 1].name);
  }
  const brick = document.createElement("span");
  brick.className = `brick-visual brick-visual--${positions[position - 1].className}`;
  for (let stud = 0; stud < 8; stud += 1) {
    brick.append(document.createElement("i"));
  }
  element.append(brick);
  if (button) {
    const label = document.createElement("span");
    label.className = "brick-label";
    label.textContent = positions[position - 1].name;
    element.append(label);
  }
  return element;
}

function setView(view) {
  document.querySelector("#welcome-view").hidden = view !== "welcome";
  document.querySelector("#teacher-view").hidden = view !== "teacher";
  document.querySelector("#student-view").hidden = view !== "student";
}

function sessionUrl(role = "student") {
  const url = new URL(location.href);
  url.search = new URLSearchParams({ session: sessionId, role }).toString();
  return url.href;
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
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 8,
        tension: 0.2,
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
        y: { min: 0, max: 100, title: { display: true, text: "Anteil (%)", color: "#747d76", font: { family: "DM Mono", size: 10 } }, grid: { color: "#e7e9e2" }, ticks: { color: "#747d76", callback: (value) => `${value}%` } },
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
  if (!connected) {
    showSetup();
    return;
  }
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const credential = await signInAnonymously(auth);
    uid = credential.user.uid;
    database = getDatabase(app);
    connection.classList.add("online");
    connectionLabel.textContent = "Verbunden";
    if (sessionId) await openSession();
  } catch (error) {
    connection.classList.add("offline");
    connectionLabel.textContent = "Verbindung fehlgeschlagen";
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
      const button = renderBrick(face, true);
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
  const newSession = push(ref(database, "sessions"));
  await set(newSession, { ownerUid: uid, active: true, createdAt: Date.now() });
  location.search = new URLSearchParams({ session: newSession.key }).toString();
});

initialize();