import { analyzeFrequencies, analyzeMicrophoneInput } from "./frequency.js";
import { updateScrubberPosition } from "./ui.js";

let audioContext;
let source;
let analyser;
let buffer;
let startTime = 0;
window.currentTime = 0;
window.trackDuration = 0;

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
      window.trackDuration = buffer.duration;
      window.currentTime = 0;
      startPlayback();
      startTime = audioContext.currentTime;

      function updateScrubber() {
        if (!window.isDragging) {
          window.currentTime = audioContext.currentTime - startTime;
          const progress = window.currentTime / window.trackDuration;
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
  source.start(0, window.currentTime);

  startTime = audioContext.currentTime - window.currentTime;
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

export { stopPreviousAudio, startPlayback, processFile, startMicrophoneInput };
