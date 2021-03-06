function solveSudoku(inputBoard, statistics) {
  var stats = statistics || {}, board = JSON.parse(JSON.stringify(inputBoard)), possibilities = [[], [], [], [], [], [], [], [], []],
	  solved = false, impossible = false, mutated = false, needCheckFreedoms = false, loopCount = 0;
  stats['easy'] = true;

  for(var i = 0; i < 9; ++i)
  {
    for(var j = 0; j < 9; ++j)
    {
      possibilities[i][j] = [false, true, true, true, true, true, true, true, true, true];
    }
  }

  outerLoop: while(!solved && !impossible) {
    solved = true;
    mutated = false;
    ++loopCount;
    var leastFree = [], leastRemaining = 9;

    for(i = 0; i < 9; ++i)
    {
      for(j = 0; j < 9; ++j)
      {
        if(board[i][j] === 0)
        {
          solved = false;
          var currentPos = possibilities[i][j], zoneRow, zoneCol;

          if(loopCount === 1)
          {
            zoneRow = getZone(i) * 3;
            zoneCol = getZone(j) * 3;
            currentPos[10] = zoneRow;
            currentPos[11] = zoneCol;
          }
          else
          {
            zoneRow = currentPos[10];
            zoneCol = currentPos[11];
          }

          mutated =  reducePossibilities(board, i, j, currentPos, zoneRow, zoneCol);
          var remaining = 0, lastDigit = 0;

          for(var k = 1; k <= 9; ++k)
          {
            if(currentPos[k])
            {
              ++remaining;
              lastDigit = k;
            }
          }

          if(remaining === 0)
          {
            impossible = true;
            break outerLoop;
          }
          else if(remaining === 1)
          {
            board[i][j] = lastDigit;
            mutated = true;
            continue;
          }
          if(needCheckFreedoms)
          {
            var solution = checkFreedoms(board, i, j, possibilities, zoneRow, zoneCol);

            if(solution !== 0)
            {
              board[i][j] = solution;
              mutated = true;
              continue;
            }
            if(remaining === leastRemaining)
            {
              leastFree.push([i,j]);
            }
            else if(remaining < leastRemaining)
            {
              leastRemaining = remaining;
              leastFree = [[i,j]];
            }
          }
        }
      }
    }

    if(mutated === false && solved === false)
    {
      if(needCheckFreedoms === false)
      {
        needCheckFreedoms = stats['medium'] = true;
        continue;
      }

      return solveByGuessing(board, possibilities, leastFree, stats);
    }
  }

  return impossible ? null : board;
}

function getZone(i)
{
	if(i < 3)
	{
		return 0;
	}
	if(i < 6)
	{
		return 1;
	}

	return 2;
}

function reducePossibilities(board, row, column, currentPos, zoneRow, zoneCol)
{
  var mutated = false;

  for(var k = 0; k < 9; ++k)
  {
    mutated = (currentPos[board[row][k]] || currentPos[board[k][column]]);
    currentPos[board[row][k]] = currentPos[board[k][column]] = false;
  }
  for(var x = zoneRow; x <= (zoneRow + 2); ++x)
  {
    for(var y = zoneCol; y <= (zoneCol + 2); ++y)
    {
      if(currentPos[board[x][y]])
      {
        mutated = true;
      }

      currentPos[board[x][y]] = false;
    }
  }

  return mutated;
}

