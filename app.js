let allQuestions = [];
let currentMode = 'home'; 
let currentIdx = 0;
let userAnswers = {}; 
let examTimer;
let timeLeft = 0;

const STORAGE_KEY_SCORE = 'exambuzz_best_score';
const STORAGE_KEY_PRACTICE = 'exambuzz_last_practice_idx';

document.addEventListener('DOMContentLoaded', () => {
    fetch('questions.csv')
        .then(res => res.text())
        .then(data => {
            allQuestions = parseCSV(data);
            setTimeout(() => switchMode('home'), 500);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('app-container').innerHTML = 
                `<div class="text-center text-red-500 mt-20">Database Error. Check console.</div>`;
        });
});

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (matches && matches.length >= 6) {
            const clean = matches.map(m => m.replace(/^"|"$/g, '').trim());
            result.push({
                id: clean[0], question: clean[1],
                options: { A: clean[2], B: clean[3], C: clean[4], D: clean[5] },
                correct: clean[6].replace(/Option\s+/i, '').trim().toUpperCase(),
                explanation: clean[7] || "No explanation provided."
            });
        }
    }
    return result;
}

// --- Navigation ---
function switchMode(mode) {
    clearInterval(examTimer);
    currentMode = mode;
    const app = document.getElementById('app-container');
    const headerActions = document.getElementById('header-actions');
    const footer = document.getElementById('main-footer');
    const mobileNav = document.getElementById('mobile-exam-nav');

    // Reset Views
    headerActions.innerHTML = '';
    app.innerHTML = '';
    app.scrollTop = 0;
    
    // Visibility Logic
    if (mode === 'exam') {
        footer.classList.add('hidden');
        mobileNav.classList.remove('hidden'); // Show bottom bar on mobile
    } else {
        footer.classList.remove('hidden');
        mobileNav.classList.add('hidden');
    }

    if (mode === 'home') renderHome();
    if (mode === 'practice') startPractice();
    if (mode === 'exam') startExam();
}

// --- Home ---
function renderHome() {
    const bestScore = localStorage.getItem(STORAGE_KEY_SCORE) || '0';
    document.getElementById('app-container').innerHTML = `
        <div class="fade-in max-w-4xl mx-auto pt-6">
            <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-2xl mb-8 relative overflow-hidden">
                <i class="ph-fill ph-medal absolute -bottom-4 -right-4 text-[10rem] opacity-10 rotate-12"></i>
                <h2 class="text-3xl font-bold mb-2 relative z-10">Welcome Back!</h2>
                <p class="text-indigo-100 mb-6 relative z-10">Ready to crush your Senior Officer exam?</p>
                <div class="flex gap-4 relative z-10">
                    <div class="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                        <div class="text-xs text-indigo-200 uppercase font-bold">Best Score</div>
                        <div class="text-xl font-bold">${bestScore}%</div>
                    </div>
                    <div class="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                        <div class="text-xs text-indigo-200 uppercase font-bold">Total Qs</div>
                        <div class="text-xl font-bold">${allQuestions.length}</div>
                    </div>
                </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6 pb-8">
                <button onclick="switchMode('practice')" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary/50 hover:shadow-lg transition text-left group">
                    <div class="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition">
                        <i class="ph-bold ph-book-open text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900">Practice Mode</h3>
                    <p class="text-slate-500 mt-1">Learn with instant explanations. No time limit.</p>
                </button>

                <button onclick="switchMode('exam')" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary/50 hover:shadow-lg transition text-left group">
                    <div class="bg-rose-100 w-12 h-12 rounded-full flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition">
                        <i class="ph-bold ph-timer text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900">Exam Mode</h3>
                    <p class="text-slate-500 mt-1">60 Mins. Negative marking. Real simulation.</p>
                </button>
            </div>
        </div>
    `;
}

