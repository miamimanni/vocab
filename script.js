let words = [];
let selectedWords = [];
let currentWordIndex = 0;
let currentWord = "";
let userAttempt = "";
let results = [];
let hardMode = false;

function showDashboard() {
    const wordsInput = document.getElementById('words').value.trim();
    if (wordsInput === "") return;
    words = wordsInput.split('\n').map(word => word.trim());
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';

    // Load selections from localStorage
    selectedWords = JSON.parse(localStorage.getItem('selectedWords')) || [];
    hardMode = JSON.parse(localStorage.getItem('hardMode')) || false;

    // Check if there are no saved selections and default to checking all words
    if (selectedWords.length === 0) {
        selectedWords = [...words];
        localStorage.setItem('selectedWords', JSON.stringify(selectedWords));
    }

    words.forEach((word, index) => {
        const label = document.createElement('label');
        const checked = selectedWords.includes(word);
        label.innerHTML = `<input type="checkbox" id="word-${index}" ${checked ? 'checked' : ''}> ${word}`;
        wordList.appendChild(label);
        wordList.appendChild(document.createElement('br'));
    });
    
    document.getElementById('hard-mode').checked = hardMode;

    document.getElementById('word-input').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
}

function startPractice() {
    selectedWords = words.filter((word, index) => document.getElementById(`word-${index}`).checked);
    hardMode = document.getElementById('hard-mode').checked;

    // Save selections to localStorage
    localStorage.setItem('selectedWords', JSON.stringify(selectedWords));
    localStorage.setItem('hardMode', JSON.stringify(hardMode));

    if (selectedWords.length === 0) return;
    currentWordIndex = 0;
    results = [];
    showSpellCheck();
}

function showSpellCheck() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('spell-check').style.display = 'block';
    enableButtons()
    loadNextWord();
}

function loadNextWord() {
    if (currentWordIndex >= selectedWords.length) {
        showSummary();
        return;
    }
    currentWord = selectedWords[currentWordIndex];
    userAttempt = "";
    document.getElementById('prompt').innerText = `Word ${currentWordIndex + 1}:`;
    document.getElementById('prompt2-hint').innerText = `${currentWord.replace(/./g, '_ ')}`;
    document.getElementById('user-input').value = '';
    document.getElementById('no-matter-what-feedback').innerHTML = '';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('stats').innerHTML = ''; // Clear stats
    document.getElementById('prompt2-hint').style.display = hardMode ? 'none' : 'block';
    document.getElementById('feedback').style.display = hardMode ? 'none' : 'block';
    document.getElementById('stats').style.display = hardMode ? 'none' : 'block';
    setTimeout(speakWord, 500);
}

function speakWord() {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = 0.5;
    speechSynthesis.speak(utterance);
}

function speakWordSlow() {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.rate = 0.01;
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

    // Display stats
    const totalLetters = correctWord.length;
    const lettersRemaining = totalLetters - userInput.length;
    const stats = document.getElementById('stats');
    stats.innerHTML = `
        <p>Total letters: ${totalLetters}</p>
        <p>Letters typed: ${userInput.length}</p>
        <p>Letters remaining: ${lettersRemaining}</p>
    `;

    // Enable submit button only if at least one letter is typed
    const submitButton = document.getElementById('submit-button');
    submitButton.disabled = userInput.length === 0;
}

function submitWord() {
    disableButtons();

    const userInput = document.getElementById('user-input').value.toLowerCase();
    const correctWord = currentWord.toLowerCase();
    userAttempt = userInput;

    let feedbackText = "";
    if (userInput === correctWord) {
        feedbackText = "Correct!";
    } else {
        feedbackText = `Incorrect! Correct spelling: ${currentWord}`;
    }

    const feedback = document.getElementById('no-matter-what-feedback');
    feedback.innerHTML = feedbackText;

    results.push({
        word: currentWord,
        userAttempt: userAttempt,
        correct: userInput === correctWord
    });

    currentWordIndex++;
    setTimeout(() => {
        loadNextWord();
        setTimeout(enableButtons, 3000); // Enable buttons after new word is loaded with 3-second delay
    }, 1000); // 1-second delay before loading the next word
}

function disableButtons() {
    const buttons = document.querySelectorAll('#spell-check button');
    buttons.forEach(button => button.disabled = true);
}

function enableButtons() {
    const buttons = document.querySelectorAll('#spell-check button');
    buttons.forEach(button => button.disabled = false);
    document.getElementById('submit-button').disabled = true; // Initially disable submit button
}

function showSummary() {
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'block';

    const result = document.getElementById('result');
    result.innerHTML = '<h2>Results:</h2>';

    results.forEach(({ word, userAttempt, correct }, index) => {
        const resultItem = document.createElement('div');
        resultItem.style.textAlign = 'left'; // Left justify the result item
        resultItem.innerHTML = correct
            ? `<p>${index + 1}. <span style="color: green;">&#10003;</span> <strong>${word}</strong>: Correct</p>`
            : `<p>${index + 1}. <span style="color: red;">&#10005;</span> <strong>${word}</strong>: Incorrect, you spelled it as <em>${userAttempt}</em></p>`;
        result.appendChild(resultItem);
    });
}

function startOver() {
    document.getElementById('word-input').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
    document.getElementById('words').value = '';

    // Clear selections from localStorage
    localStorage.removeItem('selectedWords');
    localStorage.removeItem('hardMode');
}
