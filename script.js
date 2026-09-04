const BOARD_SIZE = 5;
const WIN_LENGTH = 4;

const cells = [
  ...document.querySelectorAll(".cell")
];

const boardEl =
  document.getElementById("board");

const statusText =
  document.getElementById("statusText");

const statusDot =
  document.getElementById("statusDot");

const winLine =
  document.getElementById("winLine");

const resultModal =
  document.getElementById("resultModal");

const userScoreEl =
  document.getElementById("userScore");

const cpuScoreEl =
  document.getElementById("cpuScore");

const drawScoreEl =
  document.getElementById("drawScore");


let board = Array(25).fill("");

let gameOver = false;
let thinking = false;


/* ================================
   SCORE
================================ */

let scores =
  JSON.parse(
    localStorage.getItem("ttt5Scores")
  ) || {
    user: 0,
    cpu: 0,
    draw: 0
  };


function updateScores() {

  userScoreEl.textContent =
    scores.user;

  cpuScoreEl.textContent =
    scores.cpu;

  drawScoreEl.textContent =
    scores.draw;

  localStorage.setItem(
    "ttt5Scores",
    JSON.stringify(scores)
  );
}

updateScores();


/* ================================
   THEME
================================ */

const savedTheme =
  localStorage.getItem("tttTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}


document
  .getElementById("themeBtn")
  .onclick = () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
      "tttTheme",
      document.body.classList.contains("dark")
        ? "dark"
        : "light"
    );
  };


/* ================================
   START GAME
================================ */

function startGame() {

  board = Array(25).fill("");

  gameOver = false;
  thinking = false;

  winLine.classList.remove("show");
  winLine.style.display = "none";

  cells.forEach(cell => {

    cell.textContent = "";

    cell.className = "cell";

  });

  statusText.textContent =
    "Your turn";

  statusDot.classList.add("live");
}


/* ================================
   NEW GAME
================================ */

document
  .getElementById("newGameBtn")
  .onclick = () => {

    resultModal.classList.add("hidden");

    startGame();
  };


/* ================================
   PLAY AGAIN
================================ */

document
  .getElementById("playAgainBtn")
  .onclick = () => {

    resultModal.classList.add("hidden");

    startGame();
  };


/* ================================
   RESET SCORE
================================ */

document
  .getElementById("resetScoreBtn")
  .onclick = () => {

    scores = {
      user: 0,
      cpu: 0,
      draw: 0
    };

    updateScores();
  };


/* ================================
   PLAYER MOVE
================================ */

cells.forEach(cell => {

  cell.onclick = () => {

    const index =
      Number(cell.dataset.index);

    if (
      gameOver ||
      thinking ||
      board[index]
    ) {
      return;
    }


    placeMove(index, "X");


    const result =
      checkWinner(board);


    if (result) {

      finishGame(result);

      return;
    }


    thinking = true;

    statusText.textContent =
      "Computer is thinking…";

    statusDot.classList.remove("live");


    setTimeout(() => {

      if (gameOver) return;


      const computerMove =
        getComputerMove();


      if (computerMove !== null) {

        placeMove(
          computerMove,
          "O"
        );
      }


      const computerResult =
        checkWinner(board);


      thinking = false;


      if (computerResult) {

        finishGame(computerResult);

      } else {

        statusText.textContent =
          "Your turn";

        statusDot.classList.add("live");
      }

    }, 280);

  };

});


/* ================================
   PLACE MOVE
================================ */

function placeMove(index, player) {

  board[index] = player;

  const cell = cells[index];

  cell.textContent =
    player === "X"
      ? "×"
      : "○";

  cell.classList.add(
    player === "X"
      ? "x"
      : "o"
  );

  cell.classList.add("pop");
}


/* ================================
   CHECK WINNER
================================ */

function checkWinner(state) {

  const directions = [

    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal down-right
    [1, -1]   // diagonal down-left

  ];


  for (
    let row = 0;
    row < BOARD_SIZE;
    row++
  ) {

    for (
      let col = 0;
      col < BOARD_SIZE;
      col++
    ) {

      const start =
        row * BOARD_SIZE + col;

      const player =
        state[start];

      if (!player) continue;


      for (
        const [dr, dc]
        of directions
      ) {

        const line = [start];


        for (
          let step = 1;
          step < WIN_LENGTH;
          step++
        ) {

          const r =
            row + dr * step;

          const c =
            col + dc * step;


          if (
            r < 0 ||
            r >= BOARD_SIZE ||
            c < 0 ||
            c >= BOARD_SIZE
          ) {

            break;
          }


          const index =
            r * BOARD_SIZE + c;


          if (
            state[index] !== player
          ) {

            break;
          }


          line.push(index);
        }


        if (
          line.length === WIN_LENGTH
        ) {

          return {
            winner: player,
            line: line
          };

        }

      }

    }

  }


  if (
    state.every(Boolean)
  ) {

    return {
      winner: "draw",
      line: null
    };

  }


  return null;
}