function checkFreedoms(board, i, j, possibilities, zoneRow, zoneCol)
{
  var answer = 0, currentPos = possibilities[i][j], uniquePosRow = currentPos.slice(0), uniquePosCol = currentPos.slice(0),
	  uniquePosCube = currentPos.slice(0), remainingRow = 0, remainingCol = 0, lastDigitRow = 0, lastDigitCol = 0,
	  remainingCube = 0, lastDigitCube = 0;

  for(k = 0; k < 9; ++k)
  {
    for(var l = 1; l < 10; ++l)
    {
      uniquePosRow[l] = !(board[i][k] === 0 && possibilities[i][k][l] && k !== j);
      uniquePosCol[l] = !(board[k][j] === 0 && possibilities[k][j][l] && k !== i);
    }
  }

  for(k = 1; k < 10; ++k)
  {
    if(uniquePosRow[k])
    {
      ++remainingRow;
      lastDigitRow = k;
    }
    if(uniquePosCol[k])
    {
      ++remainingCol;
      lastDigitCol = k;
    }
  }

  if(remainingRow === 1)
  {
    answer = lastDigitRow;
    return answer;
  }
  if(remainingCol === 1)
  {
    answer = lastDigitCol;
    return answer;
  }

  for(var x = zoneRow; x <= (zoneRow + 2); ++x)
  {
    for(var y = zoneCol; y <= (zoneCol + 2); ++y)
    {
      for(l = 1; l < 10; ++l)
      {
        uniquePosCube[l] = !(!board[x][y] && possibilities[x][y][l] && (x !== i || y !== j));
      }
    }
  }

  for(var k = 1; k < 10; ++k)
  {
    if(uniquePosCube[k])
    {
      ++remainingCube;
      lastDigitCube = k;
    }
  }

  if(remainingCube === 1)
  {
    answer = lastDigitCube;
  }

  return answer;
}

function solveByGuessing(board, possibilities, leastFree, stats)
{
  if(leastFree.length < 1)
  {
    return null;
  }
  if('hard' in stats)
  {
    stats['vhard'] = true;
  }
  else
  {
    stats['hard'] = true;
  }

  var randIndex = getRandom(leastFree.length), randSpot = leastFree[randIndex];
  var guesses = [], currentPos = possibilities[randSpot[0]][randSpot[1]];

  for(i = 1; i <= 9; ++i)
  {
    if(currentPos[i])
    {
      guesses.push(i);
    }
  }

  shuffleArray(guesses);

  for(var i = 0; i < guesses.length; ++i)
  {
    board[randSpot[0]][randSpot[1]] = guesses[i];
    var result = solveSudoku(board, stats);

    if(result !== null)
    {
      return result;
    }
  }

  return null;
}

function getRandom(limit)
{
  return Math.floor(Math.random() * limit);
}

function shuffleArray(array)
{
  var i = array.length;

  if(i !== 0)
  {
    while(--i)
    {
      var j = Math.floor(Math.random() * (i + 1));
      array[i] += array[j];
      array[j] = array[i] - array[j];
      array[i] -= array[j];
    }
  }
}

var last = 31337, randomBackup = Math.random;
var fakeRandom = function()
{
	var a = 214013, c = 2531011, m = 4294967296;
	var next = (a * last + c) % m;
	last = next;
	return next / m;
};

Math.enableFakeRandom = function()
{
	Math.random = fakeRandom;
};

Math.disableFakeRandom = function()
{
	Math.random = randomBackup;
};

Math.fakeRandomSeed = function(seed)
{
	last = seed;
};


function generatePuzzle(difficulty)
{
  difficulty = [1, 2, 3, 4, 5].indexOf(difficulty) + 1 || 1;

  var solvedPuzzle = solveSudoku(emptyPuzzle), indexes = new Array(81);

  for(i = 0; i < 81; ++i)
  {
      indexes[i] = i;
  }

  shuffleArray(indexes);
  var knownCount = 81;

  for(var i = 0; i < 81; ++i)
  {
    if((knownCount <= 25) || (difficulty === 1 && knownCount <= 35))
    {
      break;
    }

    var index = indexes[i];
    var row = Math.floor(index / 9);
    var col = index % 9;
    var currentValue = solvedPuzzle[row][col];
    var state = {}, undo = false;
    solvedPuzzle[row][col] = 0;

    undo = ((difficulty <= 2 && state.medium) || (difficulty <= 3 && state.hard) || (difficulty <= 4 && state.vhard));

    if(undo)
    {
      solvedPuzzle[row][col] = currentValue;
    }
    else
    {
      --knownCount;
    }
  }

  return solvedPuzzle;
}

