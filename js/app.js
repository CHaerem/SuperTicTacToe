document.addEventListener("DOMContentLoaded", () => {
	const gameBoard = document.getElementById("game-board");
	const gameStatus = document.getElementById("game-status");
	const resetButton = document.getElementById("reset-game");
	const vsComputerSwitch = document.getElementById("vs-computer");
	const vsLabel = document.getElementById("vs-label");
	const aiOptions = document.getElementById("ai-options");
	const aiDifficulty = document.getElementById("ai-difficulty");
	const multiplayerOptions = document.getElementById("multiplayer");
	const peerIdInput = document.getElementById("peer-id");
	const connectButton = document.getElementById("connect");

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
		if (connection) {
			connection.send({ type: "RESET" });
		}
	};

	const toggleVsComputer = () => {
		vsComputer = vsComputerSwitch.checked;
		vsLabel.textContent = vsComputer ? "vs Computer" : "vs Human";
		aiOptions.style.display = vsComputer ? "block" : "none";
		multiplayerOptions.style.display = vsComputer ? "none" : "block";
		resetGame();
	};

	const setupPeer = () => {
		peer = new Peer();
		peer.on("open", (id) => {
			console.log("My peer ID is: " + id);
			peerIdInput.value = id;
		});
		peer.on("connection", (conn) => {
			connection = conn;
			setupConnection(conn);
			isHost = true;
			playerSymbol = "X";
		});
	};

	const setupConnection = (conn) => {
		conn.on("data", (data) => {
			console.log("Received", data);
			if (data.type === "MOVE") {
				handleMove(data.bigIndex, data.smallIndex, true);
			} else if (data.type === "RESET") {
				resetGame();
			}
		});
		conn.on("open", () => {
			gameStatus.textContent = "Connected to peer. Game is ready!";
			resetGame();
		});
		conn.on("close", () => {
			gameStatus.textContent =
				"Connection closed. Refresh to start a new game.";
			connection = null;
		});
	};

	const connectToPeer = () => {
		if (peer && peerIdInput.value) {
			const conn = peer.connect(peerIdInput.value);
			connection = conn;
			setupConnection(conn);
			isHost = false;
			playerSymbol = "O";
		}
	};

	// Event Listeners
	resetButton.addEventListener("click", resetGame);
	vsComputerSwitch.addEventListener("change", toggleVsComputer);
	connectButton.addEventListener("click", connectToPeer);

	// Initialize the game
	initializeBoard();
	setupPeer();
});
