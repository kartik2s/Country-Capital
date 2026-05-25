import express from "express";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect();

let quiz = [];
db.query("SELECT * FROM capitals", (err, res) => {
    if (err) {
        console.log("error executing query", err.stack);
    }
    else {
        quiz = res.rows;
    }
    db.end();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let totalCorrect = 0;
let currentQuestion = {};

app.get("/", async (req, res) => {
    totalCorrect = 0;
    await nextQuestion();
    console.log(currentQuestion);
    res.render("index.ejs", { question: currentQuestion });
});

app.post("/submit", async (req, res) => {
    let answer = req.body.answer.trim();
    let isCorrect = false;
    if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
        isCorrect = true;
        totalCorrect++;
    }
    nextQuestion();
    res.render("index.ejs", {
        question: currentQuestion,
        totalScore: totalCorrect,
        wasCorrect: isCorrect
    });
});

async function nextQuestion() {
    const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
    currentQuestion = randomCountry;
    return currentQuestion;
}

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});