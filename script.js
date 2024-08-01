let words = [];
let selectedWords = [];
let currentWordIndex = 0;
let currentWord = "";
let userAttempt = "";
let results = [];

function showDashboard() {
    const wordsInput = document.getElementById('words').value.trim();
    if (wordsInput === "") return;
    words = wordsInput.split('\n').map(word => word.trim());
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    words.forEach((word, index) => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" id="word-${index}" checked> ${word}`;
        wordList.appendChild(label);
        wordList.appendChild(document.createElement('br'));
    });
    document.getElementById('word-input').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
}

function startPractice() {
    selectedWords = words.filter((word, index) => document.getElementById(`word-${index}`).checked);
    if (selectedWords.length === 0) return;
    currentWordIndex = 0;
    results = [];
    showSpellCheck();
}

function showSpellCheck() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('spell-check').style.display = 'block';
    loadNextWord();
}

function loadNextWord() {
    if (currentWordIndex >= selectedWords.length) {
        showSummary();
        return;
    }
    currentWord = selectedWords[currentWordIndex];
    userAttempt = "";
    document.getElementById('prompt').innerText = `Spell the word: ${currentWord.replace(/./g, '_ ')}`;
    document.getElementById('user-input').value = '';
    document.getElementById('feedback').innerHTML = '';
    setTimeout(speakWord, 500);
}

function speakWord() {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = 0.5;
    speechSynthesis.speak(utterance);
}

function speakWordSlow() {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = 0.25;
    speechSynthesis.speak(utterance);
}

function checkSpelling() {
    const userInput = document.getElementById('user-input').value.toLowerCase();
    const correctWord = currentWord.toLowerCase();
    userAttempt = userInput;
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = '';

    for (let i = 0; i < userInput.length; i++) {
        const span = document.createElement('span');
        span.innerText = userInput[i];
        if (userInput[i] === correctWord[i]) {
            span.className = 'correct';
        } else {
            span.className = 'incorrect';
        }
        feedback.appendChild(span);
    }
}

function submitWord() {
    const userInput = document.getElementById('user-input').value.toLowerCase();
    const correctWord = currentWord.toLowerCase();
    userAttempt = userInput;

    let feedbackText = "";
    if (userInput === correctWord) {
        feedbackText = "Correct!";
    } else {
        feedbackText = `Incorrect! Correct spelling: ${currentWord}`;
    }

    const feedback = document.getElementById('feedback');
    feedback.innerHTML = feedbackText;

    results.push({
        word: currentWord,
        userAttempt: userAttempt,
        correct: userInput === correctWord
    });

    currentWordIndex++;
    setTimeout(loadNextWord, 2000);
}

function showSummary() {
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'block';

    const result = document.getElementById('result');
    result.innerHTML = '<h2>Results:</h2>';

    results.forEach(({ word, userAttempt, correct }) => {
        const resultItem = document.createElement('div');
        resultItem.innerHTML = correct
            ? `<p><strong>${word}</strong>: Correct</p>`
            : `<p><strong>${word}</strong>: Incorrect, you spelled it as <em>${userAttempt}</em></p>`;
        result.appendChild(resultItem);
    });
}

function startOver() {
    document.getElementById('word-input').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
    document.getElementById('words').value = '';
}
