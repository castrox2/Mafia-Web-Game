type Player = {id: string; role: string; alive: boolean};
type Phase = 'waiting' | 'day' | 'night' | 'ended';

class GameEngine {
    private players: Player[] = [];
    private phase: Phase = 'waiting';
    private votes: Record <string, string> = {};

    startGame() {
        this.assignRoles();
        this.phase = 'night'
    }

    assignRoles() {
        const playerCount = this.players.length;
        const mafiaCount = Math.floor(playerCount/4)
        //Counts how many villagers there will be, -1 represents detective
        const villagerCount = playerCount - mafiaCount - 1;
        const availableRoles = [
            // Create a flattened role list: [mafia, mafia, ..., villager, ..., detective]
            // The spread operator (...) flattens the filled arrays into a single array
            ...Array(mafiaCount).fill("mafia"),
            ...Array(villagerCount).fill("villager"),
            "detective"
        ];

        shuffleArray(availableRoles);

        for (let i = 0; i < playerCount; i++) {
            this.players[i].role = availableRoles[i];
        }
    }

    performRoleActions() {

    }

    nextPhase() {
        
    }

    handleVote() {

    }

    checkWinCondition() {

    }

}

//Fisher-Yates shuffle 
function shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i+1
      const temp = array[i]; // Hold current element
      array[i] = array[j];   // Swap with random index
      array[j] = temp;
    }
  }