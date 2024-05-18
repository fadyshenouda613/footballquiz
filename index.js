import express from 'express';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

// Get the current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let players = JSON.parse(fs.readFileSync(path.join(__dirname, "playersData.json"), "utf8"));
let namesArray = players.map((player, index) => ({ name: player.name, index })).slice(0, 64);
let scores = { player1: 0, player2: 0 };
let currentPlayer = 'player1';
let guessedNames = new Set(); // Maintain a set of guessed names

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/start-game", (req, res) => {
    // Reset scores, current player, and guessed names
    scores = { player1: 0, player2: 0 };
    currentPlayer = 'player1';
    guessedNames = new Set();
    // Redirect to the game page
    res.redirect("/top64");
});

app.get("/top64", (req, res) => {
    res.render("top64", { names: namesArray, scores, currentPlayer });
});

app.post('/submit', (req, res) => {
    const userInput = req.body.userInput.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const player = req.body.player; // Get the player identifier from the request
    let filteredNames = namesArray;

    if (userInput) {
        filteredNames = namesArray.filter(player => {
            const nameParts = player.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(' ');
            return nameParts.includes(userInput);
        });

        if (filteredNames.length > 0 && player === currentPlayer) {
            const matchedName = filteredNames[0].name.toLowerCase();
            if (!guessedNames.has(matchedName)) {
                scores[player] += 1; // Increment score for correct input
                guessedNames.add(matchedName); // Mark name as guessed
                filteredNames = [filteredNames[0]]; // Only consider the first match
            } else {
                filteredNames = [];
            }
        } else {
            filteredNames = [];
        }
    }

    // Switch turn to the other player
    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';

    res.json({ names: filteredNames, scores, currentPlayer });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
