// =================================================================
// ১. কনফিগারেশন
// =================================================================
const LOCAL_FILE = "result.csv"; // আপনার আপলোড করা ফাইলের নাম

// ব্যাকআপ ডেটা (যদি result.csv লোড না হয় বা সার্ভারে না থাকে)
const BACKUP_DATA = `From,To,Summary,Time,MethodTitle,MethodIcon,StepLabel,StepText,Tips
মিরপুর,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),সরাসরি বাস খুব কম তবে ৩টি সহজ উপায় আছে।,১ ঘণ্টা ৫০ মিনিট,১. কালশী বা মিরপুর ১০/১১ হয়ে,bus,বাসে উঠুন,"মিরপুর ১০, ১১ বা কালশী থেকে 'অছিম পরিবহন' বা 'আলিফ পরিবহন'-এ উঠুন।",যাওয়ার আগে নিশ্চিত হয়ে নিন আপনি স্কুল ভবন (শান্তিবাগ) নাকি কলেজ ভবনে (মাতুয়াইল) যাবেন।|ডেমরা রোডে মাঝে মাঝে জ্যাম থাকে।
মিরপুর,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),সরাসরি বাস খুব কম তবে ৩টি সহজ উপায় আছে।,১ ঘণ্টা ৫০ মিনিট,১. কালশী বা মিরপুর ১০/১১ হয়ে,bus,নামার স্থান,ডেমরা স্টাফ কোয়ার্টার।,-
মিরপুর,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),সরাসরি বাস খুব কম তবে ৩টি সহজ উপায় আছে।,১ ঘণ্টা ৫০ মিনিট,১. কালশী বা মিরপুর ১০/১১ হয়ে,bus,পরবর্তী ধাপ,সেখান থেকে রিকশা বা ইজিবাইকে করে সরাসরি স্কুলে পৌঁছানো যায়।,-
মিরপুর,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),সরাসরি বাস খুব কম তবে ৩টি সহজ উপায় আছে।,১ ঘণ্টা ৫০ মিনিট,২. টেকনিক্যাল বা গাবতলী হয়ে,bus,রুট,মিরপুর থেকে টেকনিক্যাল মোড়ে গিয়ে সাভার-কাঁচপুর রুটের বাসে উঠতে পারেন।,-
মিরপুর,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),সরাসরি বাস খুব কম তবে ৩টি সহজ উপায় আছে।,১ ঘণ্টা ৫০ মিনিট,২. টেকনিক্যাল বা গাবতলী হয়ে,bus,বাসের নাম,ঠিকানা মৌমিতা বা নীলাচল।,-
মিরপুর,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),সরাসরি বাস খুব কম তবে ৩টি সহজ উপায় আছে।,১ ঘণ্টা ৫০ মিনিট,২. টেকনিক্যাল বা গাবতলী হয়ে,bus,নামার স্থান,তামিরুল মিল্লাত মহিলা মাদ্রাসার সামনে বা মাতুয়াইল।,-
মিরপুর,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),সরাসরি বাস খুব কম তবে ৩টি সহজ উপায় আছে।,১ ঘণ্টা ৫০ মিনিট,৩. মেট্রোরেল ব্যবহার করে,train,ধাপ ১,মেট্রোরেলে করে মতিঝিল বা গুলিস্তান চলে আসুন।,-
মিরপুর,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),সরাসরি বাস খুব কম তবে ৩টি সহজ উপায় আছে।,১ ঘণ্টা ৫০ মিনিট,৩. মেট্রোরেল ব্যবহার করে,train,ধাপ ২,গুলিস্তান থেকে গ্লোরি বা গাউছিয়া এক্সপ্রেস বাসে করে কোনাপাড়া নামুন।,-
উত্তরা,নটর ডেম কলেজ (মতিঝিল),মেট্রোরেল ব্যবহার করা সবচেয়ে সুবিধাজনক।,১ ঘণ্টা ১০ মিনিট,মেট্রোরেল রুট,train,স্টেশন,উত্তরা নর্থ বা সাউথ স্টেশন থেকে মতিঝিলগামী ট্রেনে উঠুন।,সকাল ৮টা-৯টার দিকে মেট্রোতে ভিড় থাকে।
উত্তরা,নটর ডেম কলেজ (মতিঝিল),মেট্রোরেল ব্যবহার করা সবচেয়ে সুবিধাজনক।,১ ঘণ্টা ১০ মিনিট,মেট্রোরেল রুট,train,গন্তব্য,মতিঝিল স্টেশনে নেমে ১০ মিনিট হাঁটলেই কলেজ।,-
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,১. মিরপুর ১০/১১ বা কালশী হয়ে,bus,বাসে উঠুন,"মিরপুর ১০, ১১ বা কালশী থেকে 'শিখর' বা 'হিমাচল (বিআরটিসি)' বাসে উঠুন।",বাসের হেল্পারকে আগেই 'রায়েরবাগ' নামিয়ে দিতে বলবেন।|সকালে ডেমরা রোডে জ্যাম থাকতে পারে।
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,১. মিরপুর ১০/১১ বা কালশী হয়ে,bus,নামার স্থান,যাত্রাবাড়ী ফ্লাইওভার পার হয়ে রায়েরবাগ বাস স্ট্যান্ডে নামুন।,-
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,১. মিরপুর ১০/১১ বা কালশী হয়ে,bus,পরবর্তী ধাপ,রায়েরবাগ থেকে ডেমরা রোডের মুখে গিয়ে অটো বা রিকশায় ৫-১০ মিনিটে কলেজ গেট।,-
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,২. মিরপুর ১ বা টেকনিক্যাল হয়ে,bus,বাসের নাম,মিরপুর ১ বা টেকনিক্যাল থেকে 'ঠিকানা' বা 'মৌমিতা' বাসে উঠুন।,-
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,২. মিরপুর ১ বা টেকনিক্যাল হয়ে,bus,গন্তব্য,রায়েরবাগ বাস স্ট্যান্ডে নামুন।,-
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,৩. যাত্রাবাড়ী থেকে লেগুনা রুট,car,ধাপ ১,মিরপুর থেকে যেকোনো বাসে যাত্রাবাড়ী মোড় নামুন।,-
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,৩. যাত্রাবাড়ী থেকে লেগুনা রুট,car,ধাপ ২,যাত্রাবাড়ী থেকে ডেমরাগামী লেগুনায় উঠে 'মোল্লা কলেজ' এর সামনে নামুন।,-
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,৪. মেট্রোরেল ব্যবহার করে,train,স্টেশন,মিরপুর থেকে মেট্রোরেলে মতিঝিল স্টেশনে নামুন।,-
মিরপুর,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),রায়েরবাগ বাস স্ট্যান্ড হয়ে যাওয়া সবচেয়ে দ্রুত ও সুবিধাজনক।,১ ঘণ্টা ৩০ মিনিট - ২ ঘণ্টা,৪. মেট্রোরেল ব্যবহার করে,train,পরবর্তী ধাপ,মতিঝিল থেকে বাসে করে রায়েরবাগ হয়ে রিকশা বা অটোতে কলেজ।,-
উত্তরা,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),আব্দুল্লাহপুর থেকে সরাসরি বাসে বা মেট্রোরেলে দ্রুত পৌঁছানো সম্ভব।,২ ঘণ্টা - ২ ঘণ্টা ৩০ মিনিট,১. আব্দুল্লাহপুর থেকে সরাসরি বাস,bus,বাসে উঠুন,আব্দুল্লাহপুর বা হাউজ বিল্ডিং থেকে 'অনাবিল' বা 'রাইদা' বাসে উঠুন।,বাসে ওঠার সময় ডেমরা বা মাতুয়াইল যাওয়ার কথা নিশ্চিত করে নিন।|রাস্তায় যানজট থাকলে সময় বেশি লাগতে পারে।
উত্তরা,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),আব্দুল্লাহপুর থেকে সরাসরি বাসে বা মেট্রোরেলে দ্রুত পৌঁছানো সম্ভব।,২ ঘণ্টা - ২ ঘণ্টা ৩০ মিনিট,১. আব্দুল্লাহপুর থেকে সরাসরি বাস,bus,নামার স্থান,যাত্রাবাড়ী ফ্লাইওভার পার হয়ে 'রায়েরবাগ' অথবা 'মাতুয়াইল' স্ট্যান্ডে নামুন।,-
উত্তরা,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),আব্দুল্লাহপুর থেকে সরাসরি বাসে বা মেট্রোরেলে দ্রুত পৌঁছানো সম্ভব।,২ ঘণ্টা - ২ ঘণ্টা ৩০ মিনিট,১. আব্দুল্লাহপুর থেকে সরাসরি বাস,bus,পরবর্তী ধাপ,স্ট্যান্ড থেকে রিকশা বা ইজিবাইকে ৫-১০ মিনিটে স্কুল/কলেজ গেটে পৌঁছানো যায়।,-
উত্তরা,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),আব্দুল্লাহপুর থেকে সরাসরি বাসে বা মেট্রোরেলে দ্রুত পৌঁছানো সম্ভব।,২ ঘণ্টা - ২ ঘণ্টা ৩০ মিনিট,২. মেট্রোরেল রুট,train,স্টেশন,উত্তরা নর্থ বা সাউথ স্টেশন থেকে মেট্রোরেলে মতিঝিল স্টেশনে নামুন।,-
উত্তরা,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),আব্দুল্লাহপুর থেকে সরাসরি বাসে বা মেট্রোরেলে দ্রুত পৌঁছানো সম্ভব।,২ ঘণ্টা - ২ ঘণ্টা ৩০ মিনিট,২. মেট্রোরেল রুট,train,বাস সংযোগ,মতিঝিল থেকে বাসে (যেমন: ট্রান্সিলভা) করে রায়েরবাগ বা মাতুয়াইল নামুন।,-
উত্তরা,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),আব্দুল্লাহপুর থেকে সরাসরি বাসে বা মেট্রোরেলে দ্রুত পৌঁছানো সম্ভব।,২ ঘণ্টা - ২ ঘণ্টা ৩০ মিনিট,৩. বিআরটিসি (এসি বাস),bus,বাসের নাম,উত্তরা থেকে বিআরটিসি এসি বাসে উঠে সরাসরি যাত্রাবাড়ী বা রায়েরবাগ নামুন।,-
উত্তরা,সামসুল হক খান স্কুল অ্যান্ড কলেজ (ডেমরা),আব্দুল্লাহপুর থেকে সরাসরি বাসে বা মেট্রোরেলে দ্রুত পৌঁছানো সম্ভব।,২ ঘণ্টা - ২ ঘণ্টা ৩০ মিনিট,৩. বিআরটিসি (এসি বাস),bus,শেষ ধাপ,রায়েরবাগ থেকে অটো বা রিকশা নিয়ে কলেজে প্রবেশ করুন।,-
উত্তরা,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),আব্দুল্লাহপুর থেকে বাসে অথবা মেট্রোরেল ব্যবহার করে যাওয়া সবচেয়ে সুবিধাজনক।,২ ঘণ্টা - ২ ঘণ্টা ২০ মিনিট,১. আব্দুল্লাহপুর থেকে সরাসরি বাস,bus,বাসে উঠুন,"আব্দুল্লাহপুর বা হাউজ বিল্ডিং থেকে 'অনাবিল', 'রাইদা' বা 'প্রচেষ্টা' বাসে উঠুন।",সবচেয়ে ভালো হয় 'রায়েরবাগ' স্ট্যান্ডে নামলে। এখান থেকে কলেজটি খুব কাছে।|সকালে ডেমরা রুটে যানজট থাকে।
উত্তরা,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),আব্দুল্লাহপুর থেকে বাসে অথবা মেট্রোরেল ব্যবহার করে যাওয়া সবচেয়ে সুবিধাজনক।,২ ঘণ্টা - ২ ঘণ্টা ২০ মিনিট,১. আব্দুল্লাহপুর থেকে সরাসরি বাস,bus,নামার স্থান,যাত্রাবাড়ী পার হয়ে 'রায়েরবাগ' বাস স্ট্যান্ডে নামুন।,-
উত্তরা,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),আব্দুল্লাহপুর থেকে বাসে অথবা মেট্রোরেল ব্যবহার করে যাওয়া সবচেয়ে সুবিধাজনক।,২ ঘণ্টা - ২ ঘণ্টা ২০ মিনিট,১. আব্দুল্লাহপুর থেকে সরাসরি বাস,bus,পরবর্তী ধাপ,রায়েরবাগ ফ্লাইওভারের নিচ থেকে অটো-রিকশায় ৫-১০ মিনিটে কলেজের গেটে পৌঁছানো যায়।,-
উত্তরা,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),আব্দুল্লাহপুর থেকে বাসে অথবা মেট্রোরেল ব্যবহার করে যাওয়া সবচেয়ে সুবিধাজনক।,২ ঘণ্টা - ২ ঘণ্টা ২০ মিনিট,২. মেট্রোরেল ও বাস রুট,train,স্টেশন,উত্তরা নর্থ বা সাউথ স্টেশন থেকে মেট্রোরেলে সরাসরি মতিঝিল নামুন।,-
উত্তরা,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),আব্দুল্লাহপুর থেকে বাসে অথবা মেট্রোরেল ব্যবহার করে যাওয়া সবচেয়ে সুবিধাজনক।,২ ঘণ্টা - ২ ঘণ্টা ২০ মিনিট,২. মেট্রোরেল ও বাস রুট,train,বাস সংযোগ,মতিঝিল থেকে 'ট্রান্সিলভা' বা 'শিকড়' বাসে উঠে রায়েরবাগ নামুন।,-
উত্তরা,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),আব্দুল্লাহপুর থেকে বাসে অথবা মেট্রোরেল ব্যবহার করে যাওয়া সবচেয়ে সুবিধাজনক।,২ ঘণ্টা - ২ ঘণ্টা ২০ মিনিট,৩. বিআরটিসি (এসি বাস),bus,রুট,উত্তরা থেকে বিআরটিসি এসি বাসে সরাসরি যাত্রাবাড়ী বা রায়েরবাগ নামুন।,-
উত্তরা,ড. মাহাবুবুর রহমান মোল্লা কলেজ (DMRC),আব্দুল্লাহপুর থেকে বাসে অথবা মেট্রোরেল ব্যবহার করে যাওয়া সবচেয়ে সুবিধাজনক।,২ ঘণ্টা - ২ ঘণ্টা ২০ মিনিট,৩. বিআরটিসি (এসি বাস),bus,শেষ ধাপ,রায়েরবাগ বাস স্ট্যান্ড থেকে অটোতে করে কলেজে চলে যান।,-`;

