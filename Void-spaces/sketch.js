// Import the functions you need from the SDKs you need
//import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
//import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
//import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyBHa9CiIxr2AtYJRFJ5ZXmR5pszgCJ8nZE",
  authDomain: "shared-minds-void-letters.firebaseapp.com",
  databaseURL: "https://shared-minds-void-letters-default-rtdb.firebaseio.com",
  projectId: "shared-minds-void-letters",
  storageBucket: "shared-minds-void-letters.appspot.com",
  messagingSenderId: "828962089602",
  appId: "1:828962089602:web:a2a0f5f2211c5586d7229b",
  measurementId: "G-3Y1CYM8P3Z"
};

let database;
let currentQuestionIndex = 0;
let userAnswers = [];
let currentAnswer = "";
let userName = "";
let name2 = "";
let backgroundImage;
let mouseClickPositions = [];
let isFirstVisit = true;
let displayNameOnce = true; // Flag to display the name only once

let questions = [
  "Get out of your head space, where are you? ",
  "Describe what properties you like about it",
  "Is it a public or private space? Are there other people there?",
  "Is it bright or dark?",
  "Could you describe how it smells?",
];

function preload() {
  backgroundImage = loadImage('topo.jpeg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(LEFT, TOP);

  firebase.initializeApp(firebaseConfig);
  database = firebase.database();

  if (isFirstVisit) {
    retrieveDataFromFirebase();
    isFirstVisit = false;
  }

  init();
  createInputField();
}

function draw() {
  background(backgroundImage);
  textSize(40);
  text('Void Spaces', (2 * width / 3), (height / 9));
  textSize(18);
  text("Click anywhere on the canvas to display your answers", 100, 100);
  textSize(40);
  placeUsersAnswers() ;
  displayQuestion();
}

function createInputField() {
  const input = createInput("");
  input.position(20, height / 2);
  input.size(400, 30);
  input.input(handleInput);

  const submitButton = createButton("Submit Answer");
  submitButton.position(20, height / 2 + 40);
  submitButton.mousePressed(submitAnswer);
}

function handleInput() {
  currentAnswer = this.value();
}

function keyPressed() {
  if (keyCode === ENTER) {
    submitAnswer();
    createInputField();
  }
}

function mouseClicked() {
  mouseClickPositions.push({ x: mouseX, y: mouseY });
  placeUsersAnswers();
  console.log(mouseClickPositions);
}

function submitAnswer() {
  let currentQuestion = questions[currentQuestionIndex];

  database.ref("answers").push({
    Name: name2,
    question: currentQuestion,
    answer: currentAnswer,
    mousePo: mouseClickPositions
  });

  userAnswers.push(`Name: ${name2}\nA: ${currentAnswer}`);
  currentAnswer = "";

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    noLoop();
  }
}

function init() {
  name2 = prompt("Enter Your Name Here");
  if (name2) {
    askForExistingUser(name2);
  }
}

function askForExistingUser(name2) {
  const usersRef = database.ref('users/' + name2);
  usersRef.once('value').then((snapshot) => {
    if (!snapshot.exists()) {
      console.log("New user");
      database.ref('users/' + name2).set({
        userName: name2
      });
    }
  });
}

function displayQuestion() {
  fill(0);
  textSize(28);
  if (currentQuestionIndex < questions.length) {
    text(questions[currentQuestionIndex], 30, height / 3);
  } else {
    text("Your answers are now in the void", 30, height / 3);
  }
}


function placeUsersAnswers() {
  
  for (let i = 0; i < mouseClickPositions.length; i++) {
    const x = mouseClickPositions[i].x;
    const y = mouseClickPositions[i].y;

    const textField2 = createDiv("");
    textField2.position(x, y);
    textField2.size(200);

    const myRef = database.ref("answers").limitToLast(18);
    myRef.on("child_added", (snapshot) => {
      const data = snapshot.val();
      newText = data.Name + ": " + data.answer + "," + "<br>";
      textField2.html(newText, true);
    });

  }
}
//create a function that pulls previous 18 mouseX and mouseY posiiton and places the 
//  previewed asnwers on the page  

// function displayPosition(x,y) {
//   const myPos = database.ref("position").limitToLast(18);
//   myPos.on("child_added", (snapshot) => {
//     const position = snapshot.val();
//     const x = position.x;
//     const y = position.y;
//     //return x y 
//     return (x,y);
//     // Create a div element to display the position
//     // const div = createDiv("X: " + x + ", Y: " + y);
//     // div.position(x, y);
//   });
// }

function saveDataToFirebase() {
  const dataToSave = {
    mouseClickPositions: mouseClickPositions,
    answersData: answersData
  };
  database.ref('userData').set(dataToSave);
}

function retrieveDataFromFirebase() {
  const dataRef = database.ref('userData');
  dataRef.once('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      mouseClickPositions = data.mouseClickPositions || [];
      answersData = data.answersData || [];
      console.log("data found")
      placeUsersAnswers();
    }
  });
}
