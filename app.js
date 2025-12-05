let allQuestions = [];
let currentMode = 'home'; 
let currentIdx = 0;
let userAnswers = {}; 
let examTimer;
let timeLeft = 0;
let reviewFilter = 'all'; // 'all', 'wrong', 'skipped'

// Local Storage Keys
const STORAGE_KEY_SCORE = 'exambuzz_best_score';
const STORAGE_KEY_PRACTICE = 'exambuzz_last_practice_idx';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    fetch('questions.csv')
        .then(response => response.text())
        .then(data => {
            allQuestions = parseCSV(data);
            // Simulate slight delay for loading animation feeling
            setTimeout(() => renderHome(), 600);
        })
        .catch(err => {
            document.getElementById('app-container').innerHTML = 
                `<div class="flex flex-col items-center justify-center h-full text-red-500">
                    <i class="ph-fill ph-warning-circle text-4xl mb-2"></i>
                    <p>Failed to load database. Ensure 'questions.csv' exists.</p>
                </div>`;
        });
});

// --- Enhanced CSV Parser ---
function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Advanced regex to handle commas inside quotes
        const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        
        if (matches && matches.length >= 6) {
            const clean = matches.map(m => m.replace(/^"|"$/g, '').trim());
            
            result.push({
                id: clean[0],
                question: clean[1],
                options: { A: clean[2], B: clean[3], C: clean[4], D: clean[5] },
                correct: clean[6].replace(/Option\s+/i, '').trim().toUpperCase(),
                explanation: clean[7] || "No explanation provided."
            });
        }
    }
    return result;
}

// --- Navigation & Views ---

function switchMode(mode) {
    clearInterval(examTimer);
    currentMode = mode;
    const app = document.getElementById('app-container');
    const nav = document.getElementById('nav-actions');
    
    // Clear Nav
    nav.innerHTML = '';
    
    // Reset Scroll
    app.scrollTop = 0;

    if (mode === 'home') renderHome();
    if (mode === 'practice') startPractice();
    if (mode === 'exam') startExam();
}

function renderHome() {
    const bestScore = localStorage.getItem(STORAGE_KEY_SCORE) || '0';
    const lastPractice = parseInt(localStorage.getItem(STORAGE_KEY_PRACTICE) || '0');
    
    const html = `
        <div class="max-w-4xl mx-auto fade-enter pt-6">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl mb-10 relative overflow-hidden">
                <div class="absolute top-0 right-0 p-8 opacity-10">
                    <i class="ph-fill ph-books text-9xl"></i>
                </div>
                <div class="relative z-10">
                    <h1 class="text-3xl md:text-4xl font-bold mb-2">Senior Officer Recruitment</h1>
                    <p class="text-indigo-100 text-lg mb-6">Master your preparation with our comprehensive question bank.</p>
                    <div class="flex items-center gap-6 text-sm font-medium">
                        <div class="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <i class="ph-fill ph-trophy text-yellow-300"></i>
                            <span>Best Score: ${bestScore}%</span>
                        </div>
                        <div class="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <i class="ph-fill ph-stack"></i>
                            <span>${allQuestions.length} Questions</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
                <div onclick="switchMode('practice')" class="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden">
                    <div class="absolute top-0 right-0 bg-emerald-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                    <div class="relative z-10">
                        <div class="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <i class="ph-duotone ph-student"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-slate-800 mb-2">Practice Mode</h2>
                        <p class="text-slate-500 mb-6">Learn at your own pace with instant feedback and detailed explanations.</p>
                        <div class="flex items-center text-sm font-semibold text-emerald-600">
                            Continue from Q${lastPractice + 1} <i class="ph-bold ph-arrow-right ml-2"></i>
                        </div>
                    </div>
                </div>

                <div onclick="switchMode('exam')" class="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                    <div class="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <i class="ph-duotone ph-timer"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-800 mb-2">Exam Mode</h2>
                    <p class="text-slate-500 mb-6">Simulate real exam conditions. 60 Minutes. Negative marking enabled.</p>
                    <div class="flex items-center text-sm font-semibold text-indigo-600">
                        Start Assessment <i class="ph-bold ph-arrow-right ml-2"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('app-container').innerHTML = html;
}

// --- Practice Mode ---

function startPractice() {
    // Load last position
    currentIdx = parseInt(localStorage.getItem(STORAGE_KEY_PRACTICE) || '0');
    if(currentIdx >= allQuestions.length) currentIdx = 0;
    
    renderPracticeUI();
}

function renderPracticeUI() {
    const q = allQuestions[currentIdx];
    
    // Save progress
    localStorage.setItem(STORAGE_KEY_PRACTICE, currentIdx);

    const html = `
        <div class="max-w-3xl mx-auto fade-enter pb-20">
            <div class="flex justify-between items-end mb-4 px-1">
                <div>
                    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Question</span>
                    <h2 class="text-3xl font-bold text-slate-800">${currentIdx + 1} <span class="text-slate-300 text-xl">/ ${allQuestions.length}</span></h2>
                </div>
                <div class="flex gap-2">
                    <button onclick="navPractice(-1)" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed" ${currentIdx === 0 ? 'disabled' : ''}>
                        <i class="ph-bold ph-caret-left"></i>
                    </button>
                    <button onclick="navPractice(1)" class="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 disabled:opacity-50" ${currentIdx === allQuestions.length - 1 ? 'disabled' : ''}>
                        <i class="ph-bold ph-caret-right"></i>
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-8 border-b border-slate-100 bg-slate-50/50">
                    <p class="text-xl font-medium text-slate-800 leading-relaxed font-sans">${q.question}</p>
                </div>

                <div class="p-6 grid gap-3" id="practice-options">
                    ${Object.entries(q.options).map(([key, val]) => `
                        <button onclick="checkPracticeAnswer('${key}')" id="opt-${key}" 
                            class="group w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-start gap-4">
                            <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-500 font-bold flex items-center justify-center group-hover:bg-indigo-200 group-hover:text-indigo-700 transition-colors">${key}</span>
                            <span class="text-lg text-slate-600 group-hover:text-indigo-900 pt-0.5">${val}</span>
                        </button>
                    `).join('')}
                </div>

                <div id="feedback-area" class="hidden bg-slate-50 border-t border-slate-100 p-6 animate-enter">
                    <div id="feedback-status" class="flex items-center gap-3 font-bold text-lg mb-3"></div>
                    <div class="text-slate-600 bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-sm leading-relaxed">
                        <span class="text-slate-400 font-bold uppercase text-xs block mb-1">Explanation</span>
                        ${q.explanation}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('app-container').innerHTML = html;
}

