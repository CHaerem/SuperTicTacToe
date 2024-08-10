// js/ui.js

export class UI {
	constructor(moveHandler) {
		this.moveHandler = moveHandler;
		this.gameBoard = document.getElementById("game-board");
		this.gameStatus = document.getElementById("game-status");
	}

	initBoard() {
		this.gameBoard.innerHTML = "";
		for (let i = 0; i < 9; i++) {
			const smallBoard = this.createSmallBoard(i);
			this.gameBoard.appendChild(smallBoard);
		}
	}

	createSmallBoard(index) {
		const smallBoard = document.createElement("div");
		smallBoard.className = "small-board";
		for (let i = 0; i < 9; i++) {
			const cell = this.createCell(index, i);
			smallBoard.appendChild(cell);
		}
		return smallBoard;
	}

	createCell(bigIndex, smallIndex) {
		const cell = document.createElement("button");
		cell.className =
			"cell w-full h-full border flex items-center justify-center text-xl font-bold transition-all duration-300";
		cell.addEventListener("click", () =>
			this.moveHandler(bigIndex, smallIndex)
		);
		return cell;
	}

	updateBoard(gameState) {
		gameState.superBoard.forEach((smallBoard, bigIndex) => {
			const smallBoardElement = this.gameBoard.children[bigIndex];
			smallBoardElement.className = `small-board ${
				gameState.smallWinners[bigIndex] ? "won-tile" : ""
			} ${
				gameState.activeBoard === bigIndex || gameState.activeBoard === null
					? "active-board"
					: ""
			}`;

			if (gameState.smallWinners[bigIndex]) {
				smallBoardElement.setAttribute(
					"data-winner",
					gameState.smallWinners[bigIndex]
				);
			} else {
				smallBoardElement.removeAttribute("data-winner");
			}

			smallBoard.forEach((cell, smallIndex) => {
				const cellElement = smallBoardElement.children[smallIndex];
				cellElement.textContent = cell;
				cellElement.disabled =
					!!cell ||
					!!gameState.smallWinners[bigIndex] ||
					(gameState.activeBoard !== null &&
						gameState.activeBoard !== bigIndex);
				cellElement.className = `cell w-full h-full border flex items-center justify-center text-xl font-bold transition-all duration-300 
                    ${
											(gameState.activeBoard === null ||
												gameState.activeBoard === bigIndex) &&
											!gameState.smallWinners[bigIndex]
												? "bg-blue-100 border-blue-500"
												: "border-gray-300"
										}
                    ${cell ? "cursor-not-allowed" : "hover:bg-gray-100"}`;
			});
		});

		if (gameState.winner) {
			this.triggerConfetti();
		}
	}

	updateStatus(status) {
		this.gameStatus.textContent = status;
	}

	resetBoard() {
		this.initBoard();
	}

	triggerConfetti() {
		confetti({
			particleCount: 200,
			spread: 70,
			origin: { y: 0.6 },
			scalar: 1.5,
			shapes: ["square", "circle"],
			colors: [
				"#ff0000",
				"#00ff00",
				"#0000ff",
				"#ffff00",
				"#ff00ff",
				"#00ffff",
			],
		});
	}
}
