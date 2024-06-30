import { analyzeFrequencies, analyzeMicrophoneInput } from "./frequency.js";
import { updateScrubberPosition } from "./ui.js";

let audioContext;
let source;
let analyser;
let buffer;
let trackDuration;
let isDragging = false;
let startTime = 0;
let currentTime = 0;

function processFile(
  input,
  blocks,
  scrubber,
  scrubberDraggable,
  scrubberContainer
) {
  const file = input.files[0];
  if (!file) return;

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    audioContext.decodeAudioData(e.target.result, function (decodedBuffer) {
      buffer = decodedBuffer;
      trackDuration = buffer.duration;
      currentTime = 0;
      startPlayback();
      startTime = audioContext.currentTime;

      function updateScrubber() {
        if (!isDragging) {
          currentTime = audioContext.currentTime - startTime;
          const progress = currentTime / trackDuration;
          updateScrubberPosition(
            scrubber,
            scrubberDraggable,
            scrubberContainer,
            progress
          );
        }
        requestAnimationFrame(updateScrubber);
      }

      updateScrubber();
      analyzeFrequencies(analyser, audioContext, blocks);
    });
  };

  reader.readAsArrayBuffer(file);
}

function startPlayback() {
  stopPreviousAudio();
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

function stopPreviousAudio() {
  if (source) {
    source.stop();
    source.disconnect();
  }
}

function startMicrophoneInput(blocks) {
  const audioContext = new AudioContext();
  let analyser = audioContext.createAnalyser();
  analyser.fftSize = 1024;

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function (stream) {
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyzeMicrophoneInput(analyser, audioContext, blocks);
    })
    .catch(function (err) {
      console.error("Error accessing microphone input: " + err);
    });
}

export { processFile, startMicrophoneInput };
