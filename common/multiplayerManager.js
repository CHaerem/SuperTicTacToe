// common/multiplayerManager.js
export class MultiplayerManager {
	constructor() {
		this.peer = null;
		this.connection = null;
		this.isHost = false;
		this.playerSymbol = null;
		this.isMyTurn = true; // Both players start with the ability to move
		this.onRemoteMove = null;
		this.onGameStateUpdate = null;
		this.onPlayerJoined = null;
		this.onGameStart = null;
		this.qrcodeDiv = document.getElementById("qrcode");
		this.gameUrlDiv = document.getElementById("game-url");
		this.qrOverlay = document.getElementById("qr-overlay");
		this.gameUrlDiv.addEventListener("click", () =>
			this.copyGameUrlToClipboard()
		);
	}

	hostGame() {
		return new Promise((resolve) => {
			this.peer = new Peer();
			this.peer.on("open", (id) => {
				console.log("My peer ID is: " + id);
				const gameUrl = this.generateGameUrl(id);
				this.generateQRCode(gameUrl);
				this.updateGameUrlDisplay(gameUrl);
				this.isHost = true;
			});
			this.peer.on("connection", (conn) => {
				this.connection = conn;
				this.setupConnection(conn);
				if (this.onPlayerJoined) {
					this.onPlayerJoined();
				}
				resolve();
			});
		});
	}

	joinGame(peerId) {
		return new Promise((resolve) => {
			this.peer = new Peer();
			this.peer.on("open", () => {
				const conn = this.peer.connect(peerId);
				this.connection = conn;
				this.setupConnection(conn);
				this.isHost = false;
				resolve();
			});
		});
	}

	setupConnection(conn) {
		conn.on("open", () => {
			this.updateGameStatus("Connected to peer. Game is ready!");
			this.hideQROverlay();
		});

		conn.on("data", (data) => {
			console.log("Received", data);
			if (data.type === "MOVE") {
				if (this.onRemoteMove) {
					this.onRemoteMove(data.bigIndex, data.smallIndex);
				}
				this.isMyTurn = true;
			} else if (data.type === "GAME_STATE") {
				if (this.onGameStateUpdate) {
					this.onGameStateUpdate(data.gameState);
				}
			} else if (data.type === "GAME_START") {
				if (this.onGameStart) {
					this.onGameStart(data.firstPlayerSymbol);
				}
			}
		});

		conn.on("close", () => {
			this.updateGameStatus("Connection closed. Refresh to start a new game.");
			this.connection = null;
		});
	}

	sendMove(bigIndex, smallIndex) {
		if (this.connection && this.isMyTurn) {
			this.connection.send({ type: "MOVE", bigIndex, smallIndex });
			this.isMyTurn = false;
		}
	}

	sendGameState(gameState) {
		if (this.connection) {
			this.connection.send({ type: "GAME_STATE", gameState });
		}
	}

	sendGameStart(firstPlayerSymbol) {
		if (this.connection) {
			this.connection.send({ type: "GAME_START", firstPlayerSymbol });
		}
	}

	isValidTurn() {
		return this.isMyTurn;
	}

	copyGameUrlToClipboard() {
		const url = this.gameUrlDiv.textContent.replace("Game URL: ", "");
		navigator.clipboard
			.writeText(url)
			.then(() => {
				alert("Game URL copied to clipboard!");
			})
			.catch((err) => {
				console.error("Failed to copy URL: ", err);
			});
	}

	generateGameUrl(peerId) {
		const url = new URL(window.location.href);
		url.searchParams.set("game", peerId);
		return url.href;
	}

	generateQRCode(url) {
		this.qrcodeDiv.innerHTML = "";
		new QRCode(this.qrcodeDiv, url);
	}

	updateGameUrlDisplay(url) {
		this.gameUrlDiv.textContent = `Game URL: ${url}`;
	}

	updateGameStatus(status) {
		const gameStatus = document.getElementById("game-status");
		gameStatus.textContent = status;
	}

	hideQROverlay() {
		this.qrOverlay.classList.add("hidden");
	}
}