function verifySolution(board, onlyFullySolved)
{
  var resp = {valid: false};

  if(board === null)
  {
    resp['invalidBoard'] = "Board was null";
    return resp;
  }

  var rows = [], cols = [],cubes = [ [[], [], []], [[], [], []], [[], [], []]];

  for(var i = 0; i < 9; ++i)
  {
    rows.push([]);
    cols.push([]);
  }
  for(i = 0; i < 9; ++i)
  {
    for(var j = 0; j < 9; ++j)
    {
      if(board[i][j] === 0)
      {
        if(!onlyFullySolved)
        {
          continue;
        }

        resp['notFullySolved'] = "Board still has unknowns";
        return resp;
      }
      if(board[i][j] in rows[i])
      {
        resp['badRow'] = i;
        return resp;
      }
      rows[i][board[i][j]] = true;

      if(board[i][j] in cols[j])
      {
        resp['badCol'] = j;
        return resp;
      }

      cols[j][board[i][j]] = true;

      var cube = cubes[getZone(i)][getZone(j)];

      if(board[i][j] in cube)
      {
        resp['badCube'] = [getZone(i) * 3, getZone(j) * 3];
        return resp;
      }

      cube[board[i][j]] = true;
    }
  }

  resp['valid'] = true;
  return resp;
}

var hardPuzzle =
[
  [0, 0, 3, 0, 0, 8, 0, 0, 0],
  [0, 4, 0, 0, 0, 0, 0, 0, 0],
  [0, 8, 0, 3, 5, 0, 9, 0, 0],
  [8, 0, 5, 0, 0, 6, 0, 0, 0],
  [1, 0, 0, 7, 3, 2, 0, 0, 8],
  [0, 0, 0, 8, 0, 0, 3, 0, 1],
  [0, 0, 8, 0, 1, 4, 0, 7, 0],
  [0, 0, 0, 0, 0, 0, 0, 5, 0],
  [0, 0, 0, 9, 0, 0, 2, 0, 0]
];

var emptyPuzzle =
[
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0]
];

function verify()
{
    this.value = isNaN(this.value) ? '' : this.value;
}

function renderBoard(board)
{
  for(var i = 0; i < 9; ++i)
  {
    for(var j = 0; j < 9; ++j)
    {
      var el = document.getElementById("" + i + j), child;

      if(board[i][j] === 0)
      {
        child = document.createElement("input");
        child.setAttribute('maxlength', '1');
        child.setAttribute('id', 'c' + i + j);
        child.addEventListener('input', verify, false);
      }
      else
      {
        child = document.createElement("span");
        child.textContent = board[i][j];
      }

      el.innerHTML = "";
      el.setAttribute("class", ((board[i][j] === 0) ? 'edit' : 'static') + 'Value');
      el.setAttribute("tabIndex", '0');
      el.appendChild(child);
    }
  }
}

function getCurrentBoard()
{
  var board = new Array(9);

  for(var i = 0; i < 9; ++i)
  {
    for(var j = 0; j < 9; ++j)
    {
      if(j === 0)
      {
        board[i] = new Array(9);
      }

      var el = document.getElementById("" + i + j);
      var child = el.children[0], value = "0";

      if(child.tagName === 'INPUT')
      {
        value = child.value;
      }
      else if(child.tagName === 'SPAN')
      {
        value = child.textContent;
      }
      if(value.match(/^[1-9]$/))
      {
        value = parseInt(value, 10);
      }
      else
      {
        value = 0;
      }

      board[i][j] = value;
    }
  }

  return board;
}

