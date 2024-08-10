// boardRenderer.js

export class BoardRenderer {
	constructor(gameBoard) {
		this.gameBoard = gameBoard;
	}

	createCell(bigIndex, smallIndex, handleMove) {
		const cell = document.createElement("button");
		cell.className =
			"cell w-full h-full border flex items-center justify-center text-xl font-bold transition-all duration-300";
		cell.addEventListener("click", () => handleMove(bigIndex, smallIndex));
		return cell;
	}

	createSmallBoard(index, handleMove) {
		const smallBoard = document.createElement("div");
		smallBoard.className = "small-board";
		for (let i = 0; i < 9; i++) {
			smallBoard.appendChild(this.createCell(index, i, handleMove));
		}
		return smallBoard;
	}

	initializeBoard(handleMove) {
		this.gameBoard.innerHTML = "";
		for (let i = 0; i < 9; i++) {
			this.gameBoard.appendChild(this.createSmallBoard(i, handleMove));
		}
	}

	updateBoard(superBoard, smallWinners, activeBoard, currentPlayer) {
		superBoard.forEach((smallBoard, bigIndex) => {
			const smallBoardElement = this.gameBoard.children[bigIndex];
			smallBoardElement.className = `small-board ${
				smallWinners[bigIndex] ? "won-tile" : ""
			} ${
				activeBoard === bigIndex || activeBoard === null ? "active-board" : ""
			}`;

			if (smallWinners[bigIndex]) {
				smallBoardElement.setAttribute("data-winner", smallWinners[bigIndex]);
			} else {
				smallBoardElement.removeAttribute("data-winner");
			}

			smallBoard.forEach((cell, smallIndex) => {
				const cellElement = smallBoardElement.children[smallIndex];
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
                    ${cell ? "cursor-not-allowed" : "hover:bg-gray-100"}`;
			});
		});
	}

	highlightWinningCombination(bigIndex, winningCombo) {
		const smallBoardElement = this.gameBoard.children[bigIndex];
		winningCombo.forEach((index) => {
			const cell = smallBoardElement.children[index];
			cell.classList.add("winning-cell");
		});
	}

	setActiveBoardClasses(activeBoard) {
		for (let i = 0; i < 9; i++) {
			const smallBoard = this.gameBoard.children[i];
			if (activeBoard === null || activeBoard === i) {
				smallBoard.classList.add("active-board");
			} else {
				smallBoard.classList.remove("active-board");
			}
		}
	}

	setCellSymbol(bigIndex, smallIndex, symbol) {
		const smallBoardElement = this.gameBoard.children[bigIndex];
		const cellElement = smallBoardElement.children[smallIndex];
		cellElement.textContent = symbol;
		cellElement.classList.add(
			symbol === "X" ? "text-blue-500" : "text-red-500"
		);
	}

	setSmallBoardWinner(bigIndex, winner) {
		const smallBoardElement = this.gameBoard.children[bigIndex];
		smallBoardElement.classList.add("won-tile");
		smallBoardElement.setAttribute("data-winner", winner);
	}

	resetBoard() {
		this.gameBoard.innerHTML = "";
	}
}