let routesData = [];

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

// =================================================================
// ২. ডেটা লোডিং সিস্টেম (Local CSV)
// =================================================================
async function initApp() {
    const badge = document.getElementById('connectionBadge');
    const loaderOverlay = document.getElementById('loaderOverlay');
    const loaderText = document.getElementById('loaderText');

    let finalData = [];
    let source = "OFFLINE";
    
    // ক্যাশ এড়ানোর জন্য টাইমস্ট্যাম্প (যাতে ফাইল আপডেট করলে সাথে সাথে দেখা যায়)
    const timestamp = Date.now();

    try {
        loaderText.innerText = "লোকাল ফাইল চেক করা হচ্ছে...";
        
        // ১. result.csv ফেচ করার চেষ্টা
        const response = await fetch(`${LOCAL_FILE}?t=${timestamp}`);
        
        if (!response.ok) throw new Error("File not found");
        
        const csvText = await response.text();

        // ২. ডেটা ভ্যালিডেশন
        if (!csvText || csvText.length < 50) {
            throw new Error("CSV file is empty");
        }

        // ৩. পার্স করা
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

        if (parsed.data && parsed.data.length > 0 && (parsed.data[0].From || parsed.data[0].from)) {
            finalData = parsed.data;
            source = "FILE";
            console.log("Loaded data from result.csv");
        } else {
            throw new Error("Invalid CSV format");
        }

    } catch (err) {
        console.warn("Local file load failed (" + err.message + "), using internal Backup.");
        
        // ব্যর্থ হলে ব্যাকআপ ব্যবহার করো
        const backupParsed = Papa.parse(BACKUP_DATA, { header: true, skipEmptyLines: true });
        finalData = backupParsed.data;
        source = "BACKUP";
    }

    // প্রসেসিং
    processAndReady(finalData, source);

    function processAndReady(data, src) {
        routesData = processData(data);
        populateDropdowns();
        
        loaderOverlay.classList.add('hidden');
        badge.classList.remove('hidden');
        
        if (src === "FILE") {
            badge.innerText = "● ফাইল ডেটা";
            badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-100 text-emerald-700 border-emerald-200";
        } else {
            badge.innerText = "● ব্যাকআপ";
            badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-100 text-amber-700 border-amber-200";
        }
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
// ৪. ইউজার ইন্টারফেস (UI)
// =================================================================
function populateDropdowns() {
    const fromSelect = document.getElementById('fromSelect');
    const toSelect = document.getElementById('toSelect');

    fromSelect.innerHTML = '<option value="">লোকেশন বাছাই করুন</option>';
    toSelect.innerHTML = '<option value="">পরীক্ষার কেন্দ্র বাছাই করুন</option>';
    
    fromSelect.disabled = false;
    toSelect.disabled = false;

    const uniqueFrom = [...new Set(routesData.map(r => r.from))].sort();
    const uniqueTo = [...new Set(routesData.map(r => r.to))].sort();

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


