// aiPlayer.js

export class AIPlayer {
	constructor(difficulty = "medium") {
		this.difficulty = difficulty;
	}

	makeMove(superBoard, activeBoard) {
		let validBoards =
			activeBoard === null ? [...Array(9).keys()] : [activeBoard];
		validBoards = validBoards.filter(
			(board) => !this.checkWinner(superBoard[board])
		);

		if (validBoards.length === 0) return null;

		let bigIndex, smallIndex;

		switch (this.difficulty) {
			case "easy":
				[bigIndex, smallIndex] = this.makeEasyMove(superBoard, validBoards);
				break;
			case "medium":
				[bigIndex, smallIndex] = this.makeMediumMove(superBoard, validBoards);
				break;
			case "hard":
				[bigIndex, smallIndex] = this.makeHardMove(superBoard, validBoards);
				break;
		}

		return { bigIndex, smallIndex };
	}

	makeEasyMove(superBoard, validBoards) {
		const bigIndex =
			validBoards[Math.floor(Math.random() * validBoards.length)];
		const emptyCells = this.getValidMoves(superBoard[bigIndex]);
		const smallIndex =
			emptyCells[Math.floor(Math.random() * emptyCells.length)];
		return [bigIndex, smallIndex];
	}

	makeMediumMove(superBoard, validBoards) {
		const bigIndex =
			validBoards[Math.floor(Math.random() * validBoards.length)];
		const smallIndex = this.getBestMove(superBoard[bigIndex]);
		return [bigIndex, smallIndex];
	}

	makeHardMove(superBoard, validBoards) {
		let bestScore = -Infinity;
		let bestMove;

		for (const board of validBoards) {
			const move = this.getBestMove(superBoard[board]);
			const score = this.minimax(
				superBoard[board],
				0,
				false,
				-Infinity,
				Infinity
			);
			if (score > bestScore) {
				bestScore = score;
				bestMove = { bigIndex: board, smallIndex: move };
			}
		}

		return [bestMove.bigIndex, bestMove.smallIndex];
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
		const winner = this.checkWinner(board);
		if (winner === "O") return 10 - depth;
		if (winner === "X") return depth - 10;
		if (this.getValidMoves(board).length === 0) return 0;

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

	getValidMoves(board) {
		return board.reduce(
			(acc, cell, index) => (!cell ? [...acc, index] : acc),
			[]
		);
	}
}
