export const positions = [
  { name: "Lange Seite", artwork: "long-side" },
  { name: "Kurze Seite", artwork: "short-side" },
  { name: "Oberseite", artwork: "top" },
  { name: "Unterseite", artwork: "underside" },
];

const brickArtwork = {
  "long-side": `
    <path class="brick-face-top" d="M30 27 116 27 116 70 30 70Z"/>
    <path class="brick-face-short" d="M116 27 139 40 139 83 116 70Z"/>
    <path class="brick-face-long" d="M30 27 116 27 139 40 53 40Z"/>
    <g class="brick-studs">
      <ellipse cx="41" cy="38" rx="6.5" ry="6.5"/><ellipse cx="62" cy="38" rx="6.5" ry="6.5"/>
      <ellipse cx="83" cy="38" rx="6.5" ry="6.5"/><ellipse cx="104" cy="38" rx="6.5" ry="6.5"/>
      <ellipse cx="41" cy="59" rx="6.5" ry="6.5"/><ellipse cx="62" cy="59" rx="6.5" ry="6.5"/>
      <ellipse cx="83" cy="59" rx="6.5" ry="6.5"/><ellipse cx="104" cy="59" rx="6.5" ry="6.5"/>
    </g>
    <path class="brick-face-bottom" d="M30 70 116 70 139 83 53 83Z"/>
    <path class="brick-outline" d="M30 27 116 27 139 40 139 83 53 83 30 70Z"/>
  `,
  "short-side": `
    <path class="brick-face-long" d="M94 52 79 102 111 87 126 37Z"/>
    <path class="brick-face-short" d="M56 22 88 7 126 37 94 52Z"/>
    <path class="brick-face-top" d="M56 22 94 52 79 102 41 72Z"/>
    <g class="brick-studs">
      <ellipse cx="57" cy="38" rx="5.6" ry="4.2"/><ellipse cx="66.5" cy="45.5" rx="5.6" ry="4.2"/>
      <ellipse cx="76" cy="53" rx="5.6" ry="4.2"/><ellipse cx="85.5" cy="60.5" rx="5.6" ry="4.2"/>
      <ellipse cx="49.5" cy="63" rx="5.6" ry="4.2"/><ellipse cx="59" cy="70.5" rx="5.6" ry="4.2"/>
      <ellipse cx="68.5" cy="78" rx="5.6" ry="4.2"/><ellipse cx="78" cy="85.5" rx="5.6" ry="4.2"/>
    </g>
    <path class="brick-outline" d="M56 22 88 7 126 37 111 87 79 102 41 72Z"/>
  `,
  top: `
    <path class="brick-face-long" d="M22 44 93 79 93 104 22 69Z"/>
    <path class="brick-face-short" d="M93 79 138 56 138 81 93 104Z"/>
    <path class="brick-face-top" d="M67 20 138 56 93 79 22 44Z"/>
    <g class="brick-studs">
      <ellipse cx="65" cy="31" rx="7" ry="4.5"/><ellipse cx="83" cy="40" rx="7" ry="4.5"/>
      <ellipse cx="101" cy="49" rx="7" ry="4.5"/><ellipse cx="119" cy="58" rx="7" ry="4.5"/>
      <ellipse cx="42" cy="43" rx="7" ry="4.5"/><ellipse cx="60" cy="52" rx="7" ry="4.5"/>
      <ellipse cx="78" cy="61" rx="7" ry="4.5"/><ellipse cx="96" cy="70" rx="7" ry="4.5"/>
    </g>
    <path class="brick-outline" d="M67 20 138 56 138 81 93 104 22 69 22 44Z"/>
  `,
  underside: `
    <path class="brick-face-long" d="M22 44 93 79 93 104 22 69Z"/>
    <path class="brick-face-short" d="M93 79 138 56 138 81 93 104Z"/>
    <path class="brick-face-bottom" d="M67 20 138 56 93 79 22 44Z"/>
    <path class="brick-cavity-far" d="M70 27 129 57 119 62 75 37Z"/>
    <path class="brick-cavity-left" d="M70 27 36 45 44 50 75 37Z"/>
    <path class="brick-cavity-right" d="M129 57 93 75 93 69 119 62Z"/>
    <path class="brick-cavity-near" d="M36 45 93 75 93 69 44 50Z"/>
    <path class="brick-cavity-floor" d="M75 37 119 62 93 69 44 50Z"/>
    <g class="brick-tubes">
      <path class="brick-tube-wall" d="M51 45A8 4 0 1 1 67 45L67 54A8 4 0 1 1 51 54Z"/>
      <ellipse class="brick-tube-bottom" cx="59" cy="54" rx="8" ry="4"/>
      <ellipse class="brick-tube-opening" cx="59" cy="45" rx="8" ry="4"/>
      <ellipse class="brick-tube-hole" cx="59" cy="45" rx="5.2" ry="2.6"/>
      <path class="brick-tube-wall" d="M71 54A8 4 0 1 1 87 54L87 63A8 4 0 1 1 71 63Z"/>
      <ellipse class="brick-tube-bottom" cx="79" cy="63" rx="8" ry="4"/>
      <ellipse class="brick-tube-opening" cx="79" cy="54" rx="8" ry="4"/>
      <ellipse class="brick-tube-hole" cx="79" cy="54" rx="5.2" ry="2.6"/>
      <path class="brick-tube-wall" d="M91 63A8 4 0 1 1 107 63L107 72A8 4 0 1 1 91 72Z"/>
      <ellipse class="brick-tube-bottom" cx="99" cy="72" rx="8" ry="4"/>
      <ellipse class="brick-tube-opening" cx="99" cy="63" rx="8" ry="4"/>
      <ellipse class="brick-tube-hole" cx="99" cy="63" rx="5.2" ry="2.6"/>
    </g>
    <path class="brick-outline" d="M67 20 138 56 138 81 93 104 22 69 22 44Z"/>
  `,
};

export function createBrickIllustration(position) {
  const illustration = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  illustration.setAttribute("class", `brick-illustration brick-illustration--${position.artwork}`);
  illustration.setAttribute("viewBox", "0 0 160 120");
  illustration.setAttribute("aria-hidden", "true");
  illustration.innerHTML = brickArtwork[position.artwork];
  return illustration;
}
