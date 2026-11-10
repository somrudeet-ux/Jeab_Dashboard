export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigParams = {
  apiKey: "AIzaSyYOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

export function generateSurveyHTML(config: FirebaseConfigParams = DEFAULT_FIREBASE_CONFIG): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>แบบประเมินความพึงพอใจการอบรม</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Prompt -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- Canvas Confetti -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <!-- Firebase App & Realtime Database SDKs (v9 compat) -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <style>
    body { font-family: 'Prompt', sans-serif; }
    input[type="radio"]:checked + label {
      border-color: #10b981;
      background-color: rgba(16, 185, 129, 0.15);
      color: #34d399;
      transform: scale(1.04);
    }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen py-6 px-4 flex flex-col items-center">

  <main class="w-full max-w-lg bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-6 mb-8">
    
    <!-- Header -->
    <header class="text-center mb-6">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg mb-3">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white tracking-wide">แบบประเมินความพึงพอใจ</h1>
      <p class="text-emerald-400 text-sm mt-1 font-medium">การฝึกอบรมและพัฒนาทักษะ (Training Evaluation)</p>
      <div class="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/60 rounded-full text-xs text-slate-300">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        ไม่ระบุชื่อผู้ตอบ • ข้อมูลจะถูกประมวลผลทันที
      </div>
    </header>

    <!-- Already Submitted Alert View (Hidden by default) -->
    <div id="alreadySubmittedView" class="hidden text-center py-8">
      <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-white mb-2">ท่านได้ส่งแบบประเมินแล้ว</h2>
      <p class="text-slate-400 text-sm mb-6 leading-relaxed">
        ระบบได้บันทึกคะแนนของท่านและส่งต่อไปยังหน้าจอวิทยากรเรียบร้อยแล้ว ขอขอบคุณสำหรับข้อเสนอแนะอันมีค่า
      </p>
      <button onclick="resetSubmissionForTesting()" class="text-xs text-slate-400 underline hover:text-emerald-400">
        (สำหรับผู้ทดสอบ) รีเซ็ตเพื่อทำแบบสอบถามใหม่อีกครั้ง
      </button>
    </div>

    <!-- Survey Form -->
    <form id="surveyForm" class="space-y-6">

      <!-- Question 1 -->
      <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
        <div class="flex items-start justify-between gap-2 mb-3">
          <label class="font-medium text-slate-200 text-sm md:text-base leading-snug">
            1. เนื้อหาและหลักสูตรตรงตามวัตถุประสงค์และความต้องการ
          </label>
        </div>
        <div class="grid grid-cols-5 gap-1.5 text-center">
          <div><input type="radio" name="q1" value="1" id="q1_1" class="hidden" required><label for="q1_1" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😞</div>1</label></div>
          <div><input type="radio" name="q1" value="2" id="q1_2" class="hidden"><label for="q1_2" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙁</div>2</label></div>
          <div><input type="radio" name="q1" value="3" id="q1_3" class="hidden"><label for="q1_3" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😐</div>3</label></div>
          <div><input type="radio" name="q1" value="4" id="q1_4" class="hidden"><label for="q1_4" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙂</div>4</label></div>
          <div><input type="radio" name="q1" value="5" id="q1_5" class="hidden"><label for="q1_5" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🤩</div>5</label></div>
        </div>
        <div class="flex justify-between text-[11px] text-slate-400 mt-2 px-1">
          <span>1 = น้อยที่สุด</span>
          <span>5 = มากที่สุด</span>
        </div>
      </div>

      <!-- Question 2 -->
      <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
        <label class="font-medium text-slate-200 text-sm md:text-base leading-snug block mb-3">
          2. วิทยากรมีความรู้ ความเชี่ยวชาญ และถ่ายทอดเข้าใจง่าย
        </label>
        <div class="grid grid-cols-5 gap-1.5 text-center">
          <div><input type="radio" name="q2" value="1" id="q2_1" class="hidden" required><label for="q2_1" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😞</div>1</label></div>
          <div><input type="radio" name="q2" value="2" id="q2_2" class="hidden"><label for="q2_2" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙁</div>2</label></div>
          <div><input type="radio" name="q2" value="3" id="q2_3" class="hidden"><label for="q2_3" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😐</div>3</label></div>
          <div><input type="radio" name="q2" value="4" id="q2_4" class="hidden"><label for="q2_4" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙂</div>4</label></div>
          <div><input type="radio" name="q2" value="5" id="q2_5" class="hidden"><label for="q2_5" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🤩</div>5</label></div>
        </div>
      </div>

      <!-- Question 3 -->
      <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
        <label class="font-medium text-slate-200 text-sm md:text-base leading-snug block mb-3">
          3. การจัดสรรเวลา ลำดับหัวข้อ และกิจกรรมการเรียนรู้
        </label>
        <div class="grid grid-cols-5 gap-1.5 text-center">
          <div><input type="radio" name="q3" value="1" id="q3_1" class="hidden" required><label for="q3_1" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😞</div>1</label></div>
          <div><input type="radio" name="q3" value="2" id="q3_2" class="hidden"><label for="q3_2" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙁</div>2</label></div>
          <div><input type="radio" name="q3" value="3" id="q3_3" class="hidden"><label for="q3_3" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😐</div>3</label></div>
          <div><input type="radio" name="q3" value="4" id="q3_4" class="hidden"><label for="q3_4" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙂</div>4</label></div>
          <div><input type="radio" name="q3" value="5" id="q3_5" class="hidden"><label for="q3_5" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🤩</div>5</label></div>
        </div>
      </div>

      <!-- Question 4 -->
      <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
        <label class="font-medium text-slate-200 text-sm md:text-base leading-snug block mb-3">
          4. อุปกรณ์ โสตทัศนูปกรณ์ และสถานที่อำนวยความสะดวก
        </label>
        <div class="grid grid-cols-5 gap-1.5 text-center">
          <div><input type="radio" name="q4" value="1" id="q4_1" class="hidden" required><label for="q4_1" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😞</div>1</label></div>
          <div><input type="radio" name="q4" value="2" id="q4_2" class="hidden"><label for="q4_2" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙁</div>2</label></div>
          <div><input type="radio" name="q4" value="3" id="q4_3" class="hidden"><label for="q4_3" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😐</div>3</label></div>
          <div><input type="radio" name="q4" value="4" id="q4_4" class="hidden"><label for="q4_4" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙂</div>4</label></div>
          <div><input type="radio" name="q4" value="5" id="q4_5" class="hidden"><label for="q4_5" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🤩</div>5</label></div>
        </div>
      </div>

      <!-- Question 5 -->
      <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
        <label class="font-medium text-slate-200 text-sm md:text-base leading-snug block mb-3">
          5. ความรู้ที่ได้รับสามารถนำไปประยุกต์ใช้ในการทำงานได้จริง
        </label>
        <div class="grid grid-cols-5 gap-1.5 text-center">
          <div><input type="radio" name="q5" value="1" id="q5_1" class="hidden" required><label for="q5_1" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😞</div>1</label></div>
          <div><input type="radio" name="q5" value="2" id="q5_2" class="hidden"><label for="q5_2" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙁</div>2</label></div>
          <div><input type="radio" name="q5" value="3" id="q5_3" class="hidden"><label for="q5_3" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">😐</div>3</label></div>
          <div><input type="radio" name="q5" value="4" id="q5_4" class="hidden"><label for="q5_4" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🙂</div>4</label></div>
          <div><input type="radio" name="q5" value="5" id="q5_5" class="hidden"><label for="q5_5" class="cursor-pointer block py-2.5 rounded-lg border border-slate-700 text-slate-300 text-xs transition active:scale-95"><div class="text-lg">🤩</div>5</label></div>
        </div>
      </div>

      <!-- Suggestions Comment (Optional) -->
      <div class="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
        <label for="comment" class="block font-medium text-slate-200 text-sm mb-2">
          ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)
        </label>
        <textarea id="comment" name="comment" rows="3" placeholder="ระบุสิ่งที่ประทับใจ หรือสิ่งที่ต้องการให้ปรับปรุง..." class="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-lg p-3 text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"></textarea>
      </div>

      <!-- Submit Button -->
      <button type="submit" id="submitBtn" class="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition flex items-center justify-center gap-2 text-base">
        <span>ส่งแบบประเมิน</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </button>

      <p id="errorMsg" class="text-rose-400 text-center text-xs hidden"></p>

    </form>

  </main>

  <footer class="text-xs text-slate-500 text-center">
    ระบบประเมินความพึงพอใจการอบรม • Powered by Firebase Realtime Database
  </footer>

  <script>
    // 1. Firebase Configuration (ใส่ Config ของโปรเจกต์คุณตรงนี้)
    const firebaseConfig = {
      apiKey: "${config.apiKey}",
      authDomain: "${config.authDomain}",
      databaseURL: "${config.databaseURL}",
      projectId: "${config.projectId}",
      storageBucket: "${config.storageBucket}",
      messagingSenderId: "${config.messagingSenderId}",
      appId: "${config.appId}"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // Check duplicate response via LocalStorage
    const SUBMIT_KEY = 'training_survey_submitted_flag';
    if (localStorage.getItem(SUBMIT_KEY)) {
      document.getElementById('surveyForm').classList.add('hidden');
      document.getElementById('alreadySubmittedView').classList.remove('hidden');
    }

    function resetSubmissionForTesting() {
      localStorage.removeItem(SUBMIT_KEY);
      location.reload();
    }

    // Handle Form Submit
    const form = document.getElementById('surveyForm');
    const submitBtn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMsg');

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      errorMsg.classList.add('hidden');

      const q1 = Number(form.q1.value);
      const q2 = Number(form.q2.value);
      const q3 = Number(form.q3.value);
      const q4 = Number(form.q4.value);
      const q5 = Number(form.q5.value);
      const comment = (document.getElementById('comment').value || '').trim();

      if (!q1 || !q2 || !q3 || !q4 || !q5) {
        errorMsg.textContent = 'กรุณาให้คะแนนให้ครบทั้ง 5 ข้อ';
        errorMsg.classList.remove('hidden');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'กำลังส่งข้อมูล...';

      const avg = Number(((q1 + q2 + q3 + q4 + q5) / 5).toFixed(2));

      try {
        // Push record to Firebase Realtime Database at path: /feedbacks
        await db.ref('feedbacks').push({
          q1: q1,
          q2: q2,
          q3: q3,
          q4: q4,
          q5: q5,
          average: avg,
          comment: comment,
          createdAt: new Date().toISOString()
        });

        // Save submitted flag to prevent re-submission on this device
        localStorage.setItem(SUBMIT_KEY, 'true');

        // Confetti celebration
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }

        form.classList.add('hidden');
        document.getElementById('alreadySubmittedView').classList.remove('hidden');

      } catch (err) {
        console.error('Firebase save error:', err);
        errorMsg.textContent = 'เกิดข้อผิดพลาดในการบันทึก: ' + (err.message || 'กรุณาลองใหม่อีกครั้ง');
        errorMsg.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'ส่งแบบประเมิน';
      }
    });
  </script>
