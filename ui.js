const blocksContainer = document.querySelector(".blocks");

const palette = [
  "#FCDC94",
  "#C8CFA0",
  "#78ABA8",
  "#4D9DB4",
  "#3A7F9C",
  "#296381",
  "#184769",
].reverse();

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
