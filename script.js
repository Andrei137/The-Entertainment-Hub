const ROWS = 6;
const COLUMNS = 7;
const EMPTY = 0;
const RED = 1;
const YELLOW = 2;

var currentPlayer = RED;
var playersNames = [];
var playersPoints = [0, 0];
var gamemode = null;
var board = [];
var gameOver = false;

function makeMove(a_board, a_row, a_column, a_piece)
{
    a_board[a_row][a_column] = a_piece;
}

function isFree(a_board, a_column)
{
    return a_board[0][a_column] === EMPTY;
}

function getFreeRow(a_board, a_column)
{
    for (let row = ROWS - 1; row >= 0; --row) 
    {
        if (a_board[row][a_column] === EMPTY) 
        {
            return row;
        }
    }
}

function winningMove(a_board, a_piece)
{
    for (let column = 0; column < COLUMNS - 3; ++column)
    {
        for (let row = 0; row < ROWS; ++row)
        {
            if 
            (
                a_board[row][column] === a_piece && 
                a_board[row][column + 1] === a_piece && 
                a_board[row][column + 2] === a_piece && 
                a_board[row][column + 3] === a_piece
            )
            {
                return true;
            }
        }
    }

    for (let column = 0; column < COLUMNS; ++column)
    {
        for (let row = 0; row < ROWS - 3; ++row)
        {
            if 
            (
                a_board[row][column] === a_piece && 
                a_board[row + 1][column] === a_piece && 
                a_board[row + 2][column] === a_piece && 
                a_board[row + 3][column] === a_piece
            )
            {
                return true;
            }
        }
    }

    for (let column = 0; column < COLUMNS - 3; ++column)
    {
        for (let row = 0; row < ROWS - 3; ++row)
        {
            if 
            (
                a_board[row][column] === a_piece && 
                a_board[row + 1][column + 1] === a_piece && 
                a_board[row + 2][column + 2] === a_piece && 
                a_board[row + 3][column + 3] === a_piece
                )
            {
                return true;
            }
        }
    }

    for (let column = 0; column < COLUMNS - 3; ++column)
    {
        for (let row = 3; row < ROWS; ++row)
        {
            if 
            (
                a_board[row][column] === a_piece && 
                a_board[row - 1][column + 1] === a_piece && 
                a_board[row - 2][column + 2] === a_piece && 
                a_board[row - 3][column + 3] === a_piece
            )
            {
                return true;
            }
        }
    }
}

function evaluateLine(a_line, a_piece)
{
    let score = 0;
    if (a_line.filter((cell) => cell === a_piece).length === 4)
    {
        score += 100;
    }
    else if (a_line.filter((cell) => cell === a_piece).length === 3 && a_line.filter((cell) => cell === EMPTY).length === 1)
    {
        score += 5;
    }
    else if (a_line.filter((cell) => cell === a_piece).length === 2 && a_line.filter((cell) => cell === EMPTY).length === 2)
    {
        score += 2;
    }

    const opponentPiece = (a_piece === RED ? YELLOW : RED);
    if (a_line.filter((cell) => cell === opponentPiece).length === 3 && a_line.filter((cell) => cell === EMPTY).length === 1)
    {
        score -= 4;
    }
    return score;
}

function evaluatePosition(a_board, a_piece)
{
    let score = 0;

    for (let row = 0; row < ROWS; ++row)
    {
        const row_array = a_board[row];
        for (let column = 0; column < COLUMNS - 3; ++column)
        {
            const line = row_array.slice(column, column + 4);
            score += evaluateLine(line, a_piece);
        }
    }

    for (let column = 0; column < COLUMNS; ++column)
    {
        const column_array = a_board.map((row) => row[column]);
        for (let row = 0; row < ROWS - 3; ++row)
        {
            const line = column_array.slice(row, row + 4);
            score += evaluateLine(line, a_piece);
        }
    }

    for (let row = 0; row < ROWS - 3; ++row)
    {
        for (let column = 0; column < COLUMNS - 3; ++column)
        {
            let line = [];
            for (let i = 0; i < 4; ++i)
            {
                line.push(a_board[row + i][column + i]);
            }
            score += evaluateLine(line, a_piece);
        }
    }

    for (let row = 0; row < ROWS -3; ++row)
    {
        for (let column = 0; column < COLUMNS - 3; ++column)
        {
            let line = [];
            for (let i = 0; i < 4; ++i)
            {
                line.push(a_board[row + 3 - i][column + i]);
            }
            score += evaluateLine(line, a_piece);
        }
    }
    return score;
}

