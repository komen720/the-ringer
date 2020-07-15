const sectors = 12;
const rings = 6; // 4 + 2 for center
const radius = 100;
const centerRings = 2;
const skewY = 26; // FIXME not sure why i need this

let selectedRing = 0;
let selectedSector = -1;
let puzzleIdx = -1;
let board = new Array(rings).fill().map(x => new Array(sectors).fill());
let moves = 0;
let hasMoved = false;
let timerInterval;
let time = 0;
let disabledControls = false;

function draw(data) {
  $('#spinner').empty();

  $('#hud').empty();
  $('#hud').append(`<span>Level: ${puzzleIdx + 1}<br/></span>`);
  $('#hud').append(`<span>Moves: ${moves}${hasMoved ? ' ...' : ''} / ${allowedMoves[puzzleIdx]}</span>`);
  
  const rings = data.length + centerRings;
  const maxRadius = (radius * (data.length + centerRings)) / 2;
  
  for (let i = 0; i < data.length + centerRings; i++) {
    const ring = $('<div class="ring"></div>');
    const ringRadius = radius * (i+1);
    ring.css({
      height: ringRadius,
      width: ringRadius,
      zIndex: rings - i,
      marginTop: ((radius * rings) - ringRadius) / 2,
    });

    if (i >= centerRings) {
      for (let j = 0; j < data[i-centerRings].length; j++) {
        const sector = $('<div class="sector"></div>');
        const color = j % 2 ? (i % 2 ? 'purple' : 'darkblue') : (i % 2 ? 'darkblue' : 'purple');
        sector.css({
          transform: `rotate(${30 * j}deg) skewY(-${skewY}deg)`, // FIXME: skewY hack
          borderRight: `${ringRadius / 2}px solid ${color}`,
          borderTop: `${ringRadius / 2}px solid transparent`,
        });
        if (i - centerRings === selectedRing || (selectedSector > -1 && [j, (j + data[0].length / 2) % data[0].length, j - data[0].length / 2].includes(selectedSector + 2))) {
          sector.css({
            filter: 'brightness(200%)',
          });
        }
        ring.append(sector);
      }
    }
    
    $('#spinner').append(ring);
  }

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j]) {
        const char = $(`<div class="char"></div>`);
        let oldX = 0;
        let oldY = 0;
        oldX += (radius/2) * (centerRings + i) + (radius / 4);
        // math reminder:
        // radians = degrees * (pi/180)
        // x = xcos(theta)-ysin(theta)
        // y = ycos(theta)+xsin(theta)
        const degrees = (360 / data[i].length) * j + ((360 / data[i].length) / 2);
        const theta = degrees * (Math.PI / 180);
        let newX = oldX * Math.cos(theta) - oldY * Math.sin(theta);
        let newY = oldY * Math.cos(theta) + oldX * Math.sin(theta);
        newY += maxRadius;
        let color;
        switch (data[i][j]) {
        case 'G': color = 'green'; break;
        case 'R': color = 'red'; break;
        case 'B': color = 'blue'; break;
        case 'P': color = 'purple'; break;
        case 'Y': color = 'yellow'; break;
        default: color = 'red';
        }
        char.css({
          transform: `translate(${newX}px, ${newY}px)`,
          backgroundColor: color,
        });
        $('#spinner').append(char);
      }
    }
  }

  if (checkWin(data)) {
    const winNode = $(`<img src="img/jump.png" class="centerImg" width="${radius}">`);
    winNode.css({
      transform: `translate(0px, ${(radius / 2) * data.length + (radius / 4)}px)`,
    });
    $('#spinner').append(winNode);
    disabledControls = true;
    window.setTimeout(nextPuzzle, 2000);
  } else if (moves >= allowedMoves[puzzleIdx]) {
    const sadNode = $(`<img src="img/faint.png" class="centerImg" width="${radius}">`);
    sadNode.css({
      transform: `translate(0px, ${(radius / 2) * data.length + (radius / 4)}px)`,
    });
    $('#spinner').append(sadNode);
    disabledControls = true;
    window.setTimeout(() => {
      puzzleIdx = -1;
      nextPuzzle();
    }, 2000);
  } else {
    const thinkNode = $(`<img src="img/thinking.png" class="centerImg" width="${radius}">`);
    thinkNode.css({
      transform: `translate(0px, ${(radius / 2) * data.length + (radius / 4)}px)`,
    });
    $('#spinner').append(thinkNode);
  }
  
}

const puzzles = new Array(10).fill();

