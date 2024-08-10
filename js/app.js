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
		this.peer = null;
		this.connection = null;
		this.isHost = false;
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
		});

		this.ui.initBoard();
		this.updateUI();

		// Check if we're joining a game
		const urlParams = new URLSearchParams(window.location.search);
		const gameId = urlParams.get("game");
		if (gameId) {
			this.joinGame(gameId);
		}
	}

	handleMove(bigIndex, smallIndex, isRemoteMove = false) {
		if (this.game.isValidMove(bigIndex, smallIndex)) {
			if (
				this.connection &&
				!isRemoteMove &&
				this.game.currentPlayer !== this.playerSymbol
			) {
				return; // Not your turn in multiplayer
			}

			this.game.makeMove(bigIndex, smallIndex);
			this.updateUI();

			if (!this.gameActive) {
				this.gameActive = true;
				this.menuManager.hideMenu();
			}

			if (this.connection && !isRemoteMove) {
				this.multiplayerManager.sendMove(bigIndex, smallIndex);
			}

			if (
				this.vsComputer &&
				this.game.currentPlayer === "O" &&
				!this.game.winner
			) {
				setTimeout(() => this.makeComputerMove(), 1000);
			}
		}
	}

	makeComputerMove() {
		const [bigIndex, smallIndex] = this.ai.getMove(
			this.game.getState(),
			this.game.activeBoard
		);
		this.handleMove(bigIndex, smallIndex);
	}

	toggleVsComputer(isVsComputer) {
		this.vsComputer = isVsComputer;
		this.resetGame();
	}

	hostGame() {
		this.isMultiplayer = true;
		this.multiplayerManager.hostGame(this.handleRemoteMove.bind(this), () => {
			this.gameActive = true;
			this.menuManager.hideMenu();
			this.multiplayerManager.hideQROverlay();
		});
		this.isHost = true;
	}

	joinGame(gameId) {
		this.isMultiplayer = true;
		this.multiplayerManager.joinGame(
			gameId,
			this.handleRemoteMove.bind(this),
			() => {
				this.gameActive = true;
				this.menuManager.hideMenu();
			}
		);
		this.isHost = false;
	}

	handleRemoteMove(bigIndex, smallIndex) {
		this.game.makeMove(bigIndex, smallIndex);
		this.updateUI();
		if (!this.gameActive) {
			this.gameActive = true;
			this.menuManager.hideMenu();
		}
	}

	resetGame() {
		this.game.reset();
		this.ui.resetBoard();
		this.updateUI();
		this.gameActive = false;
		this.menuManager.showMenu();
		if (this.connection && this.isHost) {
			this.multiplayerManager.sendMove({ type: "RESET" });
		}
	}

	updateUI() {
		this.ui.updateBoard(this.game.getState());
		this.ui.updateStatus(this.game.getStatus());
	}
}

document.addEventListener("DOMContentLoaded", () => {
	new App();
});