function getValidLocations(a_board) 
{
    let validLocations = [];
    for (let column = 0; column < COLUMNS; ++column) 
    {
        if (isFree(a_board, column)) 
        {
            validLocations.push(column);
        }
    }
    return validLocations;
}

function terminalPosition(a_board)
{
    return (winningMove(a_board, RED) || winningMove(a_board, YELLOW) || getValidLocations(a_board).length === 0);
}

function minimax(a_board, a_depth, a_alpha, a_beta, a_maximizingPlayer)
{
    const validLocations = getValidLocations(a_board);
    const finished = terminalPosition(a_board);

    if (finished)
    {
        if (winningMove(a_board, YELLOW))
        {
            return [null, Infinity];
        }
        else if (winningMove(a_board, RED))
        {
            return [null, -Infinity];
        }
        else
        {
            return [null, 0];
        }
    }
    else if (a_depth == 7)
    {
        return [null, evaluatePosition(a_board, YELLOW)];
    }

    if (a_maximizingPlayer)
    {
        let value = -Infinity;
        let column = validLocations[0];
        for (const col of validLocations)
        {
            const row = getFreeRow(a_board, col);
            const boardCopy = a_board.map((row) => row.slice());
            makeMove(boardCopy, row, col, YELLOW);
            const score = minimax(boardCopy, a_depth + 1, a_alpha, a_beta, false)[1];
            if (score > value)
            {
                value = score;
                column = col;
            }
            a_alpha = Math.max(a_alpha, value);
            if (a_alpha >= a_beta)
            {
                break;
            }
        }
        return [column, value];
    }
    else
    {
        let value = Infinity;
        let column = validLocations[0];
        for (const col of validLocations)
        {
            const row = getFreeRow(a_board, col);
            const boardCopy = a_board.map((row) => row.slice());
            makeMove(boardCopy, row, col, RED);
            const score = minimax(boardCopy, a_depth + 1, a_alpha, a_beta, true)[1];
            if (score < value)
            {
                value = score;
                column = col;
            }
            a_beta = Math.min(a_beta, value);
            if (a_alpha >= a_beta)
            {
                break;
            }
        }
        return [column, value];
    }
}

function setWinner(a_winner)
{
    if (gamemode == 1)
    {
        let messageElement = document.getElementById("message");
        messageElement.style.display = "none";
    }
    gameOver = true;
    document.getElementById("arrow").classList.remove("cell");
    let winner = document.getElementById("winner");
    winner.innerHTML = a_winner;
    winner.style.display = "block";
    if (currentPlayer == RED)
    {
        winner.style.color = "red";
    }
    else
    {
        winner.style.color = "yellow";
    }
}

function changePlayer()
{
    let arrow = document.getElementById("arrow");
    if (currentPlayer == RED)
    {
        if (gamemode != 1)
        {
            arrow.classList.remove("red");
            arrow.classList.add("yellow");
            arrow.style.borderColor = "#F6BE00";
        }
        currentPlayer = YELLOW;
    }
    else
    {
        if (gamemode != 1)
        {
            arrow.classList.remove("yellow");
            arrow.classList.add("red");
            arrow.style.borderColor = "darkred";
        }
        currentPlayer = RED;
    }
}

function updateBoard(a_column)
{
    let row = getFreeRow(board, a_column);
    makeMove(board, row, a_column, currentPlayer);
    let cell = document.getElementsByClassName("r" + row + " c" + a_column)[0];
    if (currentPlayer == RED)
    {
        cell.classList.add("red");
    }
    else
    {
        cell.classList.add("yellow");
    }
}   

function checkWin()
{
    if (winningMove(board, currentPlayer))
    {
        setWinner(playersNames[currentPlayer - 1] + " wins!");
        ++playersPoints[currentPlayer - 1];
        document.getElementById("points" + currentPlayer).innerHTML = playersPoints[currentPlayer - 1] + " points";
    }
    else if (getValidLocations(board).length === 0)
    {
        setWinner("It's a draw!");
        playersPoints[0] += 0.5;
        playersPoints[1] += 0.5;
        document.getElementById("points1").innerHTML = playersPoints[0] + " points";
        document.getElementById("points2").innerHTML = playersPoints[1] + " points";
    }
}

