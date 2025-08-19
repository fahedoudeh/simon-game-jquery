"use strict";

// State
const buttonColours = ["red", "blue", "green", "yellow"];
const gamePattern = [];
let userClickedPattern = [];

let started = false;
let level = 0;
let acceptingInput = false; // block clicks during sequence / game over

// Cache selectors (tiny perf + cleaner)
const $levelTitle = $("#level-title");

// Start game: prefer keydown over keypress, add one-time starter
$(document).on("keydown", () => {
  if (!started) {
    started = true;
    level = 0;
    nextSequence();
  }
});

// Support clicks (and optionally touch)
$(".btn").on("click", function () {
  if (!started || !acceptingInput) return; // ignore when not ready 
  

  const userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);

  playSound(userChosenColour);
  animatePress(userChosenColour);

  checkAnswer(userClickedPattern.length - 1);
});

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    // correct so far
    if (userClickedPattern.length === gamePattern.length) {
      // round complete
      acceptingInput = false;
      setTimeout(nextSequence, 800);
    }
  } else {
    // wrong
    playSound("wrong");
    $("body").addClass("game-over");
    $levelTitle.text("Game Over, Press Any Key to Restart");

    setTimeout(() => $("body").removeClass("game-over"), 200);
    startOver();
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  $levelTitle.text(`Level ${level}`);

  const randomNumber = Math.floor(Math.random() * 4);
  const randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  // Play the latest step (basic version)
  acceptingInput = false;
  flashButton(randomChosenColour).then(() => {
    acceptingInput = true;
  });
}

function flashButton(color) {
  // return a promise so we can await/then if we expand to full-sequence playback
  return new Promise((resolve) => {
    const $el = $(`#${color}`);
    $el.fadeIn(100).fadeOut(100).fadeIn(100);
    playSound(color);
    setTimeout(resolve, 300);
  });
}

function animatePress(color) {
  const $el = $(`#${color}`);
  $el.addClass("pressed");
  setTimeout(() => $el.removeClass("pressed"), 100);
}

function playSound(name) {
  const audio = new Audio(`sounds/${name}.mp3`);
  audio.play().catch(() => {});
}

function startOver() {
  level = 0;
  gamePattern.length = 0; // clear in-place (since it's const)
  userClickedPattern = [];
  started = false;
  acceptingInput = false;
}
