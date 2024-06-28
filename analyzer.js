function processFile(input) {
  const file = input.files[0];
  if (!file) return;

  const audioContext = new AudioContext();
  const reader = new FileReader();

  const blocks = [...document.querySelector(".blocks").children];

  const ranges = {
    subBass: { start: 20, end: 60 },
    bass: { start: 60, end: 250 },
    lowMids: { start: 250, end: 500 },
    mids: { start: 500, end: 2000 },
    highMids: { start: 2000, end: 4000 },
    lowerHighs: { start: 4000, end: 6000 },
    highs: { start: 6000, end: 20000 },
  };

  const maxValues = [
    600, // Sub-bass
    2000, // Bass
    2500, // Low-mids
    10000, // Mids
    10000, // High-mids
    8000, // Lower highs
    20000, // Highs
  ];

  const scrubber = document.getElementById("scrubber");
  const scrubberDraggable = document.getElementById("scrubber-draggable");
  const scrubberContainer = document.getElementById("scrubber-container");

  let source;
  let analyser;
  let trackDuration;
  let isDragging = false;
  let startTime = 0;
  let currentTime = 0;
  let buffer;

  reader.onload = function (e) {
    audioContext.decodeAudioData(e.target.result, function (decodedBuffer) {
      buffer = decodedBuffer;
      trackDuration = buffer.duration;
      startPlayback();
      startTime = audioContext.currentTime;

      function updateScrubber() {
        if (!isDragging) {
          currentTime = audioContext.currentTime - startTime;
          const progress = currentTime / trackDuration;
          scrubber.style.left = progress * scrubberContainer.offsetWidth + "px";
          scrubberDraggable.style.left =
            progress * scrubberContainer.offsetWidth - 9 + "px"; // Adjust the draggable area position
        }
        requestAnimationFrame(updateScrubber);
      }

      updateScrubber();
      analyzeFrequencies();
    });
  };

  reader.readAsArrayBuffer(file);

  function startPlayback() {
    source = audioContext.createBufferSource();
    source.buffer = buffer;

    if (!analyser) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
    }

    source.connect(analyser);
    analyser.connect(audioContext.destination);
    source.start(0, currentTime);

    startTime = audioContext.currentTime - currentTime;
  }

  function analyzeFrequencies() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function getFrequencyData() {
      analyser.getByteFrequencyData(dataArray);

      const sampleRate = audioContext.sampleRate;
      const nyquist = sampleRate / 2;
      const freqPerIndex = nyquist / bufferLength;

      let subBassSum = 0;
      let bassSum = 0;
      let lowMidsSum = 0;
      let midsSum = 0;
      let highMidsSum = 0;
      let lowerHighsSum = 0;
      let highsSum = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const frequency = i * freqPerIndex;
        if (frequency < ranges.subBass.end) {
          if (frequency >= ranges.subBass.start) subBassSum += dataArray[i];
        } else if (frequency < ranges.bass.end) {
          bassSum += dataArray[i];
        } else if (frequency < ranges.lowMids.end) {
          lowMidsSum += dataArray[i];
        } else if (frequency < ranges.mids.end) {
          midsSum += dataArray[i];
        } else if (frequency < ranges.highMids.end) {
          highMidsSum += dataArray[i];
        } else if (frequency < ranges.lowerHighs.end) {
          lowerHighsSum += dataArray[i];
        } else if (frequency <= ranges.highs.end) {
          highsSum += dataArray[i];
        }
      }

      const frequencyValues = [
        subBassSum,
        bassSum,
        lowMidsSum,
        midsSum,
        highMidsSum,
        lowerHighsSum,
        highsSum,
      ];

      for (let i = 0; i < blocks.length; i++) {
        const value = frequencyValues[i % frequencyValues.length];
        const maxValue = maxValues[i % maxValues.length];
        const scale = 0.5 + (value / maxValue) * 1.0;
        blocks[i].style.transform = `scale(${Math.min(scale, 1.3)})`;
        blocks[i].style.opacity = Math.min(scale, 1);
      }

      setTimeout(getFrequencyData, 20);
    }

    getFrequencyData();
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const rect = scrubberContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(x / rect.width, 1));
    scrubber.style.left = progress * rect.width + "px";
    scrubberDraggable.style.left = progress * rect.width - 9 + "px"; // Adjust the draggable area position
    currentTime = progress * trackDuration;
  }

  function onMouseUp() {
    if (isDragging) {
      isDragging = false;
      source.stop();
      startPlayback();

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }
  }

  scrubberDraggable.addEventListener("mousedown", () => {
    isDragging = true;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });
}

window.onload = () => {
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

  createGrid();
  window.onresize = createGrid;
};
