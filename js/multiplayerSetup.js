// multiplayerSetup.js

export class MultiplayerSetup {
	constructor(gameStatus, qrcodeDiv, gameUrlDiv) {
		this.gameStatus = gameStatus;
		this.qrcodeDiv = qrcodeDiv;
		this.gameUrlDiv = gameUrlDiv;
		this.peer = null;
		this.connection = null;
		this.isHost = false;
		this.playerSymbol = "X";
		this.onMoveCallback = null;
		this.onResetCallback = null;
	}

	hostGame() {
		return new Promise((resolve, reject) => {
			this.peer = new Peer();
			this.peer.on("open", (id) => {
				console.log("My peer ID is: " + id);
				const gameUrl = this.generateGameUrl(id);
				this.generateQRCode(gameUrl);
				this.gameUrlDiv.textContent = `Game URL: ${gameUrl}`;
				this.gameUrlDiv.style.display = "block";
				this.isHost = true;
				this.playerSymbol = "X";
				resolve(id);
			});
			this.peer.on("error", (error) => {
				console.error("PeerJS error:", error);
				reject(error);
			});
		});
	}

	waitForOpponent() {
		return new Promise((resolve) => {
			this.peer.on("connection", (conn) => {
				this.connection = conn;
				this.setupConnection(conn);
				resolve();
			});
		});
	}

	joinGame(peerId) {
		return new Promise((resolve, reject) => {
			this.peer = new Peer();
			this.peer.on("open", () => {
				const conn = this.peer.connect(peerId);
				this.connection = conn;
				this.setupConnection(conn);
				this.isHost = false;
				this.playerSymbol = "O";
				resolve();
			});
			this.peer.on("error", (error) => {
				console.error("PeerJS error:", error);
				reject(error);
			});
		});
	}

	setupConnection(conn) {
		conn.on("open", () => {
			this.gameStatus.textContent = "Connected to peer. Game is ready!";
		});

		conn.on("data", (data) => {
			console.log("Received", data);
			if (data.type === "MOVE") {
				if (this.onMoveCallback) {
					this.onMoveCallback(data.bigIndex, data.smallIndex);
				}
			} else if (data.type === "RESET") {
				if (this.onResetCallback) {
					this.onResetCallback();
				}
			}
		});

		conn.on("close", () => {
			this.gameStatus.textContent =
				"Connection closed. Refresh to start a new game.";
			this.connection = null;
		});
	}

	generateGameUrl(peerId) {
		const url = new URL(window.location.href);
		url.searchParams.set("game", peerId);
		return url.href;
	}

	generateQRCode(url) {
		this.qrcodeDiv.innerHTML = "";
		new QRCode(this.qrcodeDiv, {
			text: url,
			width: 128,
			height: 128,
		});
	}

	sendMove(bigIndex, smallIndex) {
		if (this.connection) {
			this.connection.send({ type: "MOVE", bigIndex, smallIndex });
		}
	}

	sendReset() {
		if (this.connection) {
			this.connection.send({ type: "RESET" });
		}
	}

	setOnMoveCallback(callback) {
		this.onMoveCallback = callback;
	}

	setOnResetCallback(callback) {
		this.onResetCallback = callback;
	}

	isConnected() {
		return this.connection !== null;
	}

	closeConnection() {
		if (this.connection) {
			this.connection.close();
		}
		if (this.peer) {
			this.peer.destroy();
		}
		this.connection = null;
		this.peer = null;
	}
}