var id, i, started, currentPuzzle = generatePuzzle(), currentErrors = [], amazing = false, amazeButton = document.getElementById('amazeButton'),
	calculatingDiv = document.getElementById('calculating'), finishedCalculatingDiv = document.getElementById('finishedCalculating'),
	winBlock = document.getElementById('youWon'), noErrorsSpan = document.getElementById('noErrors'), errorsFoundSpan = document.getElementById('errorsFound'),
	difficulty = document.getElementById('difficulty');
document.getElementById('youWon').style.display = 'none';
renderBoard(currentPuzzle);

var clearErrors = function()
{
  errorsFoundSpan.style.display = 'none';
  noErrorsSpan.style.display = 'none';

  for(var i = 0; i < currentErrors.length; ++i)
  {
    currentErrors[i].setAttribute('class', currentErrors[i].getAttribute('class').replace(" error", ''));
  }

  currentErrors = [];
};

amazeButton.addEventListener('click', function() {
  if(!amazing)
  {
    var level = parseInt(difficulty.options[difficulty.selectedIndex].value, 10);
    amazing = true;
    clearErrors();
    finishedCalculatingDiv.style.display = 'none';
    calculatingDiv.style.display = 'block';

    solveTest(level, function()
    {
      finishedCalculatingDiv.style.display = 'block';
      calculatingDiv.style.display = 'none';
      amazing = false;
      currentPuzzle = hardPuzzle;
    });
  }
}, false);

document.getElementById('checkButton').addEventListener('click', function() {
  clearErrors();
  var board = getCurrentBoard(), result = verifySolution(board);

  if(result['valid'])
  {
    var validMessages = [ "LOOKING GOOD", "KEEP GOING", "AWESOME", "EXCELLENT",
	  "NICE", "SWEET", "LOOKS GOOD TO ME"];

    if(verifySolution(board, true)['valid'])
    {
      clock.stop(function()
      {
          started = false;
          var temp = clock.getTime().time - 1;
          document.getElementsByName('win')[0].value = 1;
          document.getElementsByName('time')[0].value = temp;
          winBlock.innerHTML = 'Solved in ' + parseInt(temp / 60, 10) + ' minutes ' + (temp % 60) + ' seconds.' + winBlock.innerHTML;
          winBlock.style.display = 'block';
          document.getElementById('close').addEventListener('click', function() {
              winBlock.style.display = 'none';
          }, false);
          document.getElementById('new').addEventListener('click', function() {
              window.onbeforeunload = null;
              document.getElementById('hidden').click();
          }, false);
      });
    }
    else
    {
      noErrorsSpan.textContent = validMessages[getRandom(validMessages.length)];
      noErrorsSpan.style.display = 'block';
    }
  }
  else
  {
    if('badRow' in result)
    {
      for(i = 0; i < 9; ++i)
      {
        el = document.getElementById("" + result['badRow'] + i);
        el.setAttribute("class", el.getAttribute('class') + " error");
        currentErrors.push(el);
      }
    }
    else if('badCol' in result)
    {
      for(i = 0; i < 9; ++i)
      {
        el = document.getElementById("" + i + result['badCol']);
        el.setAttribute("class", el.getAttribute('class') + " error");
        currentErrors.push(el);
      }
    }
    else if('badCube' in result)
    {
      var cubeRow = result['badCube'][0], cubeCol = result['badCube'][1];

      for(var x = cubeRow + 2; x >= cubeRow; --x)
      {
        for(var y = cubeCol + 2; y >= cubeCol; --y)
        {
          var el = document.getElementById("" + x + y);
          el.setAttribute("class", el.getAttribute('class') + " error");
          currentErrors.push(el);
        }
      }
    }

    errorsFoundSpan.style.display = 'block';
  }
}, false);

document.getElementById('newGameButton').addEventListener('click', function() {
  if(started)
  {
    window.location = '/';
  }

  clearErrors();
  var value = parseInt(difficulty.options[difficulty.selectedIndex].value, 10);
  currentPuzzle = generatePuzzle(value);
  renderBoard(currentPuzzle);
  started = true;
}, false);