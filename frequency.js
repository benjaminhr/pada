import { ranges, maxValues } from "./constants.js";

function analyzeFrequencies(analyser, audioContext, blocks) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function getFrequencyData() {
    analyser.getByteFrequencyData(dataArray);
    const frequencyValues = calculateFrequencyValues(
      dataArray,
      audioContext.sampleRate,
      bufferLength
    );
    updateBlocks(blocks, frequencyValues);
    setTimeout(getFrequencyData, 20);
  }

  getFrequencyData();
}

function analyzeMicrophoneInput(analyser, audioContext, blocks) {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function getFrequencyData() {
    analyser.getByteFrequencyData(dataArray);
    const frequencyValues = calculateFrequencyValues(
      dataArray,
      audioContext.sampleRate,
      bufferLength
    );
    updateBlocks(blocks, frequencyValues);
    setTimeout(getFrequencyData, 20);
  }

  getFrequencyData();
}

function calculateFrequencyValues(dataArray, sampleRate, bufferLength) {
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

  return [
    subBassSum,
    bassSum,
    lowMidsSum,
    midsSum,
    highMidsSum,
    lowerHighsSum,
    highsSum,
  ];
}

function updateBlocks(blocks, frequencyValues) {
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
}

export { analyzeFrequencies, analyzeMicrophoneInput };
