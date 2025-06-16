import { useState, useRef, useEffect} from 'react';
import { Button, StyleSheet, Modal} from 'react-native';

import { View, Text } from "react-native"
import { Board, Team, Choice } from "./board";

interface GameState {
  players: Player[];
  currentPlayer: Player;
  boardState: Choice[][];
  makeMove: (row: number, col: number) => void;
  newGame: () => void;
}

interface Player {
  name: string;
  symbol: Team;
  notify?: (state: GameState) => void; // Used to notify the player of their turn
}

class HumanPlayer implements Player {
  name: string;
  symbol: Team;
  constructor(name: string, symbol: Team) {
    this.name = name;
    this.symbol = symbol;
  }
}

class AIPlayer implements Player {
  name: string;
  symbol: Team;

  constructor(name: string, symbol: Team) {
    this.name = name;
    this.symbol = symbol;
  }

  notify(state: GameState) {
    if (isGameComplete(state.boardState, state.players)) return
  
    // For now, just select a random empty space
    const emptySpaces: {row: number, col: number}[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (state.boardState[row][col] === null) {
          emptySpaces.push({row, col});
        }
      }
    }
    const randomSpace = emptySpaces[Math.floor(Math.random() * emptySpaces.length)];
    if (randomSpace) {
      setTimeout(() => {
        // Simulate AI thinking time
        state.makeMove(randomSpace.row, randomSpace.col);
      }, 750)
    }
  }
}

const useBoardState = () => {
  const emptyBoard: Choice[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]
  const [boardState, setBoardState] = useState(emptyBoard);
  const update = (player: Player, row: number, col: number) => {
    const newState = [...boardState];
    newState[row][col] = player.symbol;
    setBoardState(newState)
  }
  const clear = () => {
    setBoardState(emptyBoard);
  }
  return [boardState, update, clear] as const;
};

const createGame = (participants: Player[]): GameState => {
  const p = useRef(participants);
  const players = p.current;
  const [currentPlayer, setCurrentPlayer] = useState<Player>(players[0]);
  const [boardState, update, clearBoard] = useBoardState();

  const alternateCurrentPlayer = () => {
    setCurrentPlayer(currentPlayer === players[0] ? players[1] : players[0])
  }

  const makeMove = (row: number, col: number) => {
    if (boardState[row][col] !== null) return; // Space already taken
    update(currentPlayer, row, col);
    alternateCurrentPlayer()
  }

  const newGame = () => {
    clearBoard();
    alternateCurrentPlayer();
  }
  return {
    // State
    players,
    currentPlayer,
    boardState,
    // Handlers
    makeMove,
    newGame
  }
}

function getGameResult(boardState: Choice[][], players: Player[]): string {
  if (isTied(boardState, players)) {
    return "It's a tie!";
  }
  for (const player of players) {
    if (isWinner(boardState, player)) {
      return `${player.name} wins!`;
    }
  }
  return "Game is still ongoing";
}

export default function HomeScreen() {
  const gameState = createGame([
    new HumanPlayer("Player X", "X"),
    new AIPlayer("Player O", "O"),
  ]);
  const {
    players,
    currentPlayer, 
    boardState,
    makeMove, 
    newGame, 
  } = gameState;

  useEffect(() => {
    currentPlayer.notify?.(gameState);
  }, [gameState.currentPlayer])

  const handlePress = (row: number, col: number) => {
    // Don't allow human to make moves while AI is playing
    if (currentPlayer instanceof AIPlayer) return;
    makeMove(row, col);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic-Tac-Toe</Text>
      <Text style={styles.subtitle}>Current Player: {currentPlayer.name}</Text>
      <Board
        style={{width: "100%", marginTop: 20}}
        state={boardState}
        onPress={handlePress}  
      />
      
      <Modal
        transparent={true}
        visible={isGameComplete(boardState, players)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>{getGameResult(boardState, players)}</Text>
            <Button onPress={() => newGame()} title='Play Again?'/>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: "white" },
  title: { fontSize: 20 },
  subtitle: { fontSize: 16 }, 
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: 300, padding: 20, backgroundColor: 'white', borderRadius: 10 }
});

// Helper functions to determine game state
function isWinner (boardState: Choice[][], player: Player): boolean {
  // Check rows
  for (let row = 0; row < 3; row++) {
    const choices = [boardState[row][0], boardState[row][1], boardState[row][2]]
    if (choices.every(choice => choice === player.symbol)) {
      return true;
    }
  }
  // Check columns
  for (let col = 0; col < 3; col++) {
    const choices = [boardState[0][col], boardState[1][col], boardState[2][col]]
    if (choices.every(choice => choice === player.symbol)) {
      return true;
    }
  }
  // Check diagonals
  const diagonal1 = [boardState[0][0], boardState[1][1], boardState[2][2]];
  if (diagonal1.every(choice => choice === player.symbol)) {
    return true;
  }
  const diagonal2 = [boardState[0][2], boardState[1][1], boardState[2][0]];
  if (diagonal2.every(choice => choice === player.symbol)) {
    return true;
  }

  // No winner found
  return false;
}

function winnerExists(boardState: Choice[][], players: Player[]): boolean {
  return players.some(player => isWinner(boardState, player));
}

function isTied(boardState: Choice[][], players: Player[]): boolean {
  const everySpaceFilled = boardState.every(row => row.every(space => space !== null));
  return everySpaceFilled && !winnerExists(boardState, players);
}

function isGameComplete(boardState: Choice[][], players: Player[]): boolean {
  return winnerExists(boardState, players) || isTied(boardState, players);
}