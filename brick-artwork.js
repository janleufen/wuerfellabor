export const positions = [
  { name: "Lange Seite", artwork: "./assets/brick-long-side.svg" },
  { name: "Kurze Seite", artwork: "./assets/brick-short-side.svg" },
  { name: "Oberseite", artwork: "./assets/brick-top.svg" },
  { name: "Unterseite", artwork: "./assets/brick-underside.svg" },
];

export function createBrickIllustration(position) {
  const illustration = document.createElement("img");
  illustration.className = "brick-illustration";
  illustration.src = position.artwork;
  illustration.alt = "";
  illustration.setAttribute("aria-hidden", "true");
  illustration.draggable = false;
  return illustration;
}
