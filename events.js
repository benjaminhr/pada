import { processFile, startMicrophoneInput } from "./audio.js";
import { changeBackgroundColor, createGrid } from "./ui.js";
import { ranges, maxValues } from "./constants.js"; // Ensure constants are imported if needed in audio.js or frequency.js

const micButton = document.getElementById("mic-button");
const fileInput = document.getElementById("actual-btn");
const blocksContainer = document.querySelector(".blocks");
const scrubber = document.getElementById("scrubber");
const scrubberDraggable = document.getElementById("scrubber-draggable");
const scrubberContainer = document.getElementById("scrubber-container");

window.onload = () => {
  changeBackgroundColor();
  createGrid();
  setInterval(changeBackgroundColor, 3000);

  fileInput.addEventListener("change", function () {
    processFile(
      this,
      [...blocksContainer.children],
      scrubber,
      scrubberDraggable,
      scrubberContainer
    );
  });

  micButton.addEventListener("click", () =>
    startMicrophoneInput([...blocksContainer.children])
  );

  window.onresize = createGrid;

  scrubberDraggable.addEventListener("mousedown", () => {
    let isDragging = true;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    function onMouseMove(e) {
      if (!isDragging) return;
      const rect = scrubberContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const progress = Math.max(0, Math.min(x / rect.width, 1));
      scrubber.style.left = progress * rect.width + "px";
      scrubberDraggable.style.left = progress * rect.width - 9 + "px";
      currentTime = progress * trackDuration;
    }

    function onMouseUp() {
      if (isDragging) {
        isDragging = false;
        stopPreviousAudio();
        startPlayback();

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      }
    }
  });
};
