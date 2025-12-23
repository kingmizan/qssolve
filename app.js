// =================================================================
// ১. কনফিগারেশন (শুধুমাত্র লোকাল ফাইল)
// =================================================================
const LOCAL_FILE = "result.csv"; 

let routesData = [];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

// =================================================================
// ২. ডেটা লোডিং সিস্টেম
// =================================================================
async function initApp() {
    const badge = document.getElementById('connectionBadge');
    const loaderOverlay = document.getElementById('loaderOverlay');
    const loaderText = document.getElementById('loaderText');
    const fromSelect = document.getElementById('fromSelect');
    const toSelect = document.getElementById('toSelect');

    // ক্যাশ এড়ানোর জন্য টাইমস্ট্যাম্প
    const timestamp = Date.now();

    try {
        loaderText.innerText = "ডেটাবেস লোড হচ্ছে...";
        
        // ১. result.csv ফেচ করা
        const response = await fetch(`${LOCAL_FILE}?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`File not found (${response.status})`);
        }
        
        const csvText = await response.text();

        // ২. ডেটা ভ্যালিডেশন
        if (!csvText || csvText.length < 10) {
            throw new Error("CSV file is empty or corrupted");
        }

        // ৩. পার্স করা
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.data && results.data.length > 0) {
                    // সফল হলে প্রসেস শুরু
                    routesData = processData(results.data);
                    populateDropdowns();
                    
                    // UI আপডেট
                    loaderOverlay.classList.add('hidden');
                    badge.classList.remove('hidden');
                    badge.innerText = "● অনলাইন";
                    badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200";
                } else {
                    throw new Error("No readable data found in CSV");
                }
            },
            error: function(err) {
                throw err;
            }
        });

    } catch (err) {
        console.error("Error loading data:", err);
        
        // এরর দেখালে UI আপডেট
        loaderText.innerHTML = `<span class="text-red-500"><i class="fa-solid fa-triangle-exclamation"></i> ডেটা লোড ব্যর্থ হয়েছে!</span><br><span class="text-[10px] text-slate-400">কারণ: ${err.message}</span>`;
        badge.classList.remove('hidden');
        badge.innerText = "● এরর";
        badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200";
        
        fromSelect.innerHTML = '<option>ডেটাবেস এরর</option>';
        toSelect.innerHTML = '<option>ডেটাবেস এরর</option>';
    }
}

// =================================================================
// ৩. ডেটা প্রসেসিং লজিক
// =================================================================
function processData(rawData) {
    const routes = {};
    rawData.forEach(row => {
        const from = row.From || row.from;
        const to = row.To || row.to;
        
        if (!from || !to) return;

        const key = `${from.trim()}-${to.trim()}`;

        if (!routes[key]) {
            routes[key] = {
                from: from.trim(),
                to: to.trim(),
                summary: row.Summary || row.summary || "",
                time: row.Time || row.time || "",
                methods: {},
                tips: (row.Tips || row.tips || "").split('|').filter(t => t && t.trim() !== "" && t !== "-")
            };
        }

        const methodTitle = row.MethodTitle || row.methodtitle || "অন্যান্য";
        if (!routes[key].methods[methodTitle]) {
            routes[key].methods[methodTitle] = {
                title: methodTitle,
                icon: (row.MethodIcon || row.methodicon || "bus").toLowerCase(),
                steps: []
            };
        }

        routes[key].methods[methodTitle].steps.push({
            label: row.StepLabel || row.steplabel || "ধাপ",
            text: row.StepText || row.steptext || ""
        });
    });
    return Object.values(routes).map(r => ({ ...r, methods: Object.values(r.methods) }));
}

// =================================================================
// ৪. ইউজার ইন্টারফেস (UI) হ্যান্ডলিং
// =================================================================
function populateDropdowns() {
    const fromSelect = document.getElementById('fromSelect');
    const toSelect = document.getElementById('toSelect');

    // ড্রপডাউন ক্লিয়ার ও এনাবল করা
    fromSelect.innerHTML = '<option value="">লোকেশন বাছাই করুন</option>';
    toSelect.innerHTML = '<option value="">পরীক্ষার কেন্দ্র বাছাই করুন</option>';
    fromSelect.disabled = false;
    toSelect.disabled = false;

    // ইউনিক ভ্যালু বের করা এবং সর্ট করা
    const uniqueFrom = [...new Set(routesData.map(r => r.from))].sort();
    const uniqueTo = [...new Set(routesData.map(r => r.to))].sort();

    // অপশন যোগ করা
    uniqueFrom.forEach(loc => {
        if(loc){
            const opt = document.createElement('option');
            opt.value = loc;
            opt.textContent = loc;
            fromSelect.appendChild(opt);
        }
    });

    uniqueTo.forEach(loc => {
        if(loc){
            const opt = document.createElement('option');
            opt.value = loc;
            opt.textContent = loc;
            toSelect.appendChild(opt);
        }
    });
}

function setupEventListeners() {
    const fromSelect = document.getElementById('fromSelect');
    const toSelect = document.getElementById('toSelect');
    const btn = document.getElementById('searchBtn');

    function updateBtn() {
        if (fromSelect.value && toSelect.value) {
            btn.disabled = false;
            btn.className = "w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 shadow-lg cursor-pointer";
        } else {
            btn.disabled = true;
            btn.className = "w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all active:scale-95 bg-slate-200 text-slate-400 cursor-not-allowed";
        }
    }
    fromSelect.addEventListener('change', updateBtn);
    toSelect.addEventListener('change', updateBtn);
}

function searchRoute() {
    const fromVal = document.getElementById('fromSelect').value;
    const toVal = document.getElementById('toSelect').value;
    const container = document.getElementById('resultContainer');

    const result = routesData.find(r => r.from === fromVal && r.to === toVal);
    container.innerHTML = '';
    container.classList.remove('hidden');

    if (!result) {
        container.innerHTML = `<div class="bg-red-50 p-6 rounded-xl text-center text-red-600 font-bold border border-red-200 fade-in">দুঃখিত, কোনো তথ্য পাওয়া যায়নি!</div>`;
        return;
    }

    const getIcon = (t) => t.includes('train') ? '<i class="fa-solid fa-train"></i>' : (t.includes('car') ? '<i class="fa-solid fa-car"></i>' : '<i class="fa-solid fa-bus"></i>');

    let html = `
        <div class="slide-up space-y-6">
            <div class="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
                <div class="relative z-10">
                    <h3 class="text-xs font-bold uppercase mb-2 opacity-80">সারসংক্ষেপ</h3>
                    <p class="font-medium text-lg mb-4 leading-snug">${result.summary}</p>
                    <div class="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg text-sm border border-white/10">
                        <i class="fa-regular fa-clock text-emerald-200"></i> ${result.time}
                    </div>
                </div>
            </div>
            
            <div class="space-y-4">
                <div class="flex justify-between px-1"><h4 class="font-bold text-slate-700">যাতায়াতের উপায়</h4><span class="text-xs bg-slate-200 px-2 py-1 rounded font-bold text-slate-600">${result.methods.length}টি অপশন</span></div>
    `;

    result.methods.forEach(method => {
        html += `
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 group hover:border-emerald-200 transition-colors">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 text-lg group-hover:bg-emerald-100 transition-colors">${getIcon(method.icon)}</div>
                    <h5 class="font-bold text-slate-800 text-lg">${method.title}</h5>
                </div>
                <div class="space-y-4 pl-6 border-l-2 border-slate-100 ml-2 relative">
        `;
        method.steps.forEach(step => {
            html += `
                <div class="relative pl-6">
                    <div class="absolute -left-[11px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-emerald-400 z-10"></div>
                    <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">${step.label}</p>
                    <p class="text-sm text-slate-700 leading-relaxed">${step.text}</p>
                </div>
            `;
        });
        html += `</div></div>`;
    });

    if (result.tips.length > 0) {
        html += `<div class="bg-amber-50 p-6 rounded-2xl border border-amber-100 relative"><h5 class="font-bold text-amber-800 mb-3 flex items-center gap-2"><i class="fa-solid fa-triangle-exclamation"></i> পরামর্শ</h5><ul class="space-y-2 text-sm text-slate-700">`;
        result.tips.forEach(t => html += `<li class="flex gap-3"><div class="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0"></div><span class="leading-relaxed">${t}</span></li>`);
        html += `</ul></div>`;
    }

    html += `<button onclick="location.reload()" class="w-full py-4 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm">নতুন রুট খুঁজুন</button></div>`;

    container.innerHTML = html;
}