function getMove()
{
    let column = minimax(board, 0, -Infinity, Infinity, true)[0];
    let opponentColor = (currentPlayer == RED ? YELLOW : RED);
    for (let c = 0; c < COLUMNS; ++c)
    {
        if (isFree(board, c))
        {
            let r = getFreeRow(board, c);
            makeMove(board, r, c, opponentColor);
            if (winningMove(board, opponentColor))
            {
                column = c;
            }
            board[r][c] = EMPTY;
        }
    }

    for (let c = 0; c < COLUMNS; ++c)
    {
        if (isFree(board, c))
        {
            let r = getFreeRow(board, c);
            makeMove(board, r, c, currentPlayer);
            if (winningMove(board, currentPlayer))
            {
                column = c;
            }
            board[r][c] = EMPTY;
        }
    }   

    let messageElement = document.createElement("h2");
    messageElement.id = "message";
    messageElement.style.fontSize = "25px";
    messageElement.style.margin = "20px 0 0";
    messageElement.style.padding = "10px 0 0";
    messageElement.innerHTML = "AI is thinking";
    if (currentPlayer == RED)
    {
        messageElement.style.color = "red";
    }
    else
    {
        messageElement.style.color = "yellow";
    }

    let boardElement = document.getElementById("board");
    document.body.insertBefore(messageElement, boardElement);
    document.getElementById("arrow").style.visibility = "hidden";

    setTimeout(() =>
    {
        function updateDiv()
        {
            let message = messageElement.innerHTML;
            if (message.endsWith("..."))
            {
                document.getElementById("arrow").style.visibility = "visible";
                messageElement.style.display = "none";
                updateBoard(column);
                checkWin();
                changePlayer();
            }
            else
            {
                messageElement.innerHTML = message + ".";
                setTimeout(updateDiv, 500);
            }
        }
        setTimeout(updateDiv, 500);
    }, 0);
}

function setPiece()
{
    if (gameOver)
    {
        return;
    }
    let pos = this.classList;
    let column = parseInt(pos[1].substring(1));
    updateBoard(column);
    checkWin();
    changePlayer();
    if (gamemode == 1)
    {
        getMove();
    }
}

function begin()
{
    document.getElementById("winner").style.display = "none";
    document.getElementById("scoreboard").style.display = "none";
    document.getElementById("points").style.display = "none";
    document.getElementById("logo").style.display = "block";
    document.getElementById("tips").style.display = "block";
    document.getElementById("gamemode-container").style.display = "flex";

    let pvpButton = document.getElementById("gamemode-pvp");
    let pveButton = document.getElementById("gamemode-pve");

    pveButton.addEventListener("click", () =>
    {
        gamemode = 1;
        manipulateElements();
    });

    pvpButton.addEventListener("click", () =>
    {
        gamemode = 2;
        manipulateElements();
    });

    function manipulateElements() 
    {
        document.getElementById("gamemode-container").style.display = "none";
        getNames();
    } 
}

function setBoard() 
{
    function showArrow() 
    {
        arrow.style.display = "block";
        let column = this.classList[1];
        arrow.style.left = document.getElementsByClassName(column)[0].offsetLeft + "px";
    }

    function hideArrow() {
        arrow.style.display = "none";
    }

    function createBoard() 
    {
        const board = [];
        for (let row = 0; row < ROWS; ++row) 
        {
            board[row] = [];
            for (let column = 0; column < COLUMNS; ++column) 
            {
                board[row][column] = EMPTY;
            }
        }
        return board;
    }

    board = createBoard();
    let boardElement = document.createElement("div");
    boardElement.id = "board";
    let footerElement = document.getElementById("footer");
    document.body.insertBefore(boardElement, footerElement);

    let arrow = document.createElement("div");
    arrow.id = "arrow";
    arrow.classList.add("cell");
    arrow.classList.add("red");
    arrow.style.borderColor = "darkred";
    boardElement.appendChild(arrow);

    for (let row = 0; row < ROWS; ++row) 
    {
        let current_row = [];
        for (let column = 0; column < COLUMNS; ++column) 
        {
            current_row.push(" ");
            let cell = document.createElement("div");
            cell.classList.add("r" + row);
            cell.classList.add("c" + column);
            cell.classList.add("cell");
            cell.addEventListener("mouseover", showArrow);
            cell.addEventListener("mouseout", hideArrow);
            cell.addEventListener("click", setPiece);
            boardElement.appendChild(cell);
        }
        board.push(current_row);
    }

    document.addEventListener("keydown", function (event) 
    {
        if (event.key >= '1' && event.key <= '7') 
        {
            let column = event.key - '0';
            updateBoard(column - 1);
            checkWin();
            changePlayer();
            if (gamemode == 1)
            {
                getMove();
            }
        }
  });
}