// --- Exam Mode ---
function startExam() {
    currentIdx = 0;
    userAnswers = {};
    timeLeft = 3600;
    
    // Header Timer
    document.getElementById('header-actions').innerHTML = `
        <div class="flex items-center gap-3">
            <div class="bg-slate-100 px-3 py-1.5 rounded-lg font-mono font-bold text-primary flex items-center gap-2">
                <i class="ph-bold ph-clock"></i> <span id="timer">60:00</span>
            </div>
            <button onclick="finishExam()" class="hidden sm:block bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-600 transition">Submit</button>
            <button onclick="finishExam()" class="sm:hidden bg-red-500 text-white p-2 rounded-lg"><i class="ph-bold ph-paper-plane-right"></i></button>
        </div>
    `;

    examTimer = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        if(document.getElementById('timer')) document.getElementById('timer').innerText = `${m}:${s}`;
        if (timeLeft <= 0) finishExam();
    }, 1000);

    renderExamLayout();
}

function renderExamLayout() {
    const html = `
        <div class="flex h-full gap-6">
            <div class="flex-grow overflow-y-auto pb-24 lg:pb-0 no-scrollbar" id="exam-card-area">
                </div>

            <div class="hidden lg:block w-72 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-140px)] sticky top-0">
                <div class="p-4 border-b border-slate-100 font-bold text-slate-700 bg-slate-50 rounded-t-2xl">Question Palette</div>
                <div class="flex-grow overflow-y-auto p-4 grid grid-cols-5 gap-2 content-start" id="desktop-palette"></div>
            </div>
        </div>
    `;
    document.getElementById('app-container').innerHTML = html;
    updateExamUI();
}

function updateExamUI() {
    const q = allQuestions[currentIdx];
    const sel = userAnswers[currentIdx];
    
    // Render Question Card
    document.getElementById('exam-card-area').innerHTML = `
        <div class="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200 fade-in">
            <div class="flex justify-between items-center mb-6">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Question ${currentIdx + 1} of ${allQuestions.length}</span>
                <span class="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono">ID: ${q.id}</span>
            </div>
            <h3 class="text-xl md:text-2xl font-medium text-slate-900 mb-8 leading-relaxed">${q.question}</h3>
            <div class="space-y-3">
                ${Object.entries(q.options).map(([k, v]) => `
                    <button onclick="selectExamAns('${k}')" class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${sel === k ? 'border-primary bg-indigo-50/50' : 'border-slate-100 hover:border-slate-300'}">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ${sel === k ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}">${k}</div>
                        <span class="${sel === k ? 'text-primary font-semibold' : 'text-slate-600'}">${v}</span>
                    </button>
                `).join('')}
            </div>
            <div class="hidden lg:flex justify-between mt-10 pt-6 border-t border-slate-100">
                <button onclick="navExam(-1)" class="text-slate-500 font-bold hover:text-slate-800" ${currentIdx===0?'disabled':''}>Previous</button>
                <button onclick="navExam(1)" class="bg-primary text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-primary/30 hover:bg-indigo-600 transition">Next Question</button>
            </div>
        </div>
    `;

    // Update Palettes (Desktop & Mobile)
    const generatePalette = () => allQuestions.map((_, i) => `
        <button onclick="jumpTo(${i})" class="h-9 rounded-lg text-sm font-bold transition ${i === currentIdx ? 'ring-2 ring-primary ring-offset-1' : ''} ${userAnswers[i] ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}">${i+1}</button>
    `).join('');

    const deskPal = document.getElementById('desktop-palette');
    if(deskPal) deskPal.innerHTML = generatePalette();

    const mobPal = document.getElementById('mobile-palette-grid');
    if(mobPal) mobPal.innerHTML = generatePalette();
}

function selectExamAns(k) {
    if(userAnswers[currentIdx] === k) delete userAnswers[currentIdx];
    else userAnswers[currentIdx] = k;
    updateExamUI();
}

function navExam(dir) {
    const n = currentIdx + dir;
    if(n >= 0 && n < allQuestions.length) {
        currentIdx = n;
        updateExamUI();
    }
}

function jumpTo(i) {
    currentIdx = i;
    updateExamUI();
    toggleMobilePalette(false); // Close modal if open
}

function toggleMobilePalette(forceState) {
    const el = document.getElementById('mobile-palette-modal');
    if (forceState !== undefined) {
        if (!forceState) el.classList.add('hidden');
        else el.classList.remove('hidden');
    } else {
        el.classList.toggle('hidden');
    }
}

