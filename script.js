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


let board =
  Array(25).fill("");

let gameOver = false;

let thinking = false;


/*
  Scores persist between games.
*/

let scores =
  JSON.parse(
    localStorage.getItem("ttt5Scores")
  ) || {
    user: 0,
    cpu: 0,
    draw: 0
  };


/*
  Restore appearance.
*/

const savedTheme =
  localStorage.getItem("tttTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
}


/*
  SCORE
*/

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


/*
  START GAME
*/

function startGame() {

  board =
    Array(25).fill("");

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


/*
  NEW GAME
*/

document
  .getElementById("newGameBtn")
  .onclick = () => {

    resultModal.classList.add("hidden");

    startGame();
  };


/*
  PLAY AGAIN
*/

document
  .getElementById("playAgainBtn")
  .onclick = () => {

    resultModal.classList.add("hidden");

    startGame();
  };


/*
  RESET SCORE
*/

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


/*
  DARK / LIGHT MODE
*/

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


/*
  PLAYER MOVE
*/

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


    /*
      Short delay makes the computer
      feel natural rather than instant.
    */

    setTimeout(() => {

      if (gameOver) return;

      const computerMove =
        getComputerMove();

      placeMove(
        computerMove,
        "O"
      );

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


/*
  PLACE MOVE
*/

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


/*
  CHECK ALL WINNING LINES
*/

function checkWinner(state) {

  const directions = [

    [0, 1],   // horizontal
    [1, 0],   // vertical
    [1, 1],   // diagonal
    [1, -1]   // diagonal
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


      for (const [dr, dc] of directions) {

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
            line
          };
        }

      }

    }

  }


  /*
    Full board = draw.
  */

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


/*
  FINISH GAME
*/

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


/*
  RESULT POPUP
*/

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


/*
  WINNING LINE
*/

function drawWinLine(line) {

  const first =
    cells[line[0]]
      .getBoundingClientRect();

  const last =
    cells[line[line.length - 1]]
      .getBoundingClientRect();

  const boardRect =
    boardEl.getBoundingClientRect();


  const x1 =
    first.left +
    first.width / 2 -
    boardRect.left;

  const y1 =
    first.top +
    first.height / 2 -
    boardRect.top;


  const x2 =
    last.left +
    last.width / 2 -
    boardRect.left;

  const y2 =
    last.top +
    last.height / 2 -
    boardRect.top;


  const length =
    Math.hypot(
      x2 - x1,
      y2 - y1
    );


  const angle =
    Math.atan2(
      y2 - y1,
      x2 - x1
    ) * 180 / Math.PI;


  winLine.style.left =
    `${x1}px`;

  winLine.style.top =
    `${y1 - 2.5}px`;

  winLine.style.width =
    `${length}px`;

  winLine.style.setProperty(
    "--angle",
    `${angle}deg`
  );


  winLine.style.color =
    board[line[0]] === "X"
      ? "#007aff"
      : "#ff3b30";


  winLine.style.display =
    "block";

  winLine.classList.add(
    "show"
  );
}


/*
  ======================================
  COMPUTER AI
  ======================================

  The goal here is deliberately NOT
  perfect play.

  A perfect 5x5 AI would make the game
  predictable and heavily favor draws.

  Instead, the computer evaluates:
  - immediate wins
  - immediate blocks
  - strong positions
  - forks
  - center
  - open lines

  It also introduces controlled natural
  variation.

  This gives the computer a strong,
  human-like personality rather than
  an obviously unbeatable algorithm.
*/


function getComputerMove() {

  const available =
    getAvailableMoves();

  if (!available.length) {
    return null;
  }


  /*
    1. Always take an immediate win.

    Missing a winning move feels
    artificial, so this remains reliable.
  */

  const winningMove =
    findImmediateMove("O");

  if (
    winningMove !== null
  ) {

    return winningMove;
  }


  /*
    2. Usually block the player.

    Occasionally allowing a threat creates
    realistic games and prevents perfect
    defensive behavior.
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
    Evaluate every available square.
  */

  const scoredMoves =
    available.map(index => {

      return {
        index,
        score:
          evaluateMove(index)
      };

    });


  scoredMoves.sort(
    (a, b) =>
      b.score - a.score
  );


  /*
    Natural choice distribution.

    Most of the time the computer selects
    one of the strongest moves.

    Sometimes it chooses a slightly weaker
    move, making wins possible.
  */

  const roll =
    Math.random();


  if (
    roll < 0.60
  ) {

    return scoredMoves[0].index;

  }


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
    Natural imperfection.
  */

  const topHalf =
    scoredMoves.slice(
      0,
      Math.max(
        1,
        Math.ceil(
          scoredMoves.length * .55
        )
      )
    );

  return randomItem(
    topHalf
  ).index;
}


/*
  IMMEDIATE WIN / BLOCK
*/

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


/*
  EVALUATE MOVE
*/

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
    Corners are useful but not dominant.
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


  /*
    Reward creating strong lines.
  */

  score +=
    countPotentialLines(
      "O"
    ) * 2;


  /*
    If this creates multiple threats,
    reward it significantly.
  */

  const threats =
    countImmediateThreats("O");

  score +=
    threats * 7;


  /*
    Simulate opponent response.

    If this move prevents several
    potential X lines, reward it.
  */

  board[index] = "X";

  score -=
    countPotentialLines(
      "X"
    ) * 1.7;


  board[index] = "";


  /*
    Small random variation prevents
    identical games.
  */

  score +=
    Math.random() * 4;


  return score;
}


/*
  COUNT OPEN LINES
*/

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

          } else if (
            value === ""
          ) {

            emptyCount++;

          } else {

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


/*
  COUNT IMMEDIATE THREATS
*/

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


/*
  AVAILABLE MOVES
*/

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


/*
  RANDOM ITEM
*/

function randomItem(array) {

  return array[
    Math.floor(
      Math.random() *
      array.length
    )
  ];
}


/*
  START FIRST GAME
*/

startGame();
