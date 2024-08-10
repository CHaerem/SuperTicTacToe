// gameLogic.js

export class GameLogic {
	constructor() {
		this.resetGame();
	}

	resetGame() {
		this.superBoard = Array(9)
			.fill(null)
			.map(() => Array(9).fill(null));
		this.currentPlayer = "X";
		this.activeBoard = null;
		this.winner = null;
		this.smallWinners = Array(9).fill(null);
	}

	makeMove(bigIndex, smallIndex) {
		if (
			this.winner ||
			(this.activeBoard !== null && this.activeBoard !== bigIndex) ||
			this.superBoard[bigIndex][smallIndex] ||
			this.smallWinners[bigIndex]
		) {
			return false;
		}

		this.superBoard[bigIndex][smallIndex] = this.currentPlayer;

		const smallBoardWinner = this.checkWinner(this.superBoard[bigIndex]);
		if (smallBoardWinner) {
			this.smallWinners[bigIndex] = smallBoardWinner;
			this.winner = this.checkWinner(this.smallWinners);
		}

		this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
		this.activeBoard = this.smallWinners[smallIndex] ? null : smallIndex;

		return true;
	}

	checkWinner(board) {
		const lines = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
		for (let i = 0; i < lines.length; i++) {
			const [a, b, c] = lines[i];
			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
				return board[a];
			}
		}
		return null;
	}

	isValidMove(bigIndex, smallIndex) {
		return (
			!this.winner &&
			(this.activeBoard === null || this.activeBoard === bigIndex) &&
			!this.superBoard[bigIndex][smallIndex] &&
			!this.smallWinners[bigIndex]
		);
	}

	getGameState() {
		return {
			superBoard: this.superBoard,
			currentPlayer: this.currentPlayer,
			activeBoard: this.activeBoard,
			winner: this.winner,
			smallWinners: this.smallWinners,
		};
	}
}
