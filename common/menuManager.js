// common/menuManager.js
export class MenuManager {
	constructor() {
		this.vsComputerSwitch = document.getElementById("vs-computer");
		this.vsLabel = document.getElementById("vs-label");
		this.aiOptions = document.getElementById("ai-options");
		this.aiDifficulty = document.getElementById("ai-difficulty");
		this.hostGameButton = document.getElementById("host-game");
		this.resetButton = document.getElementById("reset-game");
	}

	init({
		onVsComputerToggle,
		onHostGame,
		onJoinGame,
		onResetGame,
		onAIDifficultyChange,
	}) {
		this.vsComputerSwitch.addEventListener("change", () => {
			const isVsComputer = this.vsComputerSwitch.checked;
			this.vsLabel.textContent = isVsComputer ? "vs Computer" : "vs Human";
			this.aiOptions.style.display = isVsComputer ? "block" : "none";
			onVsComputerToggle(isVsComputer);
		});

		this.aiDifficulty.addEventListener("change", () => {
			onAIDifficultyChange(this.aiDifficulty.value);
		});

		this.hostGameButton.addEventListener("click", onHostGame);

		this.resetButton.addEventListener("click", onResetGame);

		// Join game functionality is typically handled via URL parameter,
		// so we don't need a specific button for it.

		// Initialize the AI options display
		this.aiOptions.style.display = this.vsComputerSwitch.checked
			? "block"
			: "none";
	}

	setVsComputerState(isVsComputer) {
		this.vsComputerSwitch.checked = isVsComputer;
		this.vsLabel.textContent = isVsComputer ? "vs Computer" : "vs Human";
		this.aiOptions.style.display = isVsComputer ? "block" : "none";
	}

	setAIDifficulty(difficulty) {
		this.aiDifficulty.value = difficulty;
	}

	disableHostGame() {
		this.hostGameButton.disabled = true;
	}

	enableHostGame() {
		this.hostGameButton.disabled = false;
	}
}
