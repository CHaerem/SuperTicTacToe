// game.js
export class Game {
	constructor() {
		this.lines = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
		this.reset();
	}

	reset() {
		this.superBoard = Array(9)
			.fill(null)
			.map(() => Array(9).fill(null));
		this.currentPlayer = "X";
		this.activeBoard = null;
		this.winner = null;
		this.smallWinners = Array(9).fill(null);
	}

	isValidMove(bigIndex, smallIndex) {
		return (
			!this.winner &&
			(this.activeBoard === null || this.activeBoard === bigIndex) &&
			!this.superBoard[bigIndex][smallIndex] &&
			!this.smallWinners[bigIndex]
		);
	}

	makeMove(bigIndex, smallIndex) {
		if (this.isValidMove(bigIndex, smallIndex)) {
			this.superBoard[bigIndex][smallIndex] = this.currentPlayer;
			this.updateSmallWinner(bigIndex);
			this.updateWinner();
			this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
			this.activeBoard = this.smallWinners[smallIndex] ? null : smallIndex;
		}
	}

	updateSmallWinner(bigIndex) {
		const winner = this.checkWinner(this.superBoard[bigIndex]);
		if (winner) {
			this.smallWinners[bigIndex] = winner;
		}
	}

	updateWinner() {
		this.winner = this.checkWinner(this.smallWinners);
	}

	checkWinner(board) {
		for (let i = 0; i < this.lines.length; i++) {
			const [a, b, c] = this.lines[i];
			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
				return board[a];
			}
		}
		return null;
	}

	getWinningCombo(board) {
		for (let i = 0; i < this.lines.length; i++) {
			const [a, b, c] = this.lines[i];
			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
				return this.lines[i];
			}
		}
		return null;
	}

	getValidMoves(board) {
		return board.reduce(
			(acc, cell, index) => (!cell ? [...acc, index] : acc),
			[]
		);
	}

	getState() {
		return {
			superBoard: this.superBoard,
			currentPlayer: this.currentPlayer,
			activeBoard: this.activeBoard,
			winner: this.winner,
			smallWinners: this.smallWinners,
		};
	}

	getStatus() {
		if (this.winner) {
			return `Player ${this.winner} wins the game!`;
		} else if (this.activeBoard === null) {
			return `Player ${this.currentPlayer}'s turn. Choose any board.`;
		} else {
			return `Player ${this.currentPlayer}'s turn on board ${
				this.activeBoard + 1
			}.`;
		}
	}

	setState(state) {
		this.superBoard = state.superBoard;
		this.currentPlayer = state.currentPlayer;
		this.activeBoard = state.activeBoard;
		this.winner = state.winner;
		this.smallWinners = state.smallWinners;
	}
}
