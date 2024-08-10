// common/menuManager.js
export class MenuManager {
	constructor() {
		this.menu = document.getElementById("menu");
		this.vsComputerSwitch = document.getElementById("vs-computer");
		this.vsLabel = document.getElementById("vs-label");
		this.aiOptions = document.getElementById("ai-options");
		this.aiDifficulty = document.getElementById("ai-difficulty");
		this.hostGameButton = document.getElementById("host-game");
		this.resetButton = document.getElementById("reset-game");
		this.qrOverlay = document.getElementById("qr-overlay");
		this.closeQrButton = document.getElementById("close-qr");
	}

	init({ onVsComputerToggle, onHostGame, onResetGame, onAIDifficultyChange }) {
		this.vsComputerSwitch.addEventListener("change", () => {
			const isVsComputer = this.vsComputerSwitch.checked;
			this.vsLabel.textContent = isVsComputer ? "vs Computer" : "vs Human";
			this.aiOptions.style.display = isVsComputer ? "block" : "none";
			this.hostGameButton.style.display = isVsComputer ? "none" : "block";
			onVsComputerToggle(isVsComputer);
		});

		this.aiDifficulty.addEventListener("change", () => {
			onAIDifficultyChange(this.aiDifficulty.value);
		});

		this.hostGameButton.addEventListener("click", () => {
			onHostGame();
			this.showQROverlay();
		});

		this.resetButton.addEventListener("click", onResetGame);

		this.closeQrButton.addEventListener("click", () => {
			this.hideQROverlay();
		});

		this.aiOptions.style.display = this.vsComputerSwitch.checked
			? "block"
			: "none";
		this.hostGameButton.style.display = this.vsComputerSwitch.checked
			? "none"
			: "block";
	}

	setVsComputerState(isVsComputer) {
		this.vsComputerSwitch.checked = isVsComputer;
		this.vsLabel.textContent = isVsComputer ? "vs Computer" : "vs Human";
		this.aiOptions.style.display = isVsComputer ? "block" : "none";
		this.hostGameButton.style.display = isVsComputer ? "none" : "block";
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