</body>
</html>`;
}

export function generateDashboardHTML(config: FirebaseConfigParams = DEFAULT_FIREBASE_CONFIG): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Projector Dashboard | สรุปผลการประเมินแบบเรียลไทม์</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts: Prompt -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- QRCode.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <!-- Firebase App & Realtime Database SDKs (v9 compat) -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <style>
    body { font-family: 'Prompt', sans-serif; }
    .num-font { font-family: 'Plus Jakarta Sans', 'Prompt', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 md:p-6 lg:p-8 flex flex-col">

  <!-- Top Bar for Projector Presentation -->
  <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">สรุปผลการประเมินความพึงพอใจการอบรม</h1>
          <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE REAL-TIME
          </span>
        </div>
        <p class="text-slate-400 text-sm mt-0.5">ผลตอบรับจากผู้เข้าอบรมจะอัปเดตบนจอนี้ทันทีอัตโนมัติ</p>
      </div>
    </div>

    <!-- Actions: Download CSV, Toggle Fullscreen -->
    <div class="flex items-center gap-3">
      <button onclick="downloadCSV()" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 shadow transition active:scale-95">
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        ดาวน์โหลด CSV
      </button>
      <button onclick="toggleFullScreen()" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition active:scale-95">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
        </svg>
        โหมดฉายเต็มจอ
      </button>
    </div>
  </header>

  <!-- Metric Summary Cards -->
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
    
    <!-- Total Respondents -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div class="text-slate-400 text-xs uppercase font-medium tracking-wider">จำนวนผู้ประเมินทั้งหมด</div>
      <div class="flex items-baseline gap-2 mt-2">
        <span id="totalCount" class="text-4xl md:text-5xl font-extrabold text-white num-font">0</span>
        <span class="text-slate-400 text-sm">คน</span>
      </div>
      <div class="text-xs text-slate-500 mt-2">อัปเดตสดจากมือถือผู้เข้าอบรม</div>
    </div>

    <!-- Overall Average Score -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div class="text-slate-400 text-xs uppercase font-medium tracking-wider">คะแนนเฉลี่ยรวม (เต็ม 5)</div>
      <div class="flex items-baseline gap-2 mt-2">
        <span id="overallAvg" class="text-4xl md:text-5xl font-extrabold text-emerald-400 num-font">0.00</span>
        <span class="text-slate-400 text-sm">/ 5.00</span>
      </div>
      <div class="mt-2">
        <span id="overallBadge" class="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-800 text-slate-400">
          รอผลประเมิน
        </span>
      </div>
    </div>

    <!-- Satisfaction Rate -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div class="text-slate-400 text-xs uppercase font-medium tracking-wider">ร้อยละความพึงพอใจ</div>
      <div class="flex items-baseline gap-2 mt-2">
        <span id="satisfactionPercent" class="text-4xl md:text-5xl font-extrabold text-cyan-400 num-font">0%</span>
      </div>
      <div class="text-xs text-slate-400 mt-2">คำนวณจากสัดส่วนคะแนนรวม</div>
    </div>

    <!-- Total Comments -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div class="text-slate-400 text-xs uppercase font-medium tracking-wider">ข้อเสนอแนะเพิ่มเติม</div>
      <div class="flex items-baseline gap-2 mt-2">
        <span id="totalComments" class="text-4xl md:text-5xl font-extrabold text-amber-400 num-font">0</span>
        <span class="text-slate-400 text-sm">รายการ</span>
      </div>
      <div class="text-xs text-slate-400 mt-2">ความคิดเห็นเพื่อการพัฒนา</div>
    </div>

  </section>

  <!-- Main Content Layout (Chart + Comments + QR) -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

    <!-- Left: Bar Chart & Criteria (7 Columns) -->
    <div class="lg:col-span-7 flex flex-col gap-6">
      
      <!-- Chart Container -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span>📊</span> คะแนนเฉลี่ยแยกรายข้อ (1-5 สเกล)
          </h2>
          <span class="text-xs text-slate-400">เต็ม 5.00 คะแนน</span>
        </div>
        <div class="relative flex-1 min-h-[300px]">
          <canvas id="barChart"></canvas>
        </div>
      </div>

      <!-- Likert 5-level Criteria Reference Box -->
      <div class="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5">
        <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          เกณฑ์การแปลผลคะแนนเฉลี่ย 5 ระดับ (Likert Scale)
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div class="bg-slate-800/60 p-2.5 rounded-lg border border-emerald-500/30">
            <div class="font-bold text-emerald-400">4.51 - 5.00</div>
            <div class="text-slate-300 font-medium mt-0.5">มากที่สุด</div>
          </div>
          <div class="bg-slate-800/60 p-2.5 rounded-lg border border-cyan-500/30">
            <div class="font-bold text-cyan-400">3.51 - 4.50</div>
            <div class="text-slate-300 font-medium mt-0.5">มาก</div>
          </div>
          <div class="bg-slate-800/60 p-2.5 rounded-lg border border-amber-500/30">
            <div class="font-bold text-amber-400">2.51 - 3.50</div>
            <div class="text-slate-300 font-medium mt-0.5">ปานกลาง</div>
          </div>
          <div class="bg-slate-800/60 p-2.5 rounded-lg border border-orange-500/30">
            <div class="font-bold text-orange-400">1.51 - 2.50</div>
            <div class="text-slate-300 font-medium mt-0.5">น้อย</div>
          </div>
          <div class="bg-slate-800/60 p-2.5 rounded-lg border border-rose-500/30">
            <div class="font-bold text-rose-400">1.00 - 1.50</div>
            <div class="text-slate-300 font-medium mt-0.5">น้อยที่สุด</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Right: QR Code & Comments (5 Columns) -->
    <div class="lg:col-span-5 flex flex-col gap-6">

      <!-- QR Code Banner for Projector -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex items-center gap-5">
        <div id="qrcode" class="bg-white p-2.5 rounded-xl shadow shrink-0"></div>
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
            สแกนเพื่อร่วมตอบ
          </span>
          <h3 class="text-base font-bold text-white">ประเมินผ่านมือถือ</h3>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            ผู้เข้าอบรมสแกน QR Code นี้ เพื่อทำแบบประเมินได้ทันทีโดยไม่ต้องเข้าสู่ระบบ
          </p>
        </div>
      </div>

      <!-- Real-time Live Comments Feed -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span>💬</span> ข้อเสนอแนะล่าสุด
          </h2>
          <span class="text-xs text-emerald-400 font-medium">Real-time Stream</span>
        </div>
        <div id="commentsList" class="flex-1 overflow-y-auto max-h-[360px] space-y-3 pr-1">
          <div class="text-slate-500 text-center py-10 text-sm">ยังไม่มีข้อเสนอแนะในขณะนี้</div>
        </div>
      </div>

    </div>

  </div>

  <script>
    // 1. Firebase Configuration
    const firebaseConfig = {
      apiKey: "${config.apiKey}",
      authDomain: "${config.authDomain}",
      databaseURL: "${config.databaseURL}",
      projectId: "${config.projectId}",
      storageBucket: "${config.storageBucket}",
      messagingSenderId: "${config.messagingSenderId}",
      appId: "${config.appId}"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.database();

    // 2. Generate QR Code for Mobile Survey (survey.html in the same directory)
    const surveyUrl = window.location.href.replace(/dashboard\\.html.*/, 'survey.html');
    new QRCode(document.getElementById("qrcode"), {
      text: surveyUrl,
      width: 110,
      height: 110,
      colorDark : "#0f172a",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });

    // 3. Initialize Chart.js
    const ctx = document.getElementById('barChart').getContext('2d');
    const barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          '1. เนื้อหาหลักสูตร',
          '2. การสอนวิทยากร',
          '3. กิจกรรมและเวลา',
          '4. อุปกรณ์สถานที่',
          '5. การนำไปใช้จริง'
        ],
        datasets: [{
          label: 'คะแนนเฉลี่ย (เต็ม 5)',
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(6, 182, 212, 0.85)',
            'rgba(59, 130, 246, 0.85)',
            'rgba(168, 85, 247, 0.85)',
            'rgba(236, 72, 153, 0.85)'
          ],
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 0,
            max: 5,
            ticks: { color: '#94a3b8', font: { family: 'Prompt', size: 12 } },
            grid: { color: 'rgba(51, 65, 85, 0.4)' }
          },
          x: {
            ticks: { color: '#cbd5e1', font: { family: 'Prompt', size: 12 } },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'คะแนนเฉลี่ย: ' + context.parsed.y.toFixed(2) + ' / 5.00';
              }
            }
          }
        }
      }
    });

    // Helper: 5-level Likert Interpretation
    function getInterpretation(score) {
      if (score >= 4.51) return { label: 'มากที่สุด (ดีเยี่ยม)', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      if (score >= 3.51) return { label: 'มาก (ดี)', class: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      if (score >= 2.51) return { label: 'ปานกลาง', class: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      if (score >= 1.51) return { label: 'น้อย', class: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
      return { label: 'น้อยที่สุด', class: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    }

    let allFeedbackData = [];

    // 4. Real-time Firebase Listener
    db.ref('feedbacks').on('value', function(snapshot) {
      const val = snapshot.val();
      allFeedbackData = [];
      if (val) {
        Object.keys(val).forEach(key => {
          allFeedbackData.push({ id: key, ...val[key] });
        });
      }

      // Sort newest first
      allFeedbackData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      const count = allFeedbackData.length;
      document.getElementById('totalCount').innerText = count;

      if (count === 0) {
        document.getElementById('overallAvg').innerText = '0.00';
        document.getElementById('satisfactionPercent').innerText = '0%';
        barChart.data.datasets[0].data = [0, 0, 0, 0, 0];
        barChart.update();
        document.getElementById('commentsList').innerHTML = '<div class="text-slate-500 text-center py-10 text-sm">ยังไม่มีข้อเสนอแนะในขณะนี้</div>';
        return;
      }

      // Compute Averages
      let sumQ1 = 0, sumQ2 = 0, sumQ3 = 0, sumQ4 = 0, sumQ5 = 0;
      let validComments = [];

      allFeedbackData.forEach(item => {
        sumQ1 += Number(item.q1 || 0);
        sumQ2 += Number(item.q2 || 0);
        sumQ3 += Number(item.q3 || 0);
        sumQ4 += Number(item.q4 || 0);
        sumQ5 += Number(item.q5 || 0);
        if (item.comment && item.comment.trim()) {
          validComments.push(item);
        }
      });

      const avg1 = Number((sumQ1 / count).toFixed(2));
      const avg2 = Number((sumQ2 / count).toFixed(2));
      const avg3 = Number((sumQ3 / count).toFixed(2));
      const avg4 = Number((sumQ4 / count).toFixed(2));
      const avg5 = Number((sumQ5 / count).toFixed(2));
      const overall = Number(((avg1 + avg2 + avg3 + avg4 + avg5) / 5).toFixed(2));

      // Update UI Metrics
      document.getElementById('overallAvg').innerText = overall.toFixed(2);
      document.getElementById('satisfactionPercent').innerText = ((overall / 5) * 100).toFixed(0) + '%';
      document.getElementById('totalComments').innerText = validComments.length;

      // Update Likert Badge
      const interp = getInterpretation(overall);
      const badge = document.getElementById('overallBadge');
      badge.innerText = 'ระดับ: ' + interp.label;
      badge.className = 'inline-block px-3 py-1 rounded-md text-xs font-semibold border ' + interp.class;

      // Update Chart
      barChart.data.datasets[0].data = [avg1, avg2, avg3, avg4, avg5];
      barChart.update();

      // Update Comments Feed
      const listEl = document.getElementById('commentsList');
      if (validComments.length === 0) {
        listEl.innerHTML = '<div class="text-slate-500 text-center py-10 text-sm">ไม่มีข้อเสนอแนะเพิ่มเติม</div>';
      } else {
        listEl.innerHTML = validComments.slice(0, 15).map(item => {
          const time = new Date(item.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
          return \`
            <div class="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/60 shadow-sm transition hover:border-slate-600">
              <div class="flex items-center justify-between text-xs mb-1.5">
                <span class="text-emerald-400 font-semibold">คะแนนเฉลี่ย: \${Number(item.average).toFixed(2)}/5</span>
                <span class="text-slate-400">\${time} น.</span>
              </div>
              <p class="text-sm text-slate-200 leading-relaxed">\${item.comment}</p>
            </div>
          \`;
        }).join('');
      }
    });

    // 5. Download CSV
    function downloadCSV() {
      if (!allFeedbackData || allFeedbackData.length === 0) {
        alert('ยังไม่มีข้อมูลการประเมินให้ดาวน์โหลด');
        return;
      }

      const headers = ['ลำดับ', 'วันเวลา', 'ข้อ1_เนื้อหา', 'ข้อ2_วิทยากร', 'ข้อ3_เวลา', 'ข้อ4_สถานที่', 'ข้อ5_การใช้จริง', 'ค่าเฉลี่ย', 'ข้อเสนอแนะ'];
      const rows = allFeedbackData.map((d, idx) => [
        idx + 1,
        new Date(d.createdAt).toLocaleString('th-TH'),
        d.q1,
        d.q2,
        d.q3,
        d.q4,
        d.q5,
        Number(d.average).toFixed(2),
        '"' + (d.comment || '').replace(/"/g, '""') + '"'
      ]);

      const csvContent = '\\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\\r\\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ผลการประเมินการอบรม_' + new Date().toISOString().slice(0,10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // 6. Fullscreen Mode
    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  </script>
</body>
</html>`;
}
