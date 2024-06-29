// Initialize variables for HTML elements
const micButton = document.getElementById("mic-button");
const fileInput = document.getElementById("actual-btn");
const blocksContainer = document.querySelector(".blocks");
const scrubber = document.getElementById("scrubber");
const scrubberDraggable = document.getElementById("scrubber-draggable");
const scrubberContainer = document.getElementById("scrubber-container");

// Define frequency ranges and max values for visualization
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
  500, // Sub-bass
  1800, // Bass
  2500, // Low-mids
  10000, // Mids
  10000, // High-mids
  8000, // Lower highs
  20000, // Highs
];

// Function to process the uploaded MP3 file
function processFile(input) {
  const file = input.files[0];
  if (!file) return;

  const audioContext = new AudioContext();
  const reader = new FileReader();

  const blocks = [...document.querySelector(".blocks").children];

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
        const rotation = Math.max(0.5, Math.min(scale, 1.5)) * 180;

        blocks[i].style.transform = `scale(${Math.max(
          0.5,
          Math.min(scale, 1.3)
        )}) rotate(${rotation}deg)`;
        blocks[i].style.opacity = Math.min(scale, 1);

        const maxBlur = 3.5;
        const blurValue = (1 - scale) * maxBlur;
        blocks[i].style.filter = `blur(${blurValue}px)`;
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
    scrubberDraggable.style.left = progress * rect.width - 9 + "px";
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
      // block.style.backgroundColor =
      //   palette[Math.floor(Math.random() * palette.length + 0)];
      blocksContainer.appendChild(block);
    }
  }

  createGrid();
  window.onresize = createGrid;

  fileInput.addEventListener("change", function () {
    processFile(this);
  });

  // Function to handle mic button click and start microphone input
  function startMicrophoneInput() {
    console.log("Starting microphone input");
    const audioContext = new AudioContext();
    let analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;

    // Get microphone audio stream
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        // analyser.connect(audioContext.destination);

        // Start analyzing and visualizing microphone input
        analyzeMicrophoneInput();
      })
      .catch(function (err) {
        console.error("Error accessing microphone input: " + err);
      });

    function analyzeMicrophoneInput() {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function getFrequencyData() {
        analyser.getByteFrequencyData(dataArray);

        // Calculate sums for each frequency range
        let subBassSum = 0;
        let bassSum = 0;
        let lowMidsSum = 0;
        let midsSum = 0;
        let highMidsSum = 0;
        let lowerHighsSum = 0;
        let highsSum = 0;

        const sampleRate = audioContext.sampleRate;
        const nyquist = sampleRate / 2;
        const freqPerIndex = nyquist / bufferLength;

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

        // Calculate frequency values
        const frequencyValues = [
          subBassSum,
          bassSum,
          lowMidsSum,
          midsSum,
          highMidsSum,
          lowerHighsSum,
          highsSum,
        ];

        // Update UI with frequency values
        const blocks = [...blocksContainer.children];
        blocks.forEach((block, index) => {
          const value = frequencyValues[index % frequencyValues.length];
          const maxValue = maxValues[index % maxValues.length];
          const scale = 0.5 + (value / maxValue) * 1.0;
          const rotation = Math.max(0.5, Math.min(scale, 1.5)) * 180;

          block.style.transform = `scale(${Math.max(
            0.5,
            Math.min(scale, 1.3)
          )}) rotate(${rotation}deg)`;
          block.style.opacity = Math.min(scale, 1);

          const maxBlur = 3.5;
          const blurValue = (1 - scale) * maxBlur;
          block.style.filter = `blur(${blurValue}px)`;
        });

        // Schedule next update
        setTimeout(getFrequencyData, 20);
      }

      // Start frequency analysis
      getFrequencyData();
    }
  }

  // Event listener for mic button click to start microphone input
  micButton.addEventListener("click", startMicrophoneInput);
};
