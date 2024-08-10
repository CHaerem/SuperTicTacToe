// js/app.js
import { Game } from "./game.js";
import { AIPlayer } from "./aiPlayer.js";
import { UI } from "./ui.js";
import { MultiplayerManager } from "../common/multiplayerManager.js";
import { MenuManager } from "../common/menuManager.js";

class App {
	constructor() {
		this.game = new Game();
		this.ai = new AIPlayer(this.game);
		this.ui = new UI(this.handleMove.bind(this));
		this.multiplayerManager = new MultiplayerManager();
		this.menuManager = new MenuManager();

		this.vsComputer = false;
		this.isMultiplayer = false;
		this.isOnlineMultiplayer = false;
		this.playerSymbol = null;
		this.gameActive = false;
		this.isFirstMove = true;

		this.init();
	}

	init() {
		this.menuManager.init({
			onVsComputerToggle: this.toggleVsComputer.bind(this),
			onHostGame: this.hostGame.bind(this),
			onResetGame: this.resetGame.bind(this),
			onAIDifficultyChange: (difficulty) => this.ai.setDifficulty(difficulty),
			onComputerStart: this.startComputerGame.bind(this),
			onLocalMultiplayerStart: this.startLocalMultiplayerGame.bind(this),
		});

		this.multiplayerManager.onGameStateUpdate = this.updateGameState.bind(this);
		this.multiplayerManager.onRemoteMove = this.handleRemoteMove.bind(this);
		this.multiplayerManager.onPlayerJoined = this.onPlayerJoined.bind(this);
		this.multiplayerManager.onGameStart = this.onGameStart.bind(this);

		this.ui.initBoard();
		this.updateUI();

		// Check if we're joining a game
		const urlParams = new URLSearchParams(window.location.search);
		const gameId = urlParams.get("game");
		if (gameId) {
			this.joinGame(gameId);
		} else {
			this.menuManager.showMenu();
		}
	}

	startLocalMultiplayerGame() {
		console.log("Starting local multiplayer game");
		this.gameActive = true;
		this.vsComputer = false;
		this.isMultiplayer = true;
		this.isOnlineMultiplayer = false;
		this.playerSymbol = "X"; // Local games always start with X
		this.game.reset();
		this.ui.resetBoard();
		this.updateUI();
		this.menuManager.hideMenu();
	}

	handleMove(bigIndex, smallIndex, isComputerMove = false) {
		if (!this.gameActive) {
			if (this.isMultiplayer && !this.isOnlineMultiplayer) {
				this.startLocalMultiplayerGame();
			} else if (!this.vsComputer && !this.isMultiplayer) {
				this.startLocalMultiplayerGame();
			} else if (this.vsComputer) {
				this.startComputerGame(true); // Player starts
			}
		}

		if (!this.gameActive) return;

		console.log("HandleMove called:", { bigIndex, smallIndex, isComputerMove });
		console.log("Game state before move:", this.game.getState());

		if (this.game.isValidMove(bigIndex, smallIndex)) {
			if (this.isOnlineMultiplayer) {
				if (!this.multiplayerManager.isValidTurn()) {
					console.log("Not your turn in online multiplayer");
					return;
				}

				if (this.isFirstMove) {
					this.playerSymbol = "X";
					this.multiplayerManager.sendGameStart("X");
					this.isFirstMove = false;
				}
			}

			this.game.makeMove(bigIndex, smallIndex);
			this.updateUI();

			console.log("Move made. New game state:", this.game.getState());

			if (this.isOnlineMultiplayer) {
				this.multiplayerManager.sendMove(bigIndex, smallIndex);
				this.multiplayerManager.sendGameState(this.game.getState());
			}

			if (this.vsComputer && !isComputerMove && !this.game.winner) {
				this.triggerComputerMove();
			}
		} else {
			console.log("Invalid move attempted");
		}
	}

	handleRemoteMove(bigIndex, smallIndex) {
		if (this.isOnlineMultiplayer) {
			if (this.isFirstMove) {
				this.playerSymbol = "O";
				this.isFirstMove = false;
			}
			this.game.makeMove(bigIndex, smallIndex);
			this.updateUI();
		}
	}

	onGameStart(firstPlayerSymbol) {
		if (firstPlayerSymbol === "X") {
			this.playerSymbol = "O";
		} else {
			this.playerSymbol = "X";
		}
		this.isFirstMove = false;
		console.log(`Game started. You are player ${this.playerSymbol}`);
	}

	updateGameState(gameState) {
		this.game.setState(gameState);
		this.updateUI();
	}

	async hostGame() {
		this.isMultiplayer = true;
		this.isOnlineMultiplayer = true;
		await this.multiplayerManager.hostGame();
		this.startMultiplayerGame();
	}

	async joinGame(gameId) {
		this.isMultiplayer = true;
		this.isOnlineMultiplayer = true;
		await this.multiplayerManager.joinGame(gameId);
		this.startMultiplayerGame();
	}

	startMultiplayerGame() {
		console.log("Starting online multiplayer game");
		this.gameActive = true;
		this.vsComputer = false;
		this.isMultiplayer = true;
		this.isOnlineMultiplayer = true;
		this.isFirstMove = true;
		this.game.reset();
		this.ui.resetBoard();
		this.updateUI();
		this.menuManager.hideMenu();
	}

	toggleVsComputer(isVsComputer) {
		console.log("Toggling vsComputer mode:", isVsComputer);
		this.vsComputer = isVsComputer;
		this.isMultiplayer = false;
		this.isOnlineMultiplayer = false;
		if (!isVsComputer) {
			this.resetGame();
		}
	}

	resetGame() {
		console.log("Resetting game");
		this.game.reset();
		this.ui.resetBoard();
		this.gameActive = false;
		this.vsComputer = false;
		this.isMultiplayer = false;
		this.isOnlineMultiplayer = false;
		this.playerSymbol = null;
		this.isFirstMove = true;
		this.menuManager.resetMenuState();
		this.menuManager.showMenu();
		this.updateUI();
	}

	updateUI() {
		this.ui.updateBoard(this.game.getState());
		this.ui.updateStatus(this.game.getStatus());
	}

	triggerComputerMove() {
		console.log(
			"Triggering computer move. Current player:",
			this.game.currentPlayer,
			"Player symbol:",
			this.playerSymbol
		);
		if (this.game.currentPlayer !== this.playerSymbol) {
			setTimeout(() => {
				const [bigIndex, smallIndex] = this.ai.getMove(
					this.game.getState(),
					this.game.activeBoard
				);
				console.log("Computer chose move:", bigIndex, smallIndex);
				this.handleMove(bigIndex, smallIndex, true);
			}, 500);
		}
	}

	onPlayerJoined() {
		console.log("Player joined the game");
		// Add any additional logic you want to execute when a player joins
	}

	startComputerGame(playerStarts = false) {
		console.log("Starting game against computer");
		this.gameActive = true;
		this.vsComputer = true;
		this.isMultiplayer = false;
		this.isOnlineMultiplayer = false;
		this.playerSymbol = playerStarts ? "X" : "O";
		this.game.reset();
		this.ui.resetBoard();
		this.updateUI();
		this.menuManager.hideMenu();

		if (!playerStarts) {
			this.triggerComputerMove();
		}
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new App();
});
