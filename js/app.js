// app.js

import { BoardRenderer } from "./boardRenderer.js";
import { AIPlayer } from "./aiPlayer.js";
import { MultiplayerSetup } from "./multiplayerSetup.js";
import { UIManager } from "./uiManager.js";
import { GameLogic } from "./gameLogic.js";

document.addEventListener("DOMContentLoaded", () => {
	// Game variables
	let vsComputer = false;
	let aiDifficulty = "medium";

	// DOM elements
	const elements = {
		gameBoard: document.getElementById("game-board"),
		gameStatus: document.getElementById("game-status"),
		resetButton: document.getElementById("reset-game"),
		vsComputerSwitch: document.getElementById("vs-computer"),
		vsLabel: document.getElementById("vs-label"),
		aiOptions: document.getElementById("ai-options"),
		aiDifficulty: document.getElementById("ai-difficulty"),
		hostGameButton: document.getElementById("host-game"),
		multiplayerOptions: document.getElementById("multiplayer-options"),
		qrcodeDiv: document.getElementById("qrcode"),
		gameUrlDiv: document.getElementById("game-url"),
	};

	// Initialize modules
	const gameLogic = new GameLogic();
	const boardRenderer = new BoardRenderer(elements.gameBoard);
	const aiPlayer = new AIPlayer(aiDifficulty);
	const multiplayerSetup = new MultiplayerSetup(
		elements.gameStatus,
		elements.qrcodeDiv,
		elements.gameUrlDiv
	);
	const uiManager = new UIManager(elements);

	// Game logic functions
	function handleMove(bigIndex, smallIndex, isRemoteMove = false) {
		if (!gameLogic.isValidMove(bigIndex, smallIndex)) {
			return;
		}

		if (
			multiplayerSetup.isConnected() &&
			!isRemoteMove &&
			gameLogic.currentPlayer !== multiplayerSetup.playerSymbol
		) {
			return; // Not your turn in multiplayer
		}

		gameLogic.makeMove(bigIndex, smallIndex);
		updateUIAfterMove(bigIndex, smallIndex);

		if (vsComputer && gameLogic.currentPlayer === "O" && !gameLogic.winner) {
			setTimeout(makeComputerMove, 1000);
		}

		if (multiplayerSetup.isConnected() && !isRemoteMove) {
			multiplayerSetup.sendMove(bigIndex, smallIndex);
		}
	}

	function updateUIAfterMove(bigIndex, smallIndex) {
		const gameState = gameLogic.getGameState();
		uiManager.updateCell(
			bigIndex,
			smallIndex,
			gameState.superBoard[bigIndex][smallIndex]
		);

		if (gameState.smallWinners[bigIndex]) {
			uiManager.markSmallBoardWinner(
				bigIndex,
				gameState.smallWinners[bigIndex]
			);
		}

		uiManager.highlightActiveBoard(gameState.activeBoard);
		uiManager.updateGameStatus(
			gameState.winner,
			gameState.activeBoard,
			gameState.currentPlayer
		);
	}

	function makeComputerMove() {
		const gameState = gameLogic.getGameState();
		const move = aiPlayer.makeMove(gameState.superBoard, gameState.activeBoard);
		if (move) {
			handleMove(move.bigIndex, move.smallIndex);
		}
	}

	function resetGame() {
		gameLogic.resetGame();
		boardRenderer.initializeBoard(handleMove);
		uiManager.resetUI();
		const gameState = gameLogic.getGameState();
		uiManager.updateGameStatus(
			gameState.winner,
			gameState.activeBoard,
			gameState.currentPlayer
		);

		if (multiplayerSetup.isConnected() && multiplayerSetup.isHost) {
			multiplayerSetup.sendReset();
		}
	}

	// Event listeners and setup
	uiManager.setupVsComputerSwitch((isVsComputer) => {
		vsComputer = isVsComputer;
		resetGame();
	});

	uiManager.setupResetButton(resetGame);

	uiManager.setupAIDifficultySelect((difficulty) => {
		aiDifficulty = difficulty;
		aiPlayer.setDifficulty(difficulty);
	});

	uiManager.setupHostGameButton(async () => {
		try {
			const peerId = await multiplayerSetup.hostGame();
			uiManager.showGameUrl(multiplayerSetup.generateGameUrl(peerId));
			uiManager.showQRCode(multiplayerSetup.generateGameUrl(peerId));
			uiManager.showWaitingMessage();
			await multiplayerSetup.waitForOpponent();
			uiManager.showConnectedMessage();
			resetGame();
		} catch (error) {
			uiManager.showErrorMessage(error.message);
		}
	});

	multiplayerSetup.setOnMoveCallback((bigIndex, smallIndex) => {
		handleMove(bigIndex, smallIndex, true);
	});

	multiplayerSetup.setOnResetCallback(resetGame);

	// Initialize the game
	boardRenderer.initializeBoard(handleMove);

	// Check if we're joining a game
	const urlParams = new URLSearchParams(window.location.search);
	const gameId = urlParams.get("game");
	if (gameId) {
		multiplayerSetup
			.joinGame(gameId)
			.then(() => {
				uiManager.showConnectedMessage();
				resetGame();
			})
			.catch((error) => {
				uiManager.showErrorMessage(error.message);
			});
	}
});
