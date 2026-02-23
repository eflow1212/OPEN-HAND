let handpose;
let video;
let predictions = [];
let r;
let factor = 1;
let handInfluence = 0; 
let currentScreen = "title"; 
let font;
let showInstructions = false;

function preload() {
  font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);
  r = height / 2 - 16;
  
  textFont(font);
  textAlign(CENTER, CENTER);
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  handpose = ml5.handpose(video, modelReady);
  
  strokeWeight(2);
  stroke(255, 100);
  noFill();
}

function modelReady() {
  console.log("Handpose model loaded!");
  handpose.on("predict", gotResults);
}

function gotResults(results) {
  predictions = results || [];
}

function getVector(index, total) {
  const angle = map(index % total, 0, total, 0, TWO_PI);
  const v = p5.Vector.fromAngle(angle + PI);
  v.mult(r);
  return v;
}

function draw() {
  if (currentScreen === "title") {
    drawTitleScreen();
  } else if (currentScreen === "experience") {
    drawExperienceScreen();
    drawMenuButton();
    if (showInstructions) {
      drawInstructionsPanel();
    }
  }
}

function drawTitleScreen() {
  background(0);
  
  push();
  noStroke();
  fill(255);
  textSize(windowWidth * 0.08);
  text("OPEN HAND", width/2, height/2 - 80);
  pop();
  
  push();
  fill(255);
  textSize(windowWidth * 0.02);
  text("click anywhere to begin", width/2, height/2 + 80);
  pop();
}

function drawExperienceScreen() {
  background(0, 20); 
  
  const total = 100;
  factor += 0.01; 
  
  translate(width/2, height/2);
  
  if (predictions.length > 0) {
    let hand = predictions[0];
    
    if (hand.landmarks && hand.landmarks.length >= 9) {
      let indexFinger = hand.landmarks[8]; 
      let palmBase = hand.landmarks[0]; 
      
      let handX = indexFinger[0] - width/2;
      let handY = indexFinger[1] - height/2;
      
      let handOpenness = dist(indexFinger[0], indexFinger[1], palmBase[0], palmBase[1]);
      
      r = map(handOpenness, 50, 200, height/4, height/2 - 16, true);
      
      handInfluence = map(dist(0, 0, handX, handY), 0, 300, 0, 1, true);
      
      push();
      stroke(0, 255, 0, 150);
      strokeWeight(4);
      point(handX, handY);
      pop();
      
      let angle = atan2(handY, handX);
      rotate(angle * 0.2);
    }
  } else {
    handInfluence = lerp(handInfluence, 0, 0.05);
  }
  
  stroke(255, 100);
  strokeWeight(2);
  noFill();
  
  let patternShift = handInfluence * 8;
  
  for (let i = 0; i < total - 1; i++) {
    const a = getVector(i, total);
    const b = getVector(i + 12 + patternShift, total);
    const c = getVector((i + 8) * factor, total);
    const d = getVector((i + 3 + patternShift) * factor, total);
    
    bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
  }
}

function drawMenuButton() {
  push();
  resetMatrix(); 
  
  let buttonX = width - 50;
  let buttonY = 50;
  let buttonSize = 40;
  
  noStroke();
  fill(40, 40, 40, 220);
  ellipse(buttonX, buttonY, buttonSize);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("?", buttonX, buttonY-2);
  
  pop();
}

function drawInstructionsPanel() {
  push();
  resetMatrix();
  
  fill(20, 20, 20, 240);
  noStroke();
  let panelWidth = 360;
  let panelHeight = 300;
  let panelX = width - panelWidth - 20;
  let panelY = 80;
  rect(panelX, panelY, panelWidth, panelHeight, 10);
  
  fill(255);
  textAlign(CENTER);
  textSize(24);
  text("HAND INTERACTION", panelX + panelWidth/2, panelY + 30);
  
  stroke(255);
  strokeWeight(1);
  line(panelX + 40, panelY + 50, panelX + panelWidth - 40, panelY + 50);
  
  noStroke();
  textAlign(LEFT);
  textSize(14);
  let lineHeight = 24;
  let textX = panelX + 20;
  let textY = panelY + 80;
  
  let bulletPoints = [
    "Index finger position rotates the pattern",
    "Palm-to-index distance controls pattern size",
    "Hand position affects pattern complexity",
    "Smooth transitions when hand leaves view",
    "Green dot shows your hand position"
  ];
  
  for (let i = 0; i < bulletPoints.length; i++) {
    fill(0, 255, 255);
    rect(textX, textY + i*lineHeight + 6, 6, 6);
    fill(255);
    text(bulletPoints[i], textX + 16, textY + i*lineHeight + 8);
  }
  
  let closeX = panelX + panelWidth - 30;
  let closeY = panelY + 30;
  
  stroke(255);
  strokeWeight(2);
  line(closeX - 7, closeY - 7, closeX + 7, closeY + 7);
  line(closeX - 7, closeY + 7, closeX + 7, closeY - 7);
  
  pop();
}

function mousePressed() {
  if (currentScreen === "title") {
    currentScreen = "experience";
    return;
  }
  
  if (currentScreen === "experience") {
    let buttonX = width - 50;
    let buttonY = 50;
    let buttonSize = 40;
    
    if (dist(mouseX, mouseY, buttonX, buttonY) < buttonSize/2) {
      showInstructions = !showInstructions;
      return;
    }
    
    if (showInstructions) {
      let panelWidth = 360;
      let panelX = width - panelWidth - 20;
      let panelY = 80;
      let closeX = panelX + panelWidth - 30;
      let closeY = panelY + 30;
      
      if (dist(mouseX, mouseY, closeX, closeY) < 15) {
        showInstructions = false;
        return;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  r = height / 2 - 16;
  video.size(width, height);
}