function checkPracticeAnswer(selectedKey) {
    const q = allQuestions[currentIdx];
    const isCorrect = selectedKey === q.correct;
    
    // Disable inputs
    const btns = document.querySelectorAll('#practice-options button');
    btns.forEach(b => b.disabled = true);
    
    // UI Updates
    const selectedBtn = document.getElementById(`opt-${selectedKey}`);
    const correctBtn = document.getElementById(`opt-${q.correct}`);
    
    if (isCorrect) {
        selectedBtn.className = "w-full text-left p-4 rounded-xl border-2 border-green-500 bg-green-50 flex items-start gap-4";
        selectedBtn.querySelector('span').className = "flex-shrink-0 w-8 h-8 rounded-lg bg-green-500 text-white font-bold flex items-center justify-center";
        
        showFeedback(true);
    } else {
        selectedBtn.className = "w-full text-left p-4 rounded-xl border-2 border-red-500 bg-red-50 flex items-start gap-4 opacity-75";
        selectedBtn.querySelector('span').className = "flex-shrink-0 w-8 h-8 rounded-lg bg-red-200 text-red-700 font-bold flex items-center justify-center";
        
        // Highlight correct one
        correctBtn.className = "w-full text-left p-4 rounded-xl border-2 border-green-500 bg-green-50 flex items-start gap-4 shadow-lg scale-[1.02]";
        correctBtn.querySelector('span').className = "flex-shrink-0 w-8 h-8 rounded-lg bg-green-500 text-white font-bold flex items-center justify-center";
        
        showFeedback(false);
    }
}

