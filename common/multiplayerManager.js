// common/multiplayerManager.js

export class MultiplayerManager {
	constructor() {
		this.peer = null;
		this.connection = null;
		this.isHost = false;
		this.playerSymbol = "X";
		this.onRemoteMove = null;
		this.onGameStateUpdate = null;
		this.onPlayerJoined = null;
		this.qrcodeDiv = document.getElementById("qrcode");
		this.gameUrlDiv = document.getElementById("game-url");
		this.qrOverlay = document.getElementById("qr-overlay");
		this.gameUrlDiv.addEventListener("click", () =>
			this.copyGameUrlToClipboard()
		);
	}

	hostGame(onPlayerJoined) {
		this.onPlayerJoined = onPlayerJoined;
		this.peer = new Peer();
		this.peer.on("open", (id) => {
			console.log("My peer ID is: " + id);
			const gameUrl = this.generateGameUrl(id);
			this.generateQRCode(gameUrl);
			this.updateGameUrlDisplay(gameUrl);
			this.isHost = true;
			this.playerSymbol = "X";
		});
		this.peer.on("connection", (conn) => {
			this.connection = conn;
			this.setupConnection(conn);
			if (this.onPlayerJoined) {
				this.onPlayerJoined();
			}
		});
	}

	joinGame(peerId, onConnectionEstablished) {
		this.peer = new Peer();
		this.peer.on("open", () => {
			const conn = this.peer.connect(peerId);
			this.connection = conn;
			this.setupConnection(conn);
			this.isHost = false;
			this.playerSymbol = "O";
			if (onConnectionEstablished) {
				onConnectionEstablished();
			}
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
			} else if (data.type === "GAME_STATE") {
				if (this.onGameStateUpdate) {
					this.onGameStateUpdate(data.gameState);
				}
			}
		});

		conn.on("close", () => {
			this.updateGameStatus("Connection closed. Refresh to start a new game.");
			this.connection = null;
		});
	}

	sendMove(bigIndex, smallIndex) {
		if (this.connection) {
			this.connection.send({ type: "MOVE", bigIndex, smallIndex });
		}
	}

	sendGameState(gameState) {
		if (this.connection) {
			this.connection.send({ type: "GAME_STATE", gameState });
		}
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