function nextPuzzle() {
  moves = 0;
  hasMoved = false;
  disabledControls = false;
  selectedRing = 0;
  selectedSector = -1;
  puzzleIdx++;
  if (puzzleIdx === 0) {
    if (timerInterval) {
      window.clearInterval(timerInterval);
    }
    time = 0;
    timerInterval = window.setInterval(() => {
      time += 10;
      $('#timer').empty();
      $('#timer').append(`<span>Time: ${time / 100} s</span>`);
    }, 100);
  } else if (puzzleIdx >= puzzles.length) {
    window.clearInterval(timerInterval);
    window.alert(`You win! Your IGT is ${time / 100}`);
    time = 0;
    return;
  }
  board = puzzles[puzzleIdx].map(p => [...p]);
  draw(board);
}

puzzles[0] = [
  ['G','G',null,null,null,null,null,null,null,null,'R',null],
  ['G','G',null,null,null,null,null,null,null,null,'R',null],
  ['R',null,null,null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null,'R',null],
];

puzzles[1] = [
  [null,'G','G',null,null,null,null,null,null,null,null,'R'],
  [null,null,'R',null,'G','G',null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null,null,'R'],
  [null,'R',null,null,null,null,null,null,null,null,null,null],
];

puzzles[2] = [
  [null,null,null,'B',null,null,null,null,null,'B',null,'G'],
  [null,null,null,'B',null,null,null,null,null,'B',null,'G'],
  [null,null,null,null,null,null,null,null,null,null,null,'G'],
  [null,null,null,null,null,null,null,null,null,null,null,'G'],
];

puzzles[3] = [
  ['R',null,'Y',null,null,null,null,null,null,null,null,'R'],
  ['R','R',null,'Y',null,null,null,null,null,null,null,null],
  ['Y',null,null,null,null,null,null,null,null,null,null,null],
  ['Y',null,null,null,null,null,null,null,null,null,null,null],
];

puzzles[4] = [
  [null,null,null,null,null,null,null,null,null,null,'B','G'],
  [null,null,null,null,null,null,null,null,null,null,'B','G'],
  ['G',null,null,null,null,null,null,null,null,'B',null,null],
  ['G',null,null,null,null,null,null,null,null,'B',null,null],
];

puzzles[5] = [
  ['Y','Y',null,null,null,null,null,null,null,'P','P','P'],
  ['P',null,'Y','Y',null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null,null,null],
];

puzzles[6] = [
  ['R','R',null,'G',null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,'R','R',null,'G',null],
  [null,'G',null,null,null,null,null,null,null,null,null,null],
  [null,'G',null,null,null,null,null,null,null,null,null,null],
];

puzzles[7] = [
  ['Y',null,null,null,'B','Y',null,null,null,null,'B',null],
  ['Y',null,null,null,'B','Y',null,null,null,null,'B',null],
  [null,null,null,null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null,null,null,null],
];

puzzles[8] = [
  [null,'G',null,null,null,null,null,null,null,null,null,'P'],
  [null,'G',null,null,null,null,null,null,null,null,'P','P'],
  [null,null,'G',null,null,null,null,null,null,null,null,'P'],
  [null,'G',null,null,null,null,null,null,null,null,null,null],
];

puzzles[9] = [
  [null,'P',null,null,null,null,null,null,null,null,'Y',null],
  [null,null,null,null,null,null,null,null,null,null,'P',null],
  [null,'Y',null,null,null,null,null,null,null,null,'P',null],
  [null,'Y',null,null,null,null,null,'Y',null,null,'P',null],
];

const allowedMoves = [1,2,1,2,2,2,2,2,2,2];

$('#switch').click(e => {
  if (disabledControls) return;
  if (hasMoved) {
    moves++;
    hasMoved = false;
  }
  if (selectedRing > -1) {
    selectedRing = -1;
    selectedSector = 0;
  } else {
    selectedSector = -1;
    selectedRing = 0;
  }
  draw(board);
});

$('#up').click(e => {
  if (disabledControls) return;
  if (selectedRing > -1) {
    if (hasMoved) {
      moves++; hasMoved = false;
    }
    selectedRing++;
    if (selectedRing >= board.length) {
      selectedRing = 0;
    }
  } else if (selectedSector > -1) {
    hasMoved = true;
    let arrToRotate = [];
    for (let i = 0; i < board.length; i++) {
      arrToRotate.push(board[i][selectedSector]);
    }
    for (let i = board.length - 1; i >= 0; i--) {
      arrToRotate.push(board[i][(selectedSector + board[0].length / 2) % board[0].length]);
    }
    arrToRotate.push(arrToRotate.shift());
    let count = 0;
    for (let i = 0; i < board.length; i++) {
      board[i][selectedSector] = arrToRotate[count];
      count++;
    }
    for (let i = board.length - 1; i >= 0; i--) {
      board[i][(selectedSector + board[0].length / 2) % board[0].length] = arrToRotate[count];
      count++;
    }
  }
  draw(board);
});