function showFeedback(success) {
    const area = document.getElementById('feedback-area');
    const status = document.getElementById('feedback-status');
    
    area.classList.remove('hidden');
    
    if (success) {
        status.innerHTML = `<i class="ph-fill ph-check-circle text-green-500 text-2xl"></i> <span class="text-green-700">Correct Answer!</span>`;
    } else {
        status.innerHTML = `<i class="ph-fill ph-x-circle text-red-500 text-2xl"></i> <span class="text-red-700">Incorrect</span>`;
    }
    
    // Auto scroll to explanation
    area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function navPractice(dir) {
    const newIdx = currentIdx + dir;
    if (newIdx >= 0 && newIdx < allQuestions.length) {
        currentIdx = newIdx;
        renderPracticeUI();
    }
}

// --- Exam Mode ---

function startExam() {
    currentIdx = 0;
    userAnswers = {};
    timeLeft = 3600; // 60 mins
    
    // Set Header Info
    const nav = document.getElementById('nav-actions');
    nav.innerHTML = `
        <div class="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
            <div class="flex items-center gap-2 text-slate-600">
                <i class="ph-bold ph-clock"></i>
                <span id="exam-timer" class="font-mono font-bold text-lg">60:00</span>
            </div>
        </div>
        <button onclick="finishExam()" class="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
            Submit Exam
        </button>
    `;
    
    examTimer = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        
        const timerEl = document.getElementById('exam-timer');
        if(timerEl) timerEl.innerText = `${m}:${s}`;
        
        if (timeLeft <= 0) finishExam();
    }, 1000);

    renderExamLayout();
}

function renderExamLayout() {
    const html = `
        <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
            <div class="flex-grow overflow-y-auto pr-2" id="exam-question-area">
                </div>

            <div class="w-full lg:w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                <div class="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 class="font-bold text-slate-700 text-sm uppercase">Question Palette</h3>
                    <div class="flex gap-4 mt-2 text-xs">
                        <div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-indigo-600"></div> Answered</div>
                        <div class="flex items-center gap-1"><div class="w-3 h-3 rounded bg-slate-200"></div> Pending</div>
                    </div>
                </div>
                <div class="p-4 overflow-y-auto grid grid-cols-5 gap-2 content-start scroller" id="exam-palette">
                    </div>
            </div>
        </div>
    `;
    document.getElementById('app-container').innerHTML = html;
    updateExamQuestion();
    updatePalette();
}

function updateExamQuestion() {
    const q = allQuestions[currentIdx];
    const selected = userAnswers[currentIdx];
    
    const html = `
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 fade-enter">
            <div class="flex justify-between mb-6">
                <span class="text-slate-400 font-bold text-sm">Question ${currentIdx + 1}</span>
                <span class="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">ID: ${q.id}</span>
            </div>
            
            <h3 class="text-xl md:text-2xl font-medium text-slate-900 mb-8">${q.question}</h3>
            
            <div class="grid gap-3">
                ${Object.entries(q.options).map(([key, val]) => `
                    <button onclick="selectExamAnswer('${key}')" 
                        class="group w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${selected === key ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-slate-200 hover:bg-slate-50'}">
                        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected === key ? 'border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}">
                            ${selected === key ? '<div class="w-3 h-3 rounded-full bg-indigo-600"></div>' : ''}
                        </div>
                        <span class="text-lg ${selected === key ? 'text-indigo-900 font-medium' : 'text-slate-600'}">${val}</span>
                    </button>
                `).join('')}
            </div>

            <div class="flex justify-between mt-10 border-t border-slate-100 pt-6">
                <button onclick="navExam(-1)" class="flex items-center gap-2 text-slate-500 hover:text-slate-800 disabled:opacity-30" ${currentIdx === 0 ? 'disabled' : ''}>
                    <i class="ph-bold ph-arrow-left"></i> Previous
                </button>
                <button onclick="navExam(1)" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-medium shadow-md shadow-indigo-200 transition-all">
                    ${currentIdx === allQuestions.length - 1 ? 'Review' : 'Next Question'}
                </button>
            </div>
        </div>
    `;
    document.getElementById('exam-question-area').innerHTML = html;
}

function updatePalette() {
    const palette = document.getElementById('exam-palette');
    if(!palette) return;
    
    palette.innerHTML = allQuestions.map((_, idx) => `
        <button onclick="jumpToQuestion(${idx})" 
            class="h-10 w-full rounded-lg text-sm font-bold transition-all ${
                idx === currentIdx ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
            } ${
                userAnswers[idx] ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }">
            ${idx + 1}
        </button>
    `).join('');
}

function selectExamAnswer(key) {
    if (userAnswers[currentIdx] === key) delete userAnswers[currentIdx]; // Toggle off
    else userAnswers[currentIdx] = key;
    
    updateExamQuestion();
    updatePalette();
}

function jumpToQuestion(idx) {
    currentIdx = idx;
    updateExamQuestion();
    updatePalette();
}

