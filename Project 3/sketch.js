/*
PROJECT 3 - SOUND PAINT PAD
Click anywhere to play a note and create a visual bubble.
Higher clicks = higher notes.
The waveform controls the bubble growth.
*/

let circles = [];
let radiusRange = 120;
let currentPeak = 0;

// Tone.js objects
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: {
    type: "sine"
  },
  envelope: {
    attack: 0.02,
    decay: 0.1,
    sustain: 0.3,
    release: 0.8
  }
});

Tone.Destination.volume.value = -12;

const reverb = new Tone.Reverb({
  decay: 2,
  wet: 0.35
});

const waveform = new Tone.Waveform(1024);

synth.connect(reverb);
reverb.toDestination();
reverb.connect(waveform);

// notes from low to high
let notes = ["C4", "D4", "E4", "G4", "A4", "C5"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  textAlign(CENTER, CENTER);
}

function draw() {
  background(15, 20, 35, 40);

  // read waveform and find peak
  let data = waveform.getValue();
  let peak = 0;

  for (let i = 0; i < data.length; i++) {
    let v = abs(data[i]);
    if (v > peak) {
      peak = v;
    }
  }

  currentPeak = lerp(currentPeak, peak, 0.2);

  // draw and update circles
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];

    c.life -= 3;
    c.baseSize += 0.4;

    let soundSize = c.baseSize + currentPeak * radiusRange;

    fill(c.r, c.g, c.b, c.life);
    ellipse(c.x, c.y, soundSize);

    // small inner glow
    fill(255, 255, 255, c.life * 0.4);
    ellipse(c.x, c.y, soundSize * 0.35);

    if (c.life <= 0) {
      circles.splice(i, 1);
    }
  }

  // title text
  fill(255);
  textSize(28);
  text("Sound Paint Pad", width / 2, 40);

  textSize(16);
  text("Click anywhere to play notes and paint with sound", width / 2, 75);
}

async function mousePressed() {
  if (Tone.context.state !== "running") {
    await Tone.start();
  }

  let note = getNoteFromY(mouseY);
  synth.triggerAttackRelease(note, "8n");

  circles.push({
    x: mouseX,
    y: mouseY,
    baseSize: 30,
    life: 255,
    r: random(100, 255),
    g: random(100, 255),
    b: random(100, 255)
  });
}

function getNoteFromY(y) {
  let index = floor(map(y, 0, height, notes.length - 1, 0));
  index = constrain(index, 0, notes.length - 1);
  return notes[index];
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}