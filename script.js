let words = [];
let selectedWords = [];
let currentWordIndex = 0;
let currentWord = "";
let userAttempt = "";
let results = [];
let hardMode = false;
let voices = [];
let selectedVoice = null;

function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    voices = voices.filter(voice => voice.lang.toLowerCase().includes('en'));
    const voiceSelect = document.getElementById('voice-selection');
    voiceSelect.innerHTML = '';

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        voiceSelect.appendChild(option);
    });

    // Set the default selected voice to the first one available
    voiceSelect.selectedIndex = 0;
    selectedVoice = voices[0];
}

function showDashboard() {
    setHeader()
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
    setHeader()
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
    setHeader()
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
    utterance.voice = selectedVoice;
    utterance.rate = 0.5;
    speechSynthesis.speak(utterance);
}

function speakWordSlow() {
    const utterance = new SpeechSynthesisUtterance(currentWord);
    utterance.voice = selectedVoice;
    utterance.rate = 0.1;
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
    setHeader()
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
        setTimeout(enableButtons, 2000); // Enable buttons after new word is loaded with 2-second delay
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

function getGrade(score) {
    switch (true) {
        case score >= 90:
        return "A";
        case score >= 80:
        return "B";
        case score >= 70:
        return "C";
        case score >= 60:
        return "D";
        default:
        return "F";
    }
}
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    let progressBar = document.getElementById('progress-bar');
    let progress = 0;

    let interval = setInterval(() => {
        progress += 1;
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', progress);

        if (progress >= 100) {
            clearInterval(interval);
        }
    }, 1); // Adjust the interval for desired speed
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showSummary() {
    setHeader()
    let correctCounter = 0;
    let incorrectCounter = 0;
    
    document.getElementById('spell-check').style.display = 'none';

    const result = document.getElementById('result');
    result.innerHTML = '';

    results.forEach(({ word, userAttempt, correct }, index) => {
        const resultItem = document.createElement('div');
        resultItem.style.textAlign = 'left'; // Left justify the result item
        resultItem.innerHTML = correct
            ? `<p>${index + 1}. <span style="color: green;">&#10003;</span> <strong>${word}</strong>: Correct</p>`
            : `<p>${index + 1}. <span style="color: red;">&#10005;</span> <strong>${word}</strong>: Incorrect, you spelled it as <em>${userAttempt}</em></p>`;
        result.appendChild(resultItem);
        correct ? correctCounter++ : incorrectCounter++;
    });

    let score = (correctCounter / results.length).toFixed(2) * 100;
    let hardModeStr = hardMode ? "Hard Mode" : "Easy Mode"

    const payload = {
        Score: score,
        Grade: getGrade(score),
        Correct: correctCounter,
        Incorrect: incorrectCounter,
        Total: results.length,
        Mode: hardModeStr,
        Results: results
    };

    json_payload = JSON.stringify(payload);
    const encodedData = btoa(json_payload);

    let resultURL = 'https://script.google.com/macros/s/AKfycbz4rM8JFm_vhD-VApPFMcGf-oq_QH84-liuqWodkl2rzoKhTOHJaOl-j2wHT9oUmhvjMw/exec';

    showLoading()

    setTimeout(() => { 
        const xhr1 = new XMLHttpRequest();
        xhr1.open('GET', resultURL, false);
        xhr1.send();
    
        const xhr2 = new XMLHttpRequest();
        xhr2.open("POST", resultURL, false);
        xhr2.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr2.send(`data=${encodedData}`);
        hideLoading(); 
    }, 1000);

    document.getElementById('summary').style.display = 'block';

    // document.getElementById("grade").innerHTML = `Score: ${score}%, Grade: ${getGrade(score)},Correct: ${correctCounter}, Incorrect: ${incorrectCounter}, Total: ${results.length}, Mode: ${hardModeStr}`;
    // document.getElementById("grade2").innerHTML = `Score: ${score}%, Grade: ${getGrade(score)},Correct: ${correctCounter}, Incorrect: ${incorrectCounter}, Total: ${results.length}, Mode: ${hardModeStr}`;
    document.getElementById("grade").innerHTML = `Score: ${score}%, Grade: ${getGrade(score)},<p>Correct: ${correctCounter}, Incorrect: ${incorrectCounter}, Total: ${results.length}`;
}

function startOver() {
    setHeader()
    document.getElementById('word-input').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('spell-check').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
    document.getElementById('words').value = '';

    // Clear selections from localStorage
    localStorage.removeItem('selectedWords');
    localStorage.removeItem('hardMode');
}

function setDateTime() {
    // Get current date and time
    let now = new Date();
    let datetime = now.toLocaleString();

    // Insert date and time into HTML
    document.getElementById("datetime").innerHTML = datetime;
}

function setHardModeStatus(){
    document.getElementById("easy-or-hard-mode").innerHTML = hardMode ? "Hard Mode" : "Easy Mode";
}

function setHeader() {
    setDateTime();
    setHardModeStatus();
}

// Update selectedVoice when the dropdown value changes
document.getElementById('voice-selection').addEventListener('change', function() {
    selectedVoice = voices[this.value];
});

// Load the voices when the page is ready
speechSynthesis.onvoiceschanged = populateVoiceList;

populateVoiceList(); // Call it immediately in case voices are already loaded

setHeader();
