# Super Tic Tac Toe

Super Tic Tac Toe is an advanced version of the classic Tic Tac Toe game, featuring a 3x3 grid of Tic Tac Toe boards. This implementation includes both local play and online multiplayer options.

## Play Online

You can play Super Tic Tac Toe online without any setup by visiting:

[CHaerem.github.io/SuperTicTacToe](https://CHaerem.github.io/SuperTicTacToe)

## Features

- 3x3 grid of Tic Tac Toe boards
- Play against a friend locally
- Play against the computer with three difficulty levels:
  - Easy
  - Medium
  - Hard
- Online multiplayer using peer-to-peer connections
- Responsive design using Tailwind CSS
- QR code generation for easy game sharing

## Technologies Used

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- PeerJS for peer-to-peer connections
- QRCode.js for QR code generation

## Setup

1. Clone the repository:

   ```
   git clone https://github.com/your-username/super-tic-tac-toe.git
   ```

2. Navigate to the project directory:

   ```
   cd super-tic-tac-toe
   ```

3. Open `index.html` in your web browser to start the game locally.

## How to Play

1. The game is played on a 3x3 grid of Tic Tac Toe boards.
2. Each turn, you mark a square in one of the smaller 3x3 boards.
3. Your move determines which board your opponent plays in next.
4. Win three smaller boards in a row to win the game.

### Playing Against the Computer

1. Toggle the switch to "vs Computer" mode.
2. Select the AI difficulty level: Easy, Medium, or Hard.
3. Start playing! The computer will make its moves automatically.

### Online Multiplayer

1. Click the "Host Game" button to start a new online game.
2. Share the generated game URL or QR code with your opponent.
3. The opponent can join by opening the URL or scanning the QR code.

## License

This project is open source and available under the [MIT License](LICENSE).