/* ================================
   FINISH GAME
================================ */

function finishGame(result) {

  gameOver = true;

  thinking = false;

  statusDot.classList.remove("live");


  if (result.line) {

    drawWinLine(
      result.line
    );

  }


  setTimeout(() => {

    if (
      result.winner === "X"
    ) {

      scores.user++;

      showResult(
        "×",
        "You Win!",
        "Great move."
      );

    }

    else if (
      result.winner === "O"
    ) {

      scores.cpu++;

      showResult(
        "○",
        "Computer Wins",
        "Good game. Try again."
      );

    }

    else {

      scores.draw++;

      showResult(
        "=",
        "It's a Draw",
        "Neither side gave way."
      );

    }


    updateScores();

  }, result.line ? 420 : 220);
}


/* ================================
   RESULT POPUP
================================ */

function showResult(
  icon,
  title,
  subtitle
) {

  document.getElementById(
    "resultIcon"
  ).textContent = icon;

  document.getElementById(
    "resultTitle"
  ).textContent = title;

  document.getElementById(
    "resultSubtitle"
  ).textContent = subtitle;

  resultModal.classList.remove(
    "hidden"
  );
}


/* ==================================================
   FIXED WINNING LINE
   ==================================================

   IMPORTANT:

   The old version calculated the line using
   the first and last cells' screen positions.

   On a CSS grid with padding and gaps, that can
   cause the line to appear slightly offset.

   This version calculates the exact center of
   every winning cell relative to the board.

   It then uses the first and LAST winning-cell
   centers to draw the line.

   This works for:

       XXXX
       |
       |
       XXXX

   and both diagonals.
================================================== */

function drawWinLine(line) {

  if (
    !line ||
    line.length < 2
  ) {
    return;
  }


  /*
    Get the board's exact position.
  */

  const boardRect =
    boardEl.getBoundingClientRect();


  /*
    First winning square.
  */

  const firstCell =
    cells[line[0]]
      .getBoundingClientRect();


  /*
    Last winning square.
  */

  const lastCell =
    cells[line[line.length - 1]]
      .getBoundingClientRect();


  /*
    Calculate the CENTER of the first cell
    relative to the board.
  */

  const startX =
    firstCell.left +
    firstCell.width / 2 -
    boardRect.left;


  const startY =
    firstCell.top +
    firstCell.height / 2 -
    boardRect.top;


  /*
    Calculate the CENTER of the last cell
    relative to the board.
  */

  const endX =
    lastCell.left +
    lastCell.width / 2 -
    boardRect.left;


  const endY =
    lastCell.top +
    lastCell.height / 2 -
    boardRect.top;


  /*
    Calculate exact distance between centers.
  */

  const deltaX =
    endX - startX;


  const deltaY =
    endY - startY;


  const length =
    Math.sqrt(
      deltaX * deltaX +
      deltaY * deltaY
    );


  /*
    Calculate exact angle.

    Horizontal = 0°
    Vertical = 90°
    Diagonal = ±45°
  */

  const angle =
    Math.atan2(
      deltaY,
      deltaX
    ) * 180 / Math.PI;


  /*
    Position the line.

    IMPORTANT:

    The line's transform-origin is LEFT CENTER,
    so its left/top coordinates begin exactly
    at the center of the first winning square.
  */

  winLine.style.left =
    `${startX}px`;


  winLine.style.top =
    `${startY - 2.5}px`;


  winLine.style.width =
    `${length}px`;


  winLine.style.height =
    "5px";


  winLine.style.setProperty(
    "--angle",
    `${angle}deg`
  );


  /*
    Match line color to winner.
  */

  winLine.style.color =
    board[line[0]] === "X"
      ? "#007aff"
      : "#ff3b30";


  /*
    Make sure the line is visible.
  */

  winLine.style.display =
    "block";


  /*
    Restart animation cleanly.

    This is useful when the user starts
    multiple games quickly.
  */

  winLine.classList.remove("show");

  void winLine.offsetWidth;

  winLine.classList.add("show");
}


/* ==================================================
   COMPUTER AI
================================================== */

