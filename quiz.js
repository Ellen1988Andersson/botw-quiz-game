/* QUIZ GAME - ZELDA CHARACTERS */
let lastResult = null;

const quizHeader = document.getElementById('quiz-header');
const startPage = document.getElementById('start-page');
const choiceButtons = document.querySelectorAll('.choice-btn');
const restartButton = document.getElementById('restart-btn');
const nextButton = document.getElementById('next-btn');
const questionContainer = document.getElementById('question-container');
const questionElement = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const questionImage = document.getElementById('question-image');
const wrongCardsWrapper = document.getElementById('wrong-cards-wrapper');
const wrongCardsContainer = document.getElementById('wrong-cards-container');
const resultCard = document.getElementById('result-card');

const gameState = {
    shuffledQuestions: [],
    currentQuestionIndex: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    wrongGuesses: []
};

/* START GAME */
choiceButtons.forEach(button => {
    button.addEventListener('click', () => {
        const count = button.dataset.count;
        gameState.totalQuestions = count === "ALL" ? zeldaCharacters.length : Math.min(parseInt(count), zeldaCharacters.length);
        startGame();
    });
});

function resetGameState() {
    gameState.shuffledQuestions = [];
    gameState.currentQuestionIndex = 0;
    gameState.correctAnswers = 0;
    gameState.wrongGuesses = [];
}

/* START GAME */
function startGame() {
    lastResult = JSON.parse(localStorage.getItem("lastResult")) || null;
    resetGameState();

    startPage.classList.add('hide');
    document.getElementById('quiz-image').classList.add('hidden');
    resultCard.classList.add('hide');
    wrongCardsWrapper.classList.add('hide');

    gameState.shuffledQuestions = makeQuestions(zeldaCharacters)
        .sort(() => Math.random() - 0.5)
        .slice(0, gameState.totalQuestions);

    questionContainer.classList.remove('hide');
    questionImage.classList.remove('hide');
    answerButtons.classList.remove('hide');
    restartButton.classList.remove('hide');

    setNextQuestion();
}

/* NEXT QUESTION */
nextButton.addEventListener('click', () => {
    gameState.currentQuestionIndex++;
    if (gameState.currentQuestionIndex < gameState.shuffledQuestions.length) {
        setNextQuestion();
    } else {
        showResults();
    }
});

function setNextQuestion() {
    nextButton.classList.add('hide');
    resetState();
    showQuestion(gameState.shuffledQuestions[gameState.currentQuestionIndex]);
}

/* RESET ANSWERS */
function resetState() {
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

/* SHOW QUESTION */
function showQuestion(question) {
    questionElement.innerText = question.question;
    questionImage.src = question.character.image;
    questionImage.alt = question.character.name;

    question.answers.forEach(answer => {
        const btn = document.createElement('button');
        btn.innerText = answer.text;
        btn.classList.add('btn');
        if (answer.correct) btn.dataset.correct = answer.correct;
        btn.addEventListener('click', selectAnswer);
        answerButtons.appendChild(btn);
    });
}

/* CREATE QUESTIONS */
function makeQuestions(charactersArray) {
    return charactersArray.map(character => {
        const otherChars = charactersArray
            .filter(s => s.id !== character.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const answers = [
            { text: character.name, correct: true },
            ...otherChars.map(s => ({ text: s.name, correct: false }))
        ];

        return {
            question: "Who is this?",
            character: character,
            answers: shuffleArray(answers)
        };
    });
}

/* SHUFFLE ARRAY */
function shuffleArray(array) {
    const newArr = array.slice();
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

/* SELECT ANSWER */
function selectAnswer(e) {
    const selectedButton = e.target;
    const correct = selectedButton.dataset.correct === "true";
    const currentQuestion = gameState.shuffledQuestions[gameState.currentQuestionIndex];

    if (correct) {
        gameState.correctAnswers++;
    } else {
        gameState.wrongGuesses.push({
            character: currentQuestion.character,
            guessed: selectedButton.innerText
        });
    }

    Array.from(answerButtons.children).forEach(btn => {
        setStatusClass(btn, btn.dataset.correct === "true");
        btn.disabled = true;
    });

    if (gameState.currentQuestionIndex + 1 < gameState.shuffledQuestions.length) {
        nextButton.classList.remove('hide');
    } else {
        showResults();
    }
}

/* SHOW RESULTS */
function showResults() {
    questionContainer.classList.add('hide');
    questionImage.classList.add('hide');
    nextButton.classList.add('hide');

    wrongCardsContainer.innerHTML = "";
    resultCard.innerHTML = "";

    const total = gameState.shuffledQuestions.length;

    /* RESULT MESSAGES */
    let resultText;
    if (gameState.correctAnswers === total) {
        resultText = `
            <p>CONGRATZ! ALL CORRECT! 🎖️</p>
            <p>${gameState.correctAnswers} / ${total} correct</p>
        `;
    } else {
        resultText = `
            <p>You got ${gameState.correctAnswers} / ${total} correct</p>
        `;
    }

    /* COMPARE LATEST RESULT  */
    if (lastResult) {
        const prevPercent = (lastResult.correct / lastResult.total) * 100;
        const currPercent = (gameState.correctAnswers / gameState.totalQuestions) * 100;

        if (currPercent > prevPercent) {
            resultText += `
            <p>Your skills have grown stronger. You outshone your last quest!</p>
            <p>Your last result: ${lastResult.correct} / ${lastResult.total}</p>
        `;
        } else if (currPercent < prevPercent) {
            resultText += `
            <p>The trials tested you more than last time. Your score is lower, but the journey continues!</p>
            <p>Your last result: ${lastResult.correct} / ${lastResult.total}</p>
        `;
        } else {
            resultText += `
            <p>The balance of Hyrule remains. Your score matches your last quest!</p>
            <p>Your last result: ${lastResult.correct} / ${lastResult.total}</p>
        `;
        }
    }

    resultCard.innerHTML = resultText;
    resultCard.classList.remove('hide');
    wrongCardsContainer.appendChild(resultCard);

    /* WRONG ANSWER CARDS */
    gameState.wrongGuesses.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${item.character.image}" alt="${item.character.name}">
            <p class="correct-name">This is: ${item.character.name}</p>
            <p class="your-answer">Your guess: ${item.guessed}</p>
        `;
        wrongCardsContainer.appendChild(card);
    });

    wrongCardsWrapper.classList.remove('hide');

    /* SAVE RESULT */
    localStorage.setItem("lastResult", JSON.stringify({
        correct: gameState.correctAnswers,
        total: total
    }));
    lastResult = { correct: gameState.correctAnswers, total: total };

    window.scrollTo({ top: 0 });
}

/* STATUS CLASS */
function setStatusClass(element, correct) {
    clearStatusClass(element);
    element.classList.add(correct ? 'correct' : 'wrong');
}

/* CLEAR STATUS */
function clearStatusClass(element) {
    element.classList.remove('correct', 'wrong');
}

/* RESTART GAME */
restartButton.addEventListener('click', () => {
    resetGameState();
    startPage.classList.remove('hide');
    quizHeader.classList.remove('hide-bg');
    questionContainer.classList.add('hide');
    questionImage.classList.add('hide');
    restartButton.classList.add('hide');
    nextButton.classList.add('hide');
    resultCard.classList.add('hide');
    wrongCardsContainer.innerHTML = "";
    wrongCardsWrapper.classList.add('hide');
    document.getElementById('quiz-image').classList.remove('hidden');
});