// uiManager.js

export class UIManager {
	constructor(elements) {
		this.elements = elements;
		this.vsComputer = false;
	}

	updateGameStatus(winner, activeBoard, currentPlayer) {
		if (winner) {
			this.elements.gameStatus.textContent = `Player ${winner} wins the game!`;
		} else if (activeBoard === null) {
			this.elements.gameStatus.textContent = `${
				this.vsComputer && currentPlayer === "O"
					? "Computer"
					: `Player ${currentPlayer}`
			}'s turn. Choose any board.`;
		} else {
			this.elements.gameStatus.textContent = `${
				this.vsComputer && currentPlayer === "O"
					? "Computer"
					: `Player ${currentPlayer}`
			}'s turn on board ${activeBoard + 1}.`;
		}
	}

	setupVsComputerSwitch(callback) {
		this.elements.vsComputerSwitch.addEventListener("change", () => {
			this.vsComputer = this.elements.vsComputerSwitch.checked;
			this.elements.vsLabel.textContent = this.vsComputer
				? "vs Computer"
				: "vs Human";
			this.elements.aiOptions.style.display = this.vsComputer
				? "block"
				: "none";
			this.elements.multiplayerOptions.style.display = this.vsComputer
				? "none"
				: "block";
			callback(this.vsComputer);
		});
	}

	setupResetButton(callback) {
		this.elements.resetButton.addEventListener("click", callback);
	}

	setupAIDifficultySelect(callback) {
		this.elements.aiDifficulty.addEventListener("change", (event) => {
			callback(event.target.value);
		});
	}

	setupHostGameButton(callback) {
		this.elements.hostGameButton.addEventListener("click", callback);
	}

	disableBoard() {
		const cells = document.querySelectorAll(".cell");
		cells.forEach((cell) => (cell.disabled = true));
	}

	enableBoard() {
		const cells = document.querySelectorAll(".cell");
		cells.forEach((cell) => (cell.disabled = false));
	}

	showGameUrl(url) {
		this.elements.gameUrlDiv.textContent = `Game URL: ${url}`;
		this.elements.gameUrlDiv.style.display = "block";
	}

	hideGameUrl() {
		this.elements.gameUrlDiv.style.display = "none";
	}

	showQRCode(url) {
		this.elements.qrcodeDiv.innerHTML = "";
		new QRCode(this.elements.qrcodeDiv, {
			text: url,
			width: 128,
			height: 128,
		});
		this.elements.qrcodeDiv.style.display = "block";
	}

	hideQRCode() {
		this.elements.qrcodeDiv.style.display = "none";
	}

	showWaitingMessage() {
		this.elements.gameStatus.textContent = "Waiting for opponent to join...";
	}

	showConnectedMessage() {
		this.elements.gameStatus.textContent =
			"Connected to opponent. Game is ready!";
	}

	showDisconnectedMessage() {
		this.elements.gameStatus.textContent =
			"Opponent disconnected. Refresh to start a new game.";
	}

	showErrorMessage(message) {
		this.elements.gameStatus.textContent = `Error: ${message}`;
	}

	updateTurn(isPlayerTurn) {
		if (isPlayerTurn) {
			this.elements.gameStatus.textContent = "It's your turn";
		} else {
			this.elements.gameStatus.textContent = "Waiting for opponent's move";
		}
	}

	highlightActiveBoard(boardIndex) {
		const boards = document.querySelectorAll(".small-board");
		boards.forEach((board, index) => {
			if (boardIndex === null || index === boardIndex) {
				board.classList.add("active-board");
			} else {
				board.classList.remove("active-board");
			}
		});
	}

	updateCell(bigIndex, smallIndex, symbol) {
		const cell = document.querySelector(
			`.small-board:nth-child(${bigIndex + 1}) .cell:nth-child(${
				smallIndex + 1
			})`
		);
		if (cell) {
			cell.textContent = symbol;
			cell.classList.add(symbol === "X" ? "x-move" : "o-move");
		}
	}

	markSmallBoardWinner(boardIndex, winner) {
		const board = document.querySelector(
			`.small-board:nth-child(${boardIndex + 1})`
		);
		if (board) {
			board.classList.add("won-board");
			board.dataset.winner = winner;
		}
	}

	resetUI() {
		const cells = document.querySelectorAll(".cell");
		cells.forEach((cell) => {
			cell.textContent = "";
			cell.classList.remove("x-move", "o-move");
			cell.disabled = false;
		});

		const boards = document.querySelectorAll(".small-board");
		boards.forEach((board) => {
			board.classList.remove("won-board", "active-board");
			delete board.dataset.winner;
		});

		this.elements.gameStatus.textContent = "Game reset. X's turn.";
		this.hideGameUrl();
		this.hideQRCode();
	}
}