function navExam(dir) {
    const newIdx = currentIdx + dir;
    if (newIdx >= 0 && newIdx < allQuestions.length) {
        currentIdx = newIdx;
        updateExamQuestion();
        updatePalette();
    }
}

function finishExam() {
    clearInterval(examTimer);
    
    // Calculate Score
    let correct = 0, wrong = 0, skipped = 0;
    
    allQuestions.forEach((q, idx) => {
        const ans = userAnswers[idx];
        if (!ans) skipped++;
        else if (ans === q.correct) correct++;
        else wrong++;
    });
    
    const score = correct - (wrong * 0.25);
    const percentage = Math.round((score / allQuestions.length) * 100);
    
    // Save Best Score
    const prevBest = parseInt(localStorage.getItem(STORAGE_KEY_SCORE) || '0');
    if (percentage > prevBest) localStorage.setItem(STORAGE_KEY_SCORE, percentage);

    // Render Result View
    currentMode = 'result';
    document.getElementById('nav-actions').innerHTML = ''; // Clear timer
    
    const html = `
        <div class="max-w-2xl mx-auto pt-8 fade-enter">
            <div class="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-slate-200">
                <div class="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30"></div>
                    <h2 class="text-xl font-medium text-slate-300 relative z-10">Your Score</h2>
                    <div class="text-6xl font-bold my-4 relative z-10">${score.toFixed(2)}</div>
                    <div class="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm relative z-10">
                        ${percentage}% Accuracy
                    </div>
                </div>
                
                <div class="grid grid-cols-3 divide-x divide-slate-100 text-center py-6">
                    <div>
                        <div class="text-3xl font-bold text-emerald-500">${correct}</div>
                        <div class="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">Correct</div>
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-red-500">${wrong}</div>
                        <div class="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">Wrong</div>
                    </div>
                    <div>
                        <div class="text-3xl font-bold text-slate-500">${skipped}</div>
                        <div class="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-1">Skipped</div>
                    </div>
                </div>
            </div>

            <div class="flex gap-4 justify-center">
                <button onclick="switchMode('home')" class="px-6 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition">
                    Dashboard
                </button>
                <button onclick="startReview()" class="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">
                    Review Answers
                </button>
            </div>
        </div>
    `;
    document.getElementById('app-container').innerHTML = html;
}

// --- Review Mode Logic ---

function startReview() {
    renderReviewList();
}

function renderReviewList() {
    // Generate the review list content
    const listHtml = allQuestions.map((q, idx) => {
        const userAns = userAnswers[idx];
        const isCorrect = userAns === q.correct;
        const isSkipped = !userAns;
        
        // Status Badge Logic
        let badge = '';
        if (isSkipped) badge = `<span class="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold">SKIPPED</span>`;
        else if (isCorrect) badge = `<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">CORRECT</span>`;
        else badge = `<span class="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">WRONG</span>`;

        return `
            <div class="bg-white rounded-xl border border-slate-200 p-6 mb-4 shadow-sm">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">${idx + 1}</span>
                        ${badge}
                    </div>
                </div>
                
                <h4 class="font-medium text-lg text-slate-800 mb-4">${q.question}</h4>
                
                <div class="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div class="p-3 rounded-lg border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : (userAns ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50')}">
                        <span class="block text-xs font-bold opacity-70 mb-1">Your Answer</span>
                        <span class="font-semibold">${userAns ? q.options[userAns] : 'Not Answered'}</span>
                    </div>
                    <div class="p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                        <span class="block text-xs font-bold text-emerald-700 mb-1">Correct Answer</span>
                        <span class="font-semibold text-emerald-900">${q.options[q.correct]}</span>
                    </div>
                </div>
                
                <div class="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                    <span class="font-bold text-slate-900 block mb-1">Explanation:</span>
                    ${q.explanation}
                </div>
            </div>
        `;
    }).join('');

    const html = `
        <div class="max-w-3xl mx-auto pt-6 fade-enter">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-slate-800">Answer Review</h2>
                <button onclick="switchMode('home')" class="text-indigo-600 font-bold hover:underline">Exit Review</button>
            </div>
            ${listHtml}
             <div class="text-center pb-12">
                <button onclick="switchMode('home')" class="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Back to Dashboard</button>
            </div>
        </div>
    `;
    
    document.getElementById('app-container').innerHTML = html;
}
