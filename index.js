import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "World1",
    password: "123456",
    port: 5432,
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
    res.render("index.ejs", { question: currentQuestion});
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
        wasCorrect: isCorrect });
});

async function nextQuestion() {
    const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
    currentQuestion = randomCountry;
    return currentQuestion;
}

app.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});