function getComputerMove() {

  const available =
    getAvailableMoves();


  if (!available.length) {
    return null;
  }


  /*
    Always take an immediate winning move.
  */

  const winningMove =
    findImmediateMove("O");


  if (
    winningMove !== null
  ) {

    return winningMove;
  }


  /*
    Usually block the player.
  */

  const playerThreat =
    findImmediateMove("X");


  if (
    playerThreat !== null &&
    Math.random() < 0.88
  ) {

    return playerThreat;
  }


  /*
    Evaluate possible positions.
  */

  const scoredMoves =
    available.map(index => {

      return {
        index: index,
        score:
          evaluateMove(index)
      };

    });


  scoredMoves.sort(
    (a, b) =>
      b.score - a.score
  );


  /*
    Strong move most of the time.
  */

  const roll =
    Math.random();


  if (
    roll < 0.60
  ) {

    return scoredMoves[0].index;
  }


  /*
    Pick from the three strongest moves.
  */

  if (
    roll < 0.86
  ) {

    const top =
      scoredMoves.slice(
        0,
        Math.min(
          3,
          scoredMoves.length
        )
      );


    return randomItem(top).index;
  }


  /*
    Deliberately imperfect move.
  */

  const topHalf =
    scoredMoves.slice(
      0,
      Math.max(
        1,
        Math.ceil(
          scoredMoves.length * 0.55
        )
      )
    );


  return randomItem(
    topHalf
  ).index;
}


/* ================================
   IMMEDIATE MOVE
================================ */

function findImmediateMove(player) {

  for (
    let i = 0;
    i < board.length;
    i++
  ) {

    if (board[i]) continue;


    board[i] = player;


    const result =
      checkWinner(board);


    board[i] = "";


    if (
      result &&
      result.winner === player
    ) {

      return i;
    }

  }


  return null;
}


/* ================================
   EVALUATE MOVE
================================ */

function evaluateMove(index) {

  const row =
    Math.floor(
      index / BOARD_SIZE
    );


  const col =
    index % BOARD_SIZE;


  let score = 0;


  /*
    Center preference.
  */

  const center =
    (BOARD_SIZE - 1) / 2;


  const distance =
    Math.abs(row - center) +
    Math.abs(col - center);


  score +=
    (BOARD_SIZE - distance) * 2;


  /*
    Corners.
  */

  const isCorner =
    (
      (row === 0 || row === 4) &&
      (col === 0 || col === 4)
    );


  if (isCorner) {
    score += 3;
  }


  /*
    Simulate computer move.
  */

  board[index] = "O";


  score +=
    countPotentialLines("O") * 2;


  const threats =
    countImmediateThreats("O");


  score +=
    threats * 7;


  /*
    Examine opponent potential.
  */

  board[index] = "X";


  score -=
    countPotentialLines("X") * 1.7;


  board[index] = "";


  /*
    Small variation makes the computer
    less predictable.
  */

  score +=
    Math.random() * 4;


  return score;
}


/* ================================
   POTENTIAL LINES
================================ */

function countPotentialLines(player) {

  let total = 0;


  const directions = [

    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]

  ];


  for (
    let row = 0;
    row < BOARD_SIZE;
    row++
  ) {

    for (
      let col = 0;
      col < BOARD_SIZE;
      col++
    ) {

      for (
        const [dr, dc]
        of directions
      ) {

        let playerCount = 0;
        let emptyCount = 0;


        for (
          let step = 0;
          step < WIN_LENGTH;
          step++
        ) {

          const r =
            row + dr * step;


          const c =
            col + dc * step;


          if (
            r < 0 ||
            r >= BOARD_SIZE ||
            c < 0 ||
            c >= BOARD_SIZE
          ) {

            playerCount = -1;

            break;
          }


          const value =
            board[
              r * BOARD_SIZE + c
            ];


          if (
            value === player
          ) {

            playerCount++;

          }

          else if (
            value === ""
          ) {

            emptyCount++;

          }

          else {

            playerCount = -1;

            break;
          }

        }


        if (
          playerCount > 0 &&
          playerCount + emptyCount === WIN_LENGTH
        ) {

          total++;
        }

      }

    }

  }


  return total;
}


/* ================================
   IMMEDIATE THREATS
================================ */

function countImmediateThreats(player) {

  let threats = 0;


  for (
    let i = 0;
    i < board.length;
    i++
  ) {

    if (board[i]) continue;


    board[i] = player;


    const result =
      checkWinner(board);


    board[i] = "";


    if (
      result &&
      result.winner === player
    ) {

      threats++;
    }

  }


  return threats;
}


/* ================================
   AVAILABLE MOVES
================================ */

function getAvailableMoves() {

  const moves = [];


  for (
    let i = 0;
    i < board.length;
    i++
  ) {

    if (!board[i]) {

      moves.push(i);
    }

  }


  return moves;
}


/* ================================
   RANDOM ITEM
================================ */

function randomItem(array) {

  return array[
    Math.floor(
      Math.random() *
      array.length
    )
  ];
}


/* ================================
   START
================================ */

startGame();