$('#down').click(e => {
  if (disabledControls) return;
  if (selectedRing > -1) {
    if (hasMoved) {
      moves++; hasMoved = false;
    }
    selectedRing--;
    if (selectedRing < 0) {
      selectedRing = board.length - 1;
    }
  } else if (selectedSector > -1) {
    hasMoved = true;
    let arrToRotate = [];
    for (let i = 0; i < board.length; i++) {
      arrToRotate.push(board[i][selectedSector]);
    }
    for (let i = board.length - 1; i >= 0; i--) {
      arrToRotate.push(board[i][(selectedSector + board[0].length / 2) % board[0].length]);
    }
    arrToRotate.unshift(arrToRotate.pop());
    let count = 0;
    for (let i = 0; i < board.length; i++) {
      board[i][selectedSector] = arrToRotate[count];
      count++;
    }
    for (let i = board.length - 1; i >= 0; i--) {
      board[i][(selectedSector + board[0].length / 2) % board[0].length] = arrToRotate[count];
      count++;
    }
  }
  draw(board);
});

$('#left').click(e => {
  if (disabledControls) return;
  if (selectedSector > -1) {
    if (hasMoved) {
      moves++; hasMoved = false;
    }
    selectedSector--;
    if (selectedSector < 0) {
      selectedSector = board[0].length / 2 - 1;
    }
  } else if (selectedRing > -1) {
    hasMoved = true;
    let ring = board[selectedRing];
    ring.push(ring.shift());
  }
  draw(board);
});

$('#right').click(e => {
  if (disabledControls) return;
  if (selectedSector > -1) {
    if (hasMoved) {
      moves++; hasMoved = false;
    }
    selectedSector++;
    if (selectedSector >= board[0].length / 2) {
      selectedSector = 0;
    }
  } else if (selectedRing > -1) {
    hasMoved = true;
    let ring = board[selectedRing];
    ring.unshift(ring.pop());
  }
  draw(board);
});

document.body.onkeyup = e => {
  if (e.keyCode === 32) {
    e.preventDefault();
    $('#switch').trigger('click');
  } else if (e.keyCode === 37) {
    $('#left').trigger('click');
  } else if (e.keyCode === 39) {
    $('#right').trigger('click');
  } else if (e.keyCode === 38) {
    $('#up').trigger('click');
  } else if (e.keyCode === 40) {
    $('#down').trigger('click');
  }
};

function checkWin(data) {
  const winBoard = data.map(p => [...p]);
  for (let i = 0; i < winBoard[winBoard.length - 1].length; i++) {
    if (winBoard[winBoard.length - 1][i]) {
      winBoard[winBoard.length - 1][i] = false;
      for (let j = winBoard.length - 2; j >= 0; j--) {
        if (!winBoard[j][i]) return false;
        winBoard[j][i] = false;
      }
    }
  }
  if (!winBoard[winBoard.length - 2].every(v => !v)) return false;
  if (winBoard[0].every(v => v) && winBoard[1].every(v => v)) return true; // prevent inf. loop
  let firstEmpty = false;
  for (let i = 0; i < winBoard[0].length * 2; i++) {
    let newIdx = i % winBoard[0].length;
    if (!firstEmpty) {
      if (!winBoard[0][newIdx]) firstEmpty = true;
      continue;
    }
    if (winBoard[0][newIdx]) {
      winBoard[0][newIdx] = false;
      if (!winBoard[1][newIdx]) {
        return false;
      }
      winBoard[1][newIdx] = false;
      if (!winBoard[0][(newIdx+1) % winBoard[0].length]) {
        return false;
      }
      winBoard[0][(newIdx+1) % winBoard[0].length] = false;
      if (!winBoard[1][(newIdx+1) % winBoard[0].length]) {
        return false;
      }
      winBoard[1][(newIdx+1) % winBoard[0].length] = false;
    }
  }
  if (!winBoard[1].every(v => !v)) return false;
  return true;
}

$('#start').click(e => {
  if (disabledControls) return;
  puzzleIdx = -1;
  nextPuzzle();
});


$('#start').trigger('click');
