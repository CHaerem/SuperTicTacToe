const checkWinner = (board) => {
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
};

const getValidMoves = (board) => {
	return board.reduce(
		(acc, cell, index) => (!cell ? [...acc, index] : acc),
		[]
	);
};

const minimax = (board, depth, isMaximizing, alpha, beta) => {
	const winner = checkWinner(board);
	if (winner === "O") return 10 - depth;
	if (winner === "X") return depth - 10;
	if (getValidMoves(board).length === 0) return 0;

	if (isMaximizing) {
		let bestScore = -Infinity;
		for (let i = 0; i < 9; i++) {
			if (!board[i]) {
				board[i] = "O";
				const score = minimax(board, depth + 1, false, alpha, beta);
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
				const score = minimax(board, depth + 1, true, alpha, beta);
				board[i] = null;
				bestScore = Math.min(score, bestScore);
				beta = Math.min(beta, bestScore);
				if (beta <= alpha) break;
			}
		}
		return bestScore;
	}
};

const getBestMove = (board) => {
	let bestScore = -Infinity;
	let bestMove;
	for (let i = 0; i < 9; i++) {
		if (!board[i]) {
			board[i] = "O";
			const score = minimax(board, 0, false, -Infinity, Infinity);
			board[i] = null;
			if (score > bestScore) {
				bestScore = score;
				bestMove = i;
			}
		}
	}
	return bestMove;
};
