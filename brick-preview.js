import { positions, createBrickIllustration } from "./brick-artwork.js";

const preview = document.querySelector("#brick-preview-grid");

positions.forEach((position) => {
  const card = document.createElement("figure");
  card.className = "brick-preview-card";
  card.append(createBrickIllustration(position));
  const caption = document.createElement("figcaption");
  caption.textContent = position.name;
  card.append(caption);
  preview.append(card);
});
