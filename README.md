# Super Tic Tac Toe

Super Tic Tac Toe is an advanced version of the classic Tic Tac Toe game, featuring a 3x3 grid of Tic Tac Toe boards. This implementation includes both local play and online multiplayer options.

## Play Online

You can play Super Tic Tac Toe online without any setup by visiting:

[CHaerem.github.io/SuperTicTacToe](https://CHaerem.github.io/SuperTicTacToe)

## How to Play

Super Tic Tac Toe is played on a 3x3 grid of Tic Tac Toe boards. Here are the basic rules:

1. Each turn, you mark a square in one of the smaller 3x3 boards.
2. Your move determines which board your opponent plays in next.
3. Win three smaller boards in a row to win the game.

The game adds an extra layer of strategy to the classic Tic Tac Toe, as you need to think about both the immediate board and the overall game.

## Features

- 3x3 grid of Tic Tac Toe boards
- Local multiplayer: Play against a friend on the same device
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

For online multiplayer functionality, ensure you have an active internet connection.

## Playing Modes

### Local Multiplayer

1. Open the game in your browser.
2. Select "vs Human" mode.
3. Take turns playing on the same device.

### Playing Against the Computer

1. Toggle the switch to "vs Computer" mode.
2. Select the AI difficulty level: Easy, Medium, or Hard.
3. Start playing! The computer will make its moves automatically.

### Online Multiplayer

1. Click the "Host Game" button to start a new online game.
2. Share the generated game URL or QR code with your opponent.
3. The opponent can join by opening the URL or scanning the QR code.

## Adding to Home Screen (iOS)

For the best experience on iOS devices, you can add Super Tic Tac Toe to your home screen. Here's how:

1. Open Safari and visit [CHaerem.github.io/SuperTicTacToe](https://CHaerem.github.io/SuperTicTacToe)
2. Tap the Share button (the square with an arrow pointing upward) at the bottom of the screen.
3. Scroll down and tap "Add to Home Screen".
4. Give the app a name (or keep the suggested name) and tap "Add".

Now you can launch Super Tic Tac Toe directly from your home screen, just like a native app!

## Future Improvements Checklist

- [ ] Implement robust multiplayer system:

  - [ ] Generate unique game IDs using a simple UUID function
  - [ ] Add reconnection logic to handle disconnects (retry 5 times with 5-second intervals)
  - [ ] Implement move queue to ensure move synchronization (store last 100 moves)
  - [ ] Add sequence numbers to moves to maintain order

- [ ] Enhance state management:

  - [ ] Implement game state persistence using localStorage
  - [ ] Add logic to load saved game state on page reload
  - [ ] Improve handling of player turns in online multiplayer (check current player against player symbol)

- [ ] Update user interface:

  - [ ] Add input field for game ID in the main menu
  - [ ] Create "Join Game" button next to the game ID input
  - [ ] Add visual indicator for current player's turn

- [ ] Improve error handling and user feedback:

  - [ ] Add error messages for failed connections and game joins
  - [ ] Implement status updates for reconnection attempts
  - [ ] Create toast notifications for important game events (e.g., opponent disconnected, reconnected)

- [ ] Refactor and optimize code:

  - [ ] Review Game class for potential performance improvements
  - [ ] Separate networking logic from game logic for better modularity
  - [ ] Implement a proper state management system (e.g., using a reducer pattern)

- [ ] Add new features:

  - [ ] Implement chat functionality for online multiplayer games
  - [ ] Add option to customize game board size (e.g., 4x4 or 5x5 super board)
  - [ ] Create a replay system to review past games

## Icon Attribution

The icon used in this project was sourced from [Iconscout](https://iconscout.com/free-icon/game-entertainment-fun-tictactoe-tic-tac-toe-2).
