const blocksContainer = document.querySelector(".blocks");

/*
const palette = [
  "#FCDC94",
  "#C8CFA0",
  "#78ABA8",
  "#4D9DB4",
  "#3A7F9C",
  "#296381",
  "#184769",
].reverse();
*/

const palette = [
  "#FCDC94", // Light and bright contrast to dark colors
  "#C8CFA0", // Light and bright contrast to dark colors
  "#78ABA8", // Light and bright contrast to dark colors
  "#4D9DB4", // Light and bright contrast to dark colors
  "#3A7F9C", // Light and bright contrast to dark colors
  "#296381", // Light and bright contrast to dark colors
  "#184769", // Light and bright contrast to dark colors
];
/*
const backgroundPalette = [
  "#FFFFF0",
  "#E6E6FA",
  "#F0FFF0",
  "#FFF5EE",
  "#FAFAD2",
  "#F5F5DC",
  "#FDF5E6",
  "#FFF8DC",
];
*/


const darkBackgroundPalette = [
  "#2F4F4F", // Dark Slate Grey
  "#4B0082", // Indigo
  "#006400", // Dark Green
  "#8B4513", // Saddle Brown
  "#8B0000", // Dark Red
  "#556B2F", // Dark Olive Green
  "#8B4513", // Dark Orange
  "#8B008B", // Dark Magenta
];

let currentIndex = 0;

function changeBackgroundColor() {
  document.body.style.backgroundColor = backgroundPalette[currentIndex];
  currentIndex = (currentIndex + 1) % backgroundPalette.length;
}

function createGrid() {
  blocksContainer.innerHTML = "";
  const columns = Math.floor(window.innerWidth / 120);
  blocksContainer.style.setProperty("--columns", columns);
  const rows = Math.floor(window.innerHeight / 120) - 1;
  const totalBlocks = columns * rows;

  for (let i = 0; i < totalBlocks; i++) {
    const block = document.createElement("div");
    block.style.backgroundColor = palette[i % palette.length];
    blocksContainer.appendChild(block);
  }
}

function updateScrubberPosition(
  scrubber,
  scrubberDraggable,
  scrubberContainer,
  progress
) {
  scrubber.style.left = progress * scrubberContainer.offsetWidth + "px";
  scrubberDraggable.style.left =
    progress * scrubberContainer.offsetWidth - 9 + "px";
}

export { changeBackgroundColor, createGrid, updateScrubberPosition };
