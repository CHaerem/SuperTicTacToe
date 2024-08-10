// common/menuManager.js
export class MenuManager {
	constructor() {
		this.menu = document.getElementById("menu");
		this.vsComputerSwitch = document.getElementById("vs-computer");
		this.vsLabel = document.getElementById("vs-label");
		this.aiOptions = document.getElementById("ai-options");
		this.aiDifficulty = document.getElementById("ai-difficulty");
		this.hostGameButton = document.getElementById("host-game");
		this.computerStartButton = document.getElementById("computer-start");
		this.resetButton = document.getElementById("reset-game");
		this.qrOverlay = document.getElementById("qr-overlay");
		this.closeQrButton = document.getElementById("close-qr");
	}

	init({
		onVsComputerToggle,
		onHostGame,
		onResetGame,
		onAIDifficultyChange,
		onComputerStart,
	}) {
		this.vsComputerSwitch.addEventListener("change", () => {
			const isVsComputer = this.vsComputerSwitch.checked;
			this.vsLabel.textContent = isVsComputer ? "vs Computer" : "vs Human";
			this.updateVisibility();
			onVsComputerToggle(isVsComputer);
		});

		this.aiDifficulty.addEventListener("change", () => {
			onAIDifficultyChange(this.aiDifficulty.value);
		});

		this.hostGameButton.addEventListener("click", () => {
			onHostGame();
			this.showQROverlay();
		});

		this.computerStartButton.addEventListener("click", () => {
			onComputerStart();
		});

		this.resetButton.addEventListener("click", onResetGame);

		this.closeQrButton.addEventListener("click", () => {
			this.hideQROverlay();
		});

		this.updateVisibility();
	}

	updateVisibility() {
		const isVsComputer = this.vsComputerSwitch.checked;
		this.aiOptions.style.display = isVsComputer ? "block" : "none";
		this.hostGameButton.style.display = isVsComputer ? "none" : "block";
		this.computerStartButton.style.display = isVsComputer ? "block" : "none";
	}

	resetMenuState() {
		this.vsComputerSwitch.checked = false;
		this.vsLabel.textContent = "vs Human";
		this.aiDifficulty.value = "medium";
		this.updateVisibility();
	}

	setVsComputerState(isVsComputer) {
		this.vsComputerSwitch.checked = isVsComputer;
		this.vsLabel.textContent = isVsComputer ? "vs Computer" : "vs Human";
		this.updateVisibility();
	}

	setAIDifficulty(difficulty) {
		this.aiDifficulty.value = difficulty;
	}

	showQROverlay() {
		this.qrOverlay.classList.remove("hidden");
	}

	hideQROverlay() {
		this.qrOverlay.classList.add("hidden");
	}

	hideMenu() {
		this.menu.classList.add("hidden");
	}

	showMenu() {
		this.menu.classList.remove("hidden");
	}
}
