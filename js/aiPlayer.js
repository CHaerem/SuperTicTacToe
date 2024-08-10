// aiPlayer.js
export class AIPlayer {
	constructor(game) {
		this.game = game;
		this.difficulty = "medium";
	}

	setDifficulty(difficulty) {
		this.difficulty = difficulty;
	}

	getMove(gameState, activeBoard) {
		const validBoards =
			activeBoard === null ? [...Array(9).keys()] : [activeBoard];
		const availableBoards = validBoards.filter(
			(board) => !gameState.smallWinners[board]
		);

		switch (this.difficulty) {
			case "easy":
				return this.getRandomMove(gameState, availableBoards);
			case "medium":
				return this.getMediumMove(gameState, availableBoards);
			case "hard":
				return this.getHardMove(gameState, availableBoards);
			default:
				return this.getMediumMove(gameState, availableBoards);
		}
	}

	getRandomMove(gameState, availableBoards) {
		const bigIndex =
			availableBoards[Math.floor(Math.random() * availableBoards.length)];
		const emptyCells = this.game.getValidMoves(gameState.superBoard[bigIndex]);
		const smallIndex =
			emptyCells[Math.floor(Math.random() * emptyCells.length)];
		return [bigIndex, smallIndex];
	}

	getMediumMove(gameState, availableBoards) {
		const bigIndex =
			availableBoards[Math.floor(Math.random() * availableBoards.length)];
		const smallIndex = this.getBestMove(gameState.superBoard[bigIndex]);
		return [bigIndex, smallIndex];
	}

	getHardMove(gameState, availableBoards) {
		let bestScore = -Infinity;
		let bestMove;

		for (const board of availableBoards) {
			const move = this.getBestMove(gameState.superBoard[board]);
			const score = this.minimax(
				gameState.superBoard[board],
				0,
				false,
				-Infinity,
				Infinity
			);
			if (score > bestScore) {
				bestScore = score;
				bestMove = [board, move];
			}
		}

		return bestMove;
	}

	getBestMove(board) {
		let bestScore = -Infinity;
		let bestMove;
		for (let i = 0; i < 9; i++) {
			if (!board[i]) {
				board[i] = "O";
				const score = this.minimax(board, 0, false, -Infinity, Infinity);
				board[i] = null;
				if (score > bestScore) {
					bestScore = score;
					bestMove = i;
				}
			}
		}
		return bestMove;
	}

	minimax(board, depth, isMaximizing, alpha, beta) {
		const winner = this.game.checkWinner(board);
		if (winner === "O") return 10 - depth;
		if (winner === "X") return depth - 10;
		if (this.game.getValidMoves(board).length === 0) return 0;

		if (isMaximizing) {
			let bestScore = -Infinity;
			for (let i = 0; i < 9; i++) {
				if (!board[i]) {
					board[i] = "O";
					const score = this.minimax(board, depth + 1, false, alpha, beta);
					board[i] = null;
					bestScore = Math.max(score, bestScore);
					alpha = Math.max(alpha, bestScore);
					if (beta <= alpha) break;
				}
			}
			return bestScore;
		} else {
			let bestScore = Infinity;
			for (let i = 0; i < 9; i++) {
				if (!board[i]) {
					board[i] = "X";
					const score = this.minimax(board, depth + 1, true, alpha, beta);
					board[i] = null;
					bestScore = Math.min(score, bestScore);
					beta = Math.min(beta, bestScore);
					if (beta <= alpha) break;
				}
			}
			return bestScore;
		}
	}
}
