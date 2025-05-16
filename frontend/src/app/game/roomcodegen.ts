export function generateRoomCode(length = 5): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // pulls from this string
    let code = '';

    for (let i = 0; i < length; i++) { // length of the code
        const randomIndex = Math.floor(Math.random() * characters.length); // Math.floor rounds down to the nearest integer
        code += characters[randomIndex]; // If code was 'A' and randomIndex was B, code would be 'AB'
    }

    return code;
} // Generates a random room code