function finishExam() {
    clearInterval(examTimer);
    let score = 0, correct = 0, wrong = 0;
    allQuestions.forEach((q, i) => {
        if(!userAnswers[i]) return;
        if(userAnswers[i] === q.correct) { correct++; score++; }
        else { wrong++; score -= 0.25; }
    });
    
    // Save Score
    const percent = Math.max(0, Math.round((score / allQuestions.length) * 100));
    const oldBest = parseInt(localStorage.getItem(STORAGE_KEY_SCORE)||'0');
    if(percent > oldBest) localStorage.setItem(STORAGE_KEY_SCORE, percent);

    // Show Result
    switchMode('result'); // Hides mobile nav, shows footer
    document.getElementById('app-container').innerHTML = `
        <div class="max-w-xl mx-auto pt-10 text-center fade-in">
            <div class="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
                <div class="w-24 h-24 bg-${percent >= 50 ? 'emerald' : 'orange'}-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    ${percent >= 50 ? '🏆' : '💪'}
                </div>
                <h2 class="text-2xl font-bold text-slate-800">Exam Complete!</h2>
                <div class="text-5xl font-extrabold text-primary my-4">${score.toFixed(2)}</div>
                <p class="text-slate-500 mb-8">Accuracy: ${percent}%</p>
                
                <div class="grid grid-cols-2 gap-4 text-sm mb-8">
                    <div class="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div class="font-bold text-green-700 text-xl">${correct}</div>
                        <div class="text-green-600">Correct</div>
                    </div>
                    <div class="bg-red-50 p-4 rounded-xl border border-red-100">
                        <div class="font-bold text-red-700 text-xl">${wrong}</div>
                        <div class="text-red-600">Wrong</div>
                    </div>
                </div>
                
                <button onclick="switchMode('home')" class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">Back to Home</button>
            </div>
        </div>
    `;
}

// --- Practice Mode (Simplified for brevity) ---
function startPractice() {
    currentIdx = parseInt(localStorage.getItem(STORAGE_KEY_PRACTICE)||'0');
    renderPractice();
}
function renderPractice() {
    const q = allQuestions[currentIdx];
    localStorage.setItem(STORAGE_KEY_PRACTICE, currentIdx);
    
    document.getElementById('app-container').innerHTML = `
        <div class="max-w-2xl mx-auto pt-6 fade-in pb-20">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-6 border-b border-slate-100 bg-slate-50 flex justify-between">
                    <span class="font-bold text-slate-500">Practice #${currentIdx+1}</span>
                    <button onclick="switchMode('home')" class="text-primary text-sm font-bold">Quit</button>
                </div>
                <div class="p-8">
                    <h3 class="text-xl font-medium mb-6">${q.question}</h3>
                    <div class="space-y-3" id="prac-opts">
                        ${Object.entries(q.options).map(([k,v]) => `
                            <button onclick="checkPrac('${k}')" id="btn-${k}" class="w-full text-left p-4 rounded-xl border border-slate-200 hover:bg-slate-50 flex gap-4">
                                <span class="font-bold text-slate-400 bg-slate-100 w-6 h-6 rounded flex items-center justify-center">${k}</span>
                                <span>${v}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div id="expl" class="hidden mt-6 bg-blue-50 p-4 rounded-xl text-sm text-slate-700 border border-blue-100">
                        <strong class="text-blue-600 block mb-1">Explanation:</strong> ${q.explanation}
                    </div>
                </div>
                <div class="p-4 bg-slate-50 flex justify-between">
                    <button onclick="movePrac(-1)" class="px-4 py-2 font-bold text-slate-500" ${currentIdx===0?'disabled':''}>Prev</button>
                    <button onclick="movePrac(1)" class="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Next</button>
                </div>
            </div>
        </div>
    `;
}
function checkPrac(k) {
    const q = allQuestions[currentIdx];
    const btn = document.getElementById(`btn-${k}`);
    const corBtn = document.getElementById(`btn-${q.correct}`);
    
    if(k === q.correct) {
        btn.classList.add('bg-green-100', 'border-green-500');
    } else {
        btn.classList.add('bg-red-50', 'border-red-500');
        corBtn.classList.add('bg-green-100', 'border-green-500');
    }
    document.getElementById('expl').classList.remove('hidden');
}
function movePrac(d) {
    const n = currentIdx + d;
    if(n>=0 && n<allQuestions.length) { currentIdx=n; renderPractice(); }
}