function getNames()
{
    function moveButtonRandomly()
    {
        let startButton = document.getElementById('start-button');
        const nameInputElement = document.getElementById('range');
        const coords = nameInputElement.getBoundingClientRect();
        const minX = coords.left;
        const maxX = coords.right - startButton.offsetWidth;
        const minY = coords.top;
        const maxY = coords.bottom - startButton.offsetHeight;

        const randomX = Math.random() * (maxX - minX) + minX;
        const randomY = Math.random() * (maxY - minY) + minY;

        startButton.style.position = 'absolute';
        startButton.style.left = randomX + 'px';
        startButton.style.top = randomY + 'px';
    }

    document.getElementById('start-button').style.position = "static";

    let nameInput = document.getElementById("name-input");
    nameInput.style.display = "flex";

    let nameSubtitle = document.getElementById("name-subtitle");
    let formInput = document.getElementsByClassName("player-input");
    formInput[0].value = "";

    if (gamemode == 1)
    {
        nameSubtitle.innerHTML = "Enter your name";
        formInput[1].value = "AI";
        formInput[1].disabled = true;
    }
    else
    {
        nameSubtitle.innerHTML = "Enter your names";
        formInput[1].value = "";
    }

    let form = document.getElementById("name-form");
    form.addEventListener("submit", (event) =>
    {
        event.preventDefault();
        submitForm();
    });

    document.addEventListener("keydown", (event) =>
    {
        if (event.key === "Enter")
        {
            event.preventDefault();
            submitForm();
        }
    });

    function submitForm() 
    {
        let nameRegex = /^[A-Za-z1-9]{2,8}$/;
        let playerInputs = document.getElementsByClassName("player-input");
        let allFilled = true;
        for (let i = 0; i < playerInputs.length; ++i) 
        {
            let playerName = playerInputs[i].value.trim();
            if (playerName == "")
            {
                moveButtonRandomly();
                allFilled = false;
                break;
            } 
            else if (!nameRegex.test(playerName)) 
            {
                alert("Please enter a valid name. 2 to 8 characters, letters and numbers only.");
                allFilled = false;
                break;
            }
            else
            {
                playersNames[i] = playerName;
            }
        }
        if (gamemode === 1) 
        {
            playersNames[1] = "AI";
        }
        if (!allFilled) 
        {
            return;
        } 
        else 
        {
            nameInput.style.display = "none";
            document.getElementById("scoreboard").style.display = "flex";
            document.getElementById("points").style.display = "flex";
            document.getElementById("player1").innerHTML = playersNames[0];
            document.getElementById("player2").innerHTML = playersNames[1];
            document.getElementById("points1").innerHTML = "0 points";
            document.getElementById("points2").innerHTML = "0 points";
            document.getElementById("logo").style.display = "none";
            document.getElementById("tips").style.display = "none";
            setBoard();
            document.getElementById("board").style.display = "flex";
        }
    }
}

function reset()
{
    currentPlayer = RED;
    board = [];
    gameOver = false;
    document.body.removeChild(document.getElementById("board"));
}

document.addEventListener("keydown", (event) =>
{
    if (gameOver)
    {
        document.getElementById("points1").innerHTML = playersPoints[0] + " points";
        document.getElementById("points2").innerHTML = playersPoints[1] + " points";
        if (event.key == "g")
        {
            playersNames = [];
            playersPoints = [0, 0];
            gamemode = null;
            reset();
            begin();
        }
        if (event.key == "r")
        {
            reset();
            document.getElementById("winner").style.display = "none";
            setBoard();
            document.getElementById("board").style.display = "flex";
        }
        if (event.key == "s")
        {
            reset();
            [playersNames[0], playersNames[1]] = [playersNames[1], playersNames[0]];
            [playersPoints[0], playersPoints[1]] = [playersPoints[1], playersPoints[0]];
            document.getElementById("player1").innerHTML = playersNames[0];
            document.getElementById("player2").innerHTML = playersNames[1];
            document.getElementById("points1").innerHTML = playersPoints[0] + " points";
            document.getElementById("points2").innerHTML = playersPoints[1] + " points";
            document.getElementById("winner").style.display = "none";
            setBoard();
            document.getElementById("board").style.display = "flex";
            if (gamemode == 1)
            {
                let arrow = document.getElementById("arrow");
                arrow.classList.remove("red");
                arrow.classList.add("yellow");
                arrow.style.borderColor = "#F6BE00";
                getMove();
            }
        }
    }
});

window.addEventListener("DOMContentLoaded", () => 
{
    begin();
});
