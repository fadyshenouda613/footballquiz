import express from "express";
import fs from "fs";
import path from "path";
import bodyParser from "body-parser";
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
console.log(namesArray);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index", { names: namesArray });
});

app.post('/submit', (req, res) => {
    const userInput = req.body.userInput.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let filteredNames = namesArray;

    if (userInput) {
        filteredNames = namesArray.filter(player =>
            player.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(userInput)
        );
    }

    res.json({ names: filteredNames });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
