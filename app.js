let allQuestions = [];
let currentMode = 'home'; 
let currentIdx = 0;
let userAnswers = {}; 
let examTimer;
let timeLeft = 0;

// Keys for Local Storage
const STORAGE_SCORE = 'exambuzz_best';
const STORAGE_PRACTICE_IDX = 'exambuzz_prac_idx';

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Added 'v=3' to force browser to fetch the new CSV file and ignore cache
    fetch('questions.csv?v=3')
        .then(res => res.text())
        .then(data => {
            allQuestions = parseCSV(data);
            // Small delay for smooth entry animation
            setTimeout(() => switchMode('home'), 600); 
        })
        .catch(err => {
            console.error(err);
            document.getElementById('app-container').innerHTML = 
                `<div class="flex flex-col items-center justify-center h-[60vh] text-center p-10">
                    <div class="text-rose-500 font-bold text-2xl mb-2">Database Error</div>
                    <p class="text-slate-500 text-sm">Could not load 'questions.csv'.<br>Please check the file name and location.</p>
                </div>`;
        });
});

// --- Robust CSV Parser (The Fix for Incomplete Text) ---
function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    const result = [];
    
    // Start from 1 to skip the Header row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const row = [];
        let currentField = '';
        let insideQuotes = false;

        // Loop through every character to handle quotes and commas correctly
        for (let j = 0; j < line.length; j++) {
            const char = line[j];

            if (char === '"') {
                insideQuotes = !insideQuotes; // Toggle quote state
            } else if (char === ',' && !insideQuotes) {
                // If we hit a comma and we are NOT inside quotes, it's a new field
                row.push(currentField.trim());
                currentField = '';
            } else {
                currentField += char;
            }
        }
        // Push the last field after loop ends
        row.push(currentField.trim());

        // Ensure we have enough columns to map
        if (row.length >= 7) {
            // Clean up surrounding quotes (e.g., "Option A" -> Option A)
            const clean = row.map(text => text.replace(/^"|"$/g, '').trim());

            result.push({
                id: clean[0], 
                question: clean[1],
                options: { 
                    A: clean[2], 
                    B: clean[3], 
                    C: clean[4], 
                    D: clean[5] 
                },
                // Regex to remove "Option " prefix if present
                correct: clean[6].replace(/Option\s+/i, '').trim().toUpperCase(),
                explanation: clean[7] || "No explanation provided."
            });
        }
    }
    return result;
}

// --- Navigation Controller ---
function switchMode(mode) {
    clearInterval(examTimer);
    currentMode = mode;
    
    const app = document.getElementById('app-container');
    const headerActs = document.getElementById('header-actions');
    const examFooter = document.getElementById('exam-footer');

    // Reset UI State
    app.innerHTML = '';
    headerActs.innerHTML = '';
    examFooter.classList.add('hidden');
    app.scrollTop = 0;

    if (mode === 'home') renderHome();
    if (mode === 'practice') startPractice();
    if (mode === 'exam') startExam();
}

