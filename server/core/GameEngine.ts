import { Player, Phase, Role, VoteResult } from '../types/types';

class GameEngine {
    private players: Player[] = [];
    private phase: Phase = 'waiting';
    
    // Key is player ID
    private votes: Record <string, string> = {};
    private voteTieCandidates: string[] | null = null;

    // Stores detective choice and result
    private detectiveTargetId: string | null = null;
    private detectiveResult: string | null = null;
    
    // Key is mafia player ID
    private mafiaVotes: Record<string, string> = {};
    private mafiaTargetId: string | null = null;

    private winner: "mafia win" | "villager win" | null = null;

    // Added: Sets the players list from outside the class
    setPlayers(players: Player[]): void {
        this.players = players;
    }

    startGame() {
        this.assignRoles();
        this.phase = 'night';
    }

    assignRoles() {
        const playerCount = this.players.length;
        const mafiaCount = Math.floor(playerCount/4)
        // Counts how many villagers there will be, for now only including detective
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

    // Directly handles Detective role and updates mafia target alive status upon decision
    performRoleActions() {
        // Detective role
        if (this.detectiveTargetId) {
            // Finds the selected player in the players array
            const targetPlayer = this.players.find(
                player => player.id === this.detectiveTargetId
            );

            // Sends back the result
            if (targetPlayer) {
                this.detectiveResult = targetPlayer.role;
            }

            // Clears for later use
            this.detectiveTargetId = null;
        }

        // Mafia role
        if (this.mafiaTargetId) {
            // Find mafia target
            const targetPlayer = this.players.find (
                player => player.id === this.mafiaTargetId
            );

            // Update target alive status
            if (targetPlayer) {
                targetPlayer.alive = false;
            }

            this.mafiaTargetId = null;
        }
    }

    submitMafiaVote(voterId: string, targetId: string) : void {
        // Record vote
        this.mafiaVotes[voterId] = targetId;

        // Filter out dead Mafia
        const aliveMafia = this.players.filter( 
            player => player.role === "mafia" && player.alive
        );

        // Check if all mafia voted and if unanimous
        const allVoted = aliveMafia.every(player => this.mafiaVotes[player.id]);
        // Creates array with only values, ignoring keys
        const voteTargets = Object.values(this.mafiaVotes);
        const unanimous = voteTargets.every(id => id === voteTargets[0]);

        // If all 
        if (allVoted && unanimous) {
            this.mafiaTargetId = voteTargets[0];
            this.mafiaVotes = {}; 
        }
    }

    nextPhase() {
        if (this.phase === "night") {
            // Mafia/Detective actions
            this.performRoleActions();

            // End game if winner is not null
            const winner = this.checkWinCondition();
            if (winner) {
                this.winner = winner;
                this.phase = "ended";
                return;
            }

            // Turn to day if winner is null
            this.phase = "day";
        } else if (this.phase === "day") {
            // Voting is already handled in submitVote() which will be ran separately alongside nextPhase()

            // End game if winner is not null
            const winner = this.checkWinCondition();
            if (winner) {
                this.winner = winner;
                this.phase = "ended";
                return;
            }

            // Turn to night if winner is null
            this.phase = "night";
        }
    }

    // Handles votes
    submitVote(voterId: string, targetId: string): VoteResult {
        // Gather votes from targetID, using voterID as key
        this.votes[voterId] = targetId;

        // Filter out dead players
        const alivePlayers = this.players.filter(player => player.alive);

        // Check all players are voted
        const allVoted = alivePlayers.every(player => this.votes[player.id]);

        if (allVoted) {
            // Tally for votes
            const tally: Record<string, number> = {};

            // Grabs only the values (votes) and not the keys (voter)
            Object.values(this.votes).forEach(targetId => {
                // Using new Record, victim becomes key and the value is number of votes. If victim DNE then creates new entry before adding 1 vote
                tally[targetId] = (tally[targetId] || 0) + 1;
            });

            let maxVotes = 0;
            let topVotedPlayers: string[] = [];

            // Loops through the one by one and finds the person with most votes
            for (const [targetId, count] of Object.entries(tally)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    topVotedPlayers = [targetId];
                } else if ( count === maxVotes) {
                    topVotedPlayers.push (targetId);
                }
            }

            if (topVotedPlayers.length > 1) {
                this.voteTieCandidates = topVotedPlayers;
                this.votes = {};

                // Returns signal when all players are voted, in this case it is a tie
                return { voteComplete: true, tie: true, tieCandidates: this.voteTieCandidates };
            }

            // Finds voted out player
            const votedOut = this.players.find(player => player.id === topVotedPlayers[0]);

            // Updates player's alive status
            if (votedOut) {
                votedOut.alive = false;
            }; 

            // Development purposes
            console.log("Vote tally:", tally);
            console.log("Top voted:", topVotedPlayers);

            // Clears for future use
            this.votes = {};
            this.voteTieCandidates = null;

            // Returns signal when all players are voted, no tie
            return { voteComplete: true, tie: false};
        }
    }

    checkWinCondition(): "mafia win" | "villager win" | null {
        // Gather all alive players, sort mafia out
        const alivePlayers = this.players.filter(player => player.alive);
        const mafiaAlive = alivePlayers.filter (player => player.role === "mafia").length;
        const villagerAlive = alivePlayers.length - mafiaAlive;

        // If no mafia remain, then villager win
        if (mafiaAlive === 0) return "villager win";

        // If mafia alive is greater or equal to villagers alive, mafia win
        if (mafiaAlive >= villagerAlive) return "mafia win";

        // Otherwise, return null to continue the game
        return null;
    }

    // Get publicly useful game state (for frontend or testing)
    getPublicState() {
        return {
            phase: this.phase,
            alivePlayers: this.players.filter(p => p.alive),
            voteTieCandidates: this.voteTieCandidates,
            winner: this.winner,
        };
    }

    // Get winner (testing)
    getWinner(): string | null {
        return this.winner;
    }

    // Get detective result
    getDetectiveResult(): string | null {
        return this.detectiveResult;
    }
}

// Fisher-Yates shuffle 
function shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i+1
      const temp = array[i]; // Hold current element
      array[i] = array[j];   // Swap with random index
      array[j] = temp;
    }
}