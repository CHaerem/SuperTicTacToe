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
		this.playerSymbol = "X";
		this.gameActive = false;

		this.init();
	}

	init() {
		this.menuManager.init({
			onVsComputerToggle: this.toggleVsComputer.bind(this),
			onHostGame: this.hostGame.bind(this),
			onResetGame: this.resetGame.bind(this),
			onAIDifficultyChange: (difficulty) => this.ai.setDifficulty(difficulty),
			onComputerStart: this.startComputerGame.bind(this),
		});

		this.multiplayerManager.onGameStateUpdate = this.updateGameState.bind(this);
		this.multiplayerManager.onRemoteMove = this.handleRemoteMove.bind(this);

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

	startLocalGame() {
		console.log("Starting local game");
		this.gameActive = true;
		this.vsComputer = false;
		this.isMultiplayer = false;
		this.game.reset();
		this.ui.resetBoard();
		this.updateUI();
		this.menuManager.hideMenu();
	}

	startComputerGame() {
		console.log("Starting game against computer");
		this.gameActive = true;
		this.vsComputer = true;
		this.isMultiplayer = false;
		this.playerSymbol = "O"; // Computer starts
		this.game.reset();
		this.ui.resetBoard();
		this.updateUI();
		this.menuManager.hideMenu();
		this.triggerComputerMove();
	}

	handleMove(bigIndex, smallIndex, isComputerMove = false) {
		if (!this.gameActive && !this.vsComputer && !this.isMultiplayer) {
			this.startLocalGame();
		}

		if (!this.gameActive) return;

		console.log("HandleMove called:", { bigIndex, smallIndex, isComputerMove });
		console.log("Game state before move:", this.game.getState());

		if (this.game.isValidMove(bigIndex, smallIndex)) {
			if (this.isMultiplayer) {
				if (!this.multiplayerManager.isValidTurn()) {
					console.log("Not your turn in multiplayer");
					return;
				}
			} else if (
				this.vsComputer &&
				!isComputerMove &&
				this.game.currentPlayer !== this.playerSymbol
			) {
				console.log("Not your turn against computer");
				return;
			}

			this.game.makeMove(bigIndex, smallIndex);
			this.updateUI();

			console.log("Move made. New game state:", this.game.getState());

			if (this.isMultiplayer) {
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

	handleRemoteMove(bigIndex, smallIndex) {
		this.handleMove(bigIndex, smallIndex, true);
	}

	updateGameState(gameState) {
		this.game.setState(gameState);
		this.updateUI();
	}

	async hostGame() {
		this.isMultiplayer = true;
		await this.multiplayerManager.hostGame();
		this.startLocalGame();
	}

	async joinGame(gameId) {
		this.isMultiplayer = true;
		await this.multiplayerManager.joinGame(gameId);
		this.startLocalGame();
	}

	toggleVsComputer(isVsComputer) {
		console.log("Toggling vsComputer mode:", isVsComputer);
		this.vsComputer = isVsComputer;
		this.isMultiplayer = false;
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
		this.playerSymbol = "X";
		this.menuManager.resetMenuState();
		this.menuManager.showMenu();
		this.updateUI();
	}

	updateUI() {
		this.ui.updateBoard(this.game.getState());
		this.ui.updateStatus(this.game.getStatus());
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new App();
});
