// common/multiplayerManager.js
export class MultiplayerManager {
	constructor() {
		this.peer = null;
		this.connection = null;
		this.isHost = false;
		this.playerSymbol = "X";
		this.onRemoteMove = null;
		this.qrcodeDiv = document.getElementById("qrcode");
		this.gameUrlDiv = document.getElementById("game-url");
		this.qrOverlay = document.getElementById("qr-overlay");
	}

	hostGame(onRemoteMove, onPlayerJoined) {
		this.onRemoteMove = onRemoteMove;
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
			onPlayerJoined();
		});
	}

	joinGame(peerId, onRemoteMove, onConnectionEstablished) {
		this.onRemoteMove = onRemoteMove;
		this.peer = new Peer();
		this.peer.on("open", () => {
			const conn = this.peer.connect(peerId);
			this.connection = conn;
			this.setupConnection(conn);
			this.isHost = false;
			this.playerSymbol = "O";
			onConnectionEstablished();
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
				this.onRemoteMove(data.bigIndex, data.smallIndex);
			} else if (data.type === "RESET") {
				// Trigger game reset
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