// --- Home Screen ---
function renderHome() {
    const bestScore = localStorage.getItem(STORAGE_SCORE) || '0';
    
    document.getElementById('app-container').innerHTML = `
        <div class="animate-slide-up max-w-2xl mx-auto pt-4 pb-10">
            <!-- Hero Card -->
            <div class="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-glow mb-8 relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10">
                    <i class="ph-fill ph-trophy text-[150px] rotate-12"></i>
                </div>
                <div class="relative z-10">
                    <span class="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 inline-block">Free Edition</span>
                    <h2 class="text-3xl font-bold mb-2">Welcome!</h2>
                    <p class="text-indigo-100 text-sm mb-6 max-w-xs leading-relaxed">Prepare for the Senior Officer Recruitment Test with our advanced exam simulator.</p>
                    
                    <div class="flex gap-3">
                        <div class="bg-indigo-900/30 backdrop-blur border border-white/10 px-4 py-2 rounded-xl">
                            <div class="text-[10px] text-indigo-200 uppercase font-bold">Best Score</div>
                            <div class="text-xl font-bold">${parseFloat(bestScore).toFixed(2)}%</div>
                        </div>
                        <div class="bg-indigo-900/30 backdrop-blur border border-white/10 px-4 py-2 rounded-xl">
                            <div class="text-[10px] text-indigo-200 uppercase font-bold">Questions</div>
                            <div class="text-xl font-bold">${allQuestions.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Grid -->
            <div class="grid gap-4">
                <div onclick="switchMode('practice')" class="group bg-white p-5 rounded-2xl border border-slate-100 shadow-soft cursor-pointer hover:border-indigo-100 transition-all active:scale-[0.98]">
                    <div class="flex items-center gap-5">
                        <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                            <i class="ph-duotone ph-book-open-text"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-800">Practice Mode</h3>
                            <p class="text-slate-500 text-xs mt-1">Instant answers. No time limit.</p>
                        </div>
                        <div class="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors">
                            <i class="ph-bold ph-caret-right text-xl"></i>
                        </div>
                    </div>
                </div>

                <div onclick="switchMode('exam')" class="group bg-white p-5 rounded-2xl border border-slate-100 shadow-soft cursor-pointer hover:border-indigo-100 transition-all active:scale-[0.98]">
                    <div class="flex items-center gap-5">
                        <div class="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-3xl group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                            <i class="ph-duotone ph-timer"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-800">Exam Mode</h3>
                            <p class="text-slate-500 text-xs mt-1">60 Mins • <span class="text-rose-500 font-bold bg-rose-50 px-1 rounded">-0.25 Marking</span></p>
                        </div>
                        <div class="ml-auto text-slate-300 group-hover:text-rose-500 transition-colors">
                            <i class="ph-bold ph-caret-right text-xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Exam Mode ---
function startExam() {
    currentIdx = 0;
    userAnswers = {};
    timeLeft = 3600; // 60 mins
    
    document.getElementById('exam-footer').classList.remove('hidden');

    // Header Timer
    document.getElementById('header-actions').innerHTML = `
        <div class="flex items-center gap-3">
            <div class="bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-200">
                <i class="ph-bold ph-clock text-slate-500"></i>
                <span id="timer" class="font-mono font-bold text-slate-700">60:00</span>
            </div>
            <button onclick="confirmSubmit()" class="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200">Submit</button>
        </div>
    `;

    // Timer Logic
    examTimer = setInterval(() => {
        timeLeft--;
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        if(document.getElementById('timer')) document.getElementById('timer').innerText = `${m}:${s}`;
        if (timeLeft <= 0) finishExam();
    }, 1000);

    renderExamQuestion();
}

function renderExamQuestion() {
    const q = allQuestions[currentIdx];
    const sel = userAnswers[currentIdx];
    
    document.getElementById('app-container').innerHTML = `
        <div class="animate-slide-up pb-24">
            <div class="flex justify-between items-center mb-6 px-1">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Question ${currentIdx + 1} of ${allQuestions.length}</span>
                <span class="text-[10px] font-mono bg-slate-100 text-slate-400 px-2 py-1 rounded">ID: ${q.id}</span>
            </div>

            <div class="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-slate-50 mb-6">
                <h3 class="text-xl md:text-2xl font-medium text-slate-800 leading-relaxed mb-8">${q.question}</h3>
                
                <div class="flex flex-col gap-3">
                    ${Object.entries(q.options).map(([k, v]) => `
                        <button onclick="selectAnswer('${k}')" 
                            class="group relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${sel === k ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}">
                            
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${sel === k ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}">
                                ${k}
                            </div>
                            <span class="font-medium ${sel === k ? 'text-indigo-900' : 'text-slate-600'}">${v}</span>
                            
                            ${sel === k ? '<div class="absolute right-4 text-indigo-500"><i class="ph-fill ph-check-circle text-xl"></i></div>' : ''}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    updatePalette();
}

function selectAnswer(k) {
    if (userAnswers[currentIdx] === k) delete userAnswers[currentIdx];
    else userAnswers[currentIdx] = k;
    renderExamQuestion();
}

function navExam(dir) {
    const next = currentIdx + dir;
    if(next >= 0 && next < allQuestions.length) {
        currentIdx = next;
        renderExamQuestion();
    }
}

function togglePalette() {
    const modal = document.getElementById('palette-modal');
    modal.classList.toggle('hidden');
}

function updatePalette() {
    const grid = document.getElementById('palette-grid');
    if(!grid) return;
    
    grid.innerHTML = allQuestions.map((_, i) => `
        <button onclick="jumpTo(${i})" class="h-10 rounded-lg text-sm font-bold transition-all ${
            i === currentIdx ? 'ring-2 ring-indigo-500 ring-offset-1 z-10' : ''
        } ${
            userAnswers[i] ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200' : 'bg-slate-50 text-slate-400'
        }">${i+1}</button>
    `).join('');
}

function jumpTo(i) {
    currentIdx = i;
    renderExamQuestion();
    togglePalette();
}

function confirmSubmit() {
    if(confirm("Are you sure you want to finish the exam?")) finishExam();
}

// --- Result Logic (Strict Marking) ---
function finishExam() {
    clearInterval(examTimer);
    document.getElementById('exam-footer').classList.add('hidden');
    document.getElementById('header-actions').innerHTML = '';

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    allQuestions.forEach((q, i) => {
        const ans = userAnswers[i];
        if (!ans) {
            skipped++;
        } else if (ans === q.correct) {
            correct++;
        } else {
            wrong++;
        }
    });

    // --- SCORING CALCULATION ---
    const penalty = wrong * 0.25;
    const finalScore = Math.max(0, correct - penalty); 
    const percentage = (finalScore / allQuestions.length) * 100;

    // Save Score
    const prevBest = parseFloat(localStorage.getItem(STORAGE_SCORE) || '0');
    if (percentage > prevBest) localStorage.setItem(STORAGE_SCORE, percentage);

    document.getElementById('app-container').innerHTML = `
        <div class="animate-slide-up max-w-xl mx-auto pt-6">
            <div class="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-6">
                <!-- Result Header -->
                <div class="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent"></div>
                    <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Final Score</p>
                    <h1 class="text-6xl font-extrabold mb-2 relative z-10">${finalScore.toFixed(2)}</h1>
                    <div class="inline-block bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-medium relative z-10">
                        ${percentage.toFixed(1)}% Accuracy
                    </div>
                </div>

                <!-- Detailed Breakdown -->
                <div class="p-6">
                    <h3 class="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Score Breakdown</h3>
                    
                    <div class="space-y-4 text-sm">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><i class="ph-bold ph-check"></i></div>
                                <span class="text-slate-600">Correct Answers</span>
                            </div>
                            <div class="font-bold text-emerald-600">+ ${correct}</div>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><i class="ph-bold ph-x"></i></div>
                                <div>
                                    <span class="text-slate-600 block">Wrong Answers</span>
                                    <span class="text-[10px] text-rose-500 font-medium">(${wrong} x 0.25 penalty)</span>
                                </div>
                            </div>
                            <div class="font-bold text-rose-600">- ${penalty.toFixed(2)}</div>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><i class="ph-bold ph-minus"></i></div>
                                <span class="text-slate-600">Skipped</span>
                            </div>
                            <div class="font-bold text-slate-400">${skipped}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pb-10">
                <button onclick="switchMode('home')" class="py-3.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">Home</button>
                <button onclick="reviewAnswers()" class="py-3.5 rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Review Mistakes</button>
            </div>
        </div>
    `;
}

// --- Review Mode ---
function reviewAnswers() {
    const content = allQuestions.map((q, i) => {
        const ans = userAnswers[i];
        if (ans === q.correct) return ''; // Skip correct ones to focus on mistakes
        
        const isSkipped = !ans;
        const statusColor = isSkipped ? 'slate' : 'rose';
        const statusText = isSkipped ? 'Skipped' : 'Incorrect';

        return `
            <div class="bg-white p-6 rounded-2xl shadow-soft border border-slate-50 mb-4">
                <div class="flex items-center gap-2 mb-3">
                    <span class="bg-${statusColor}-100 text-${statusColor}-700 text-[10px] font-bold px-2 py-1 rounded uppercase">${statusText}</span>
                    <span class="text-xs text-slate-400 font-mono">Q${i+1}</span>
                </div>
                <h4 class="font-medium text-slate-800 mb-4">${q.question}</h4>
                
                <div class="grid md:grid-cols-2 gap-3 text-sm">
                    <div class="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 ${isSkipped ? 'hidden' : ''}">
                        <span class="block text-[10px] font-bold opacity-60 uppercase mb-1">You Selected</span>
                        ${q.options[ans] || ''}
                    </div>
                    <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                        <span class="block text-[10px] font-bold opacity-60 uppercase mb-1">Correct Answer</span>
                        ${q.options[q.correct]}
                    </div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-50 text-sm text-slate-500">
                    <span class="font-bold text-slate-700">Explanation:</span> ${q.explanation}
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('app-container').innerHTML = `
        <div class="max-w-2xl mx-auto pt-4 pb-10 animate-slide-up">
            <h2 class="text-xl font-bold text-slate-800 mb-6 px-1">Reviewing Mistakes</h2>
            ${content || '<div class="text-center p-10 text-slate-500">Perfect Score! Nothing to review. 🌟</div>'}
            <button onclick="switchMode('home')" class="w-full py-4 bg-slate-900 text-white font-bold rounded-xl mt-4 mb-10">Back to Dashboard</button>
        </div>
    `;
}

// --- Practice Mode ---
function startPractice() {
    currentIdx = parseInt(localStorage.getItem(STORAGE_PRACTICE_IDX) || '0');
    renderPractice();
}

function renderPractice() {
    const q = allQuestions[currentIdx];
    localStorage.setItem(STORAGE_PRACTICE_IDX, currentIdx);

    document.getElementById('app-container').innerHTML = `
        <div class="animate-slide-up max-w-2xl mx-auto pb-20 pt-4">
             <div class="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-slate-50">
                <div class="flex justify-between items-center mb-6">
                    <span class="text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">Practice #${currentIdx + 1}</span>
                    <button onclick="switchMode('home')" class="text-slate-400 hover:text-slate-600"><i class="ph-bold ph-x"></i></button>
                </div>

                <h3 class="text-xl font-medium text-slate-800 leading-relaxed mb-6">${q.question}</h3>
                
                <div class="flex flex-col gap-3" id="prac-opts">
                    ${Object.entries(q.options).map(([k, v]) => `
                        <button onclick="checkPractice('${k}')" id="btn-${k}" class="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-slate-200 flex items-center gap-4 transition-all">
                            <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 font-bold flex items-center justify-center">${k}</div>
                            <span class="text-slate-600 font-medium">${v}</span>
                        </button>
                    `).join('')}
                </div>

                <div id="expl-box" class="hidden mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-slide-up">
                    <div class="flex gap-2 text-indigo-600 font-bold text-sm mb-1">
                        <i class="ph-fill ph-info"></i> Explanation
                    </div>
                    <p class="text-slate-600 text-sm leading-relaxed">${q.explanation}</p>
                </div>
             </div>

             <div class="flex justify-between mt-6 px-2">
                <button onclick="movePrac(-1)" class="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-white transition" ${currentIdx===0?'disabled':''}>Previous</button>
                <button onclick="movePrac(1)" class="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200">Next Question</button>
             </div>
        </div>
    `;
}

function checkPractice(k) {
    const q = allQuestions[currentIdx];
    const btn = document.getElementById(`btn-${k}`);
    const correctBtn = document.getElementById(`btn-${q.correct}`);
    
    // Disable all
    document.querySelectorAll('#prac-opts button').forEach(b => b.disabled = true);

    if (k === q.correct) {
        btn.classList.replace('border-slate-100', 'border-emerald-500');
        btn.classList.add('bg-emerald-50');
        btn.children[0].classList.replace('bg-slate-100', 'bg-emerald-500');
        btn.children[0].classList.replace('text-slate-400', 'text-white');
    } else {
        btn.classList.replace('border-slate-100', 'border-rose-500');
        btn.classList.add('bg-rose-50');
        btn.children[0].classList.replace('bg-slate-100', 'bg-rose-500');
        btn.children[0].classList.replace('text-slate-400', 'text-white');
        
        // Show correct
        correctBtn.classList.replace('border-slate-100', 'border-emerald-500');
        correctBtn.classList.add('bg-emerald-50');
        correctBtn.children[0].classList.replace('bg-slate-100', 'bg-emerald-500');
        correctBtn.children[0].classList.replace('text-slate-400', 'text-white');
    }
    document.getElementById('expl-box').classList.remove('hidden');
}

function movePrac(d) {
    const n = currentIdx + d;
    if(n >= 0 && n < allQuestions.length) {
        currentIdx = n;
        renderPractice();
    }
}


