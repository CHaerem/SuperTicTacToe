document.addEventListener("DOMContentLoaded", () => {
	const gameBoard = document.getElementById("game-board");
	const gameStatus = document.getElementById("game-status");
	const resetButton = document.getElementById("reset-game");
	const vsComputerSwitch = document.getElementById("vs-computer");
	const vsLabel = document.getElementById("vs-label");
	const aiOptions = document.getElementById("ai-options");
	const aiDifficulty = document.getElementById("ai-difficulty");
	const hostGameButton = document.getElementById("host-game");
	const qrcodeDiv = document.getElementById("qrcode");
	const gameUrlDiv = document.getElementById("game-url");

	let superBoard = Array(9)
		.fill(null)
		.map(() => Array(9).fill(null));
	let currentPlayer = "X";
	let activeBoard = null;
	let winner = null;
	let smallWinners = Array(9).fill(null);
	let vsComputer = false;
	let peer = null;
	let connection = null;
	let isHost = false;
	let playerSymbol = "X";
	let gameInitialized = false;

	const updateGameStatus = () => {
		if (winner) {
			gameStatus.textContent = `Player ${winner} wins the game!`;
		} else if (activeBoard === null) {
			gameStatus.textContent = `${
				vsComputer && currentPlayer === "O"
					? "Computer"
					: `Player ${currentPlayer}`
			}'s turn. Choose any board.`;
		} else {
			gameStatus.textContent = `${
				vsComputer && currentPlayer === "O"
					? "Computer"
					: `Player ${currentPlayer}`
			}'s turn on board ${activeBoard + 1}.`;
		}
	};

	const createCell = (bigIndex, smallIndex) => {
		const cell = document.createElement("button");
		cell.className =
			"cell w-full h-full border flex items-center justify-center text-xl font-bold transition-all duration-300";
		cell.addEventListener("click", () => handleMove(bigIndex, smallIndex));
		return cell;
	};

	const createSmallBoard = (index) => {
		const smallBoard = document.createElement("div");
		smallBoard.className = "small-board";
		for (let i = 0; i < 9; i++) {
			smallBoard.appendChild(createCell(index, i));
		}
		return smallBoard;
	};

	const initializeBoard = () => {
		gameBoard.innerHTML = "";
		for (let i = 0; i < 9; i++) {
			gameBoard.appendChild(createSmallBoard(i));
		}
		updateBoard();
	};

	const updateBoard = () => {
		superBoard.forEach((smallBoard, bigIndex) => {
			smallBoard.forEach((cell, smallIndex) => {
				const cellElement = gameBoard.children[bigIndex].children[smallIndex];
				cellElement.textContent = cell;
				cellElement.disabled =
					!!cell ||
					!!smallWinners[bigIndex] ||
					(activeBoard !== null && activeBoard !== bigIndex);
				cellElement.className = `cell w-full h-full border flex items-center justify-center text-xl font-bold transition-all duration-300 
                    ${
											(activeBoard === null || activeBoard === bigIndex) &&
											!smallWinners[bigIndex]
												? "bg-blue-100 border-blue-500"
												: "border-gray-300"
										}
                    ${smallWinners[bigIndex] ? "bg-green-200" : ""}
                    ${cell ? "cursor-not-allowed" : "hover:bg-gray-100"}`;
			});
		});
		updateGameStatus();
	};

	const handleMove = (bigIndex, smallIndex, isRemoteMove = false) => {
		if (
			winner ||
			(activeBoard !== null && activeBoard !== bigIndex) ||
			superBoard[bigIndex][smallIndex] ||
			smallWinners[bigIndex]
		) {
			return;
		}

		if (connection && !isRemoteMove && currentPlayer !== playerSymbol) {
			return; // Not your turn in multiplayer
		}

		superBoard[bigIndex][smallIndex] = currentPlayer;
		const smallBoardWinner = checkWinner(superBoard[bigIndex]);
		if (smallBoardWinner) {
			smallWinners[bigIndex] = smallBoardWinner;
			winner = checkWinner(smallWinners);
		}

		currentPlayer = currentPlayer === "X" ? "O" : "X";
		activeBoard = smallWinners[smallIndex] ? null : smallIndex;

		updateBoard();

		if (vsComputer && currentPlayer === "O" && !winner) {
			setTimeout(makeComputerMove, 1000);
		}

		if (connection && !isRemoteMove) {
			connection.send({ type: "MOVE", bigIndex, smallIndex });
		}
	};

	const makeComputerMove = () => {
		let validBoards =
			activeBoard === null ? [...Array(9).keys()] : [activeBoard];
		validBoards = validBoards.filter((board) => !smallWinners[board]);

		if (validBoards.length === 0) return;

		let bigIndex, smallIndex;

		switch (aiDifficulty.value) {
			case "easy":
				bigIndex = validBoards[Math.floor(Math.random() * validBoards.length)];
				const emptyCells = getValidMoves(superBoard[bigIndex]);
				smallIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
				break;
			case "medium":
				bigIndex = validBoards[Math.floor(Math.random() * validBoards.length)];
				smallIndex = getBestMove(superBoard[bigIndex]);
				break;
			case "hard":
				let bestScore = -Infinity;
				for (const board of validBoards) {
					const move = getBestMove(superBoard[board]);
					const score = minimax(
						superBoard[board],
						0,
						false,
						-Infinity,
						Infinity
					);
					if (score > bestScore) {
						bestScore = score;
						bigIndex = board;
						smallIndex = move;
					}
				}
				break;
		}

		handleMove(bigIndex, smallIndex);
	};

	const resetGame = () => {
		superBoard = Array(9)
			.fill(null)
			.map(() => Array(9).fill(null));
		currentPlayer = "X";
		activeBoard = null;
		winner = null;
		smallWinners = Array(9).fill(null);
		initializeBoard();
		gameInitialized = true;
		if (connection && isHost) {
			connection.send({ type: "RESET" });
		}
	};

	const toggleVsComputer = () => {
		vsComputer = vsComputerSwitch.checked;
		vsLabel.textContent = vsComputer ? "vs Computer" : "vs Human";
		aiOptions.style.display = vsComputer ? "block" : "none";
		resetGame();
	};

	const generateGameUrl = (peerId) => {
		const url = new URL(window.location.href);
		url.searchParams.set("game", peerId);
		return url.href;
	};

	const generateQRCode = (url) => {
		qrcodeDiv.innerHTML = "";
		new QRCode(qrcodeDiv, url);
	};

	const hostGame = () => {
		peer = new Peer();
		peer.on("open", (id) => {
			console.log("My peer ID is: " + id);
			const gameUrl = generateGameUrl(id);
			generateQRCode(gameUrl);
			gameUrlDiv.textContent = `Game URL: ${gameUrl}`;
			gameUrlDiv.style.display = "block";
			isHost = true;
			playerSymbol = "X";
			resetGame();
		});
		peer.on("connection", (conn) => {
			connection = conn;
			setupConnection(conn);
		});
	};

	const joinGame = (peerId) => {
		peer = new Peer();
		peer.on("open", () => {
			const conn = peer.connect(peerId);
			connection = conn;
			setupConnection(conn);
			isHost = false;
			playerSymbol = "O";
		});
	};

	const setupConnection = (conn) => {
		conn.on("open", () => {
			gameStatus.textContent = "Connected to peer. Game is ready!";
			if (isHost && !gameInitialized) {
				resetGame();
			}
		});

		conn.on("data", (data) => {
			console.log("Received", data);
			if (data.type === "MOVE") {
				handleMove(data.bigIndex, data.smallIndex, true);
			} else if (data.type === "RESET") {
				resetGame();
			}
		});

		conn.on("close", () => {
			gameStatus.textContent =
				"Connection closed. Refresh to start a new game.";
			connection = null;
		});
	};

	// Event Listeners
	resetButton.addEventListener("click", () => {
		resetGame();
		if (connection) {
			connection.send({ type: "RESET" });
		}
	});
	vsComputerSwitch.addEventListener("change", toggleVsComputer);
	hostGameButton.addEventListener("click", hostGame);

	// Initialize the game
	initializeBoard();

	// Check if we're joining a game
	const urlParams = new URLSearchParams(window.location.search);
	const gameId = urlParams.get("game");
	if (gameId) {
		joinGame(gameId);
	}
});
