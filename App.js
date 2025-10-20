const boxes = document.querySelectorAll('.box');
const resetBtn = document.querySelector('#reset-btn');
const newGameBtn = document.querySelector('#new-btn');
const msgContainer = document.querySelector('.msg-container');
const msg = document.querySelector('#msg');
const modeSelect = document.querySelector('#mode-select');
const darkToggle = document.querySelector('#darkModeToggle');
const xScoreEl = document.querySelector('#x-score');
const oScoreEl = document.querySelector('#o-score');
const drawScoreEl = document.querySelector('#draw-score');
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');

let turnO = true;
let count = 0;
let scores = { X: 0, O: 0, Draw: 0 };
let gameOver = false;
let confettiParticles = [];

confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

darkToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark', darkToggle.checked);
});

const resetGame = () => {
  turnO = true;
  count = 0;
  gameOver = false;
  boxes.forEach(b => {
    b.innerText = "";
    b.classList.remove('winner');
    b.disabled = false;
  });
  msgContainer.classList.add('hide');
  confettiParticles = [];
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
};

const disableBoxes = () => boxes.forEach(b => b.disabled = true);
const updateScores = () => {
  xScoreEl.innerText = scores.X;
  oScoreEl.innerText = scores.O;
  drawScoreEl.innerText = scores.Draw;
};

const showWinner = (winner, pattern) => {
  msg.innerText = `🎉 ${winner} Wins!`;
  msgContainer.classList.remove('hide');
  pattern.forEach(i => boxes[i].classList.add('winner'));
  scores[winner]++;
  updateScores();
  disableBoxes();
  launchConfetti();
  gameOver = true;
};

const showDraw = () => {
  msg.innerText = "😐 It's a Draw!";
  msgContainer.classList.remove('hide');
  scores.Draw++;
  updateScores();
  gameOver = true;
};

const checkWinner = () => {
  for (let pattern of winPatterns) {
    const [a,b,c] = pattern;
    const v1 = boxes[a].innerText;
    const v2 = boxes[b].innerText;
    const v3 = boxes[c].innerText;
    if (v1 && v1 === v2 && v2 === v3) {
      showWinner(v1, pattern);
      return true;
    }
  }
  if (count === 9 && !gameOver) showDraw();
  return false;
};

// --- Smart AI using Minimax ---
const bestMove = () => {
  let bestScore = -Infinity;
  let move;
  let board = [...boxes].map(b => b.innerText || "");

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "X";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

const scoresAI = { X: 1, O: -1, Draw: 0 };

function minimax(board, depth, isMaximizing) {
  let winner = evaluateBoard(board);
  if (winner !== null) return scoresAI[winner];

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = "";
      }
    }
    return best;
  }
}

function evaluateBoard(board) {
  for (let [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(cell => cell !== "")) return "Draw";
  return null;
}

const aiMove = () => {
  if (gameOver) return;
  let move = bestMove();
  if (move !== undefined) {
    boxes[move].innerText = "X";
    boxes[move].style.color = "#ee4b6a";
    boxes[move].disabled = true;
    count++;
    checkWinner();
    turnO = true;
  }
};

boxes.forEach(box => {
  box.addEventListener('click', () => {
    if (gameOver || box.innerText !== "") return;

    if (turnO) {
      box.innerText = "O";
      box.style.color = "#0f7173";
      box.disabled = true;
      count++;
      if (!checkWinner()) {
        turnO = false;
        if (modeSelect.value === "ai") {
          setTimeout(aiMove, 500);
        }
      }
    } else if (modeSelect.value === "2p") {
      box.innerText = "X";
      box.style.color = "#ee4b6a";
      box.disabled = true;
      count++;
      checkWinner();
      turnO = true;
    }
  });
});

newGameBtn.addEventListener('click', resetGame);
resetBtn.addEventListener('click', resetGame);

// --- Confetti ---
function launchConfetti() {
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height - confettiCanvas.height,
      r: Math.random() * 6 + 2,
      d: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`
    });
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
  updateConfetti();
  requestAnimationFrame(drawConfetti);
}

function updateConfetti() {
  confettiParticles.forEach(p => {
    p.y += p.d;
    if (p.y > confettiCanvas.height) p.y = 0 - p.r;
  });
}

drawConfetti();
