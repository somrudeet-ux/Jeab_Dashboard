import React, { useState } from 'react';
import {
  generateSurveyHTML,
  generateDashboardHTML,
  FirebaseConfigParams,
  DEFAULT_FIREBASE_CONFIG
} from '../utils/firebaseTemplates';
import {
  Copy,
  Check,
  Download,
  FileCode,
  BookOpen,
  Database,
  Globe,
  ShieldAlert,
  ExternalLink,
  Settings,
  Sparkles
} from 'lucide-react';

export const FirebaseStandaloneGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'guide'>('guide');
  const [copiedSurvey, setCopiedSurvey] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  // User-configurable Firebase keys
  const [config, setConfig] = useState<FirebaseConfigParams>({ ...DEFAULT_FIREBASE_CONFIG });

  const surveyCode = generateSurveyHTML(config);
  const dashboardCode = generateDashboardHTML(config);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const securityRulesCode = `{
  "rules": {
    "feedbacks": {
      ".read": true,
      ".write": true,
      "$feedbackId": {
        ".validate": "newData.hasChildren(['q1', 'q2', 'q3', 'q4', 'q5', 'average', 'createdAt'])"
      }
    }
  }
}`;

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4">
      
      {/* Header */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-3">
              <Database className="w-3.5 h-3.5" />
              Firebase Realtime Database Standalone Package
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              โค้ดแยก 2 ไฟล์ & วิธีตั้งค่า Firebase
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              ชุดโค้ด HTML + JavaScript ล้วน 2 ไฟล์ (<code className="text-emerald-300">survey.html</code> และ <code className="text-emerald-300">dashboard.html</code>) 
              ทำงานผ่าน <strong>Firebase Realtime Database</strong> โดยตรง สามารถดาวน์โหลดไปเปิดหรือ Deploy บนโฮสติ้งฟรีได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadFile('survey.html', surveyCode)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold shadow transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>โหลด survey.html</span>
            </button>
            <button
              onClick={() => downloadFile('dashboard.html', dashboardCode)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
            >
              <Download className="w-4 h-4" />
              <span>โหลด dashboard.html</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-slate-700/70">
          <button
            onClick={() => setActiveTab('guide')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'guide'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900 border border-slate-700/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. ขั้นตอนติดตั้ง Firebase & Deploy</span>
          </button>

          <button
            onClick={() => setActiveTab('survey')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'survey'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900 border border-slate-700/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>2. โค้ด survey.html (หน้าตอบ)</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-900 border border-slate-700/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>3. โค้ด dashboard.html (หน้าจอโปรเจกเตอร์)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Step-by-Step Firebase Guide */}
      {activeTab === 'guide' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Step 1: Create Firebase Project */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/40">
                1
              </span>
              <h2 className="text-lg font-bold text-white">
                สร้างโปรเจกต์ใน Firebase Console (ฟรี 100%)
              </h2>
            </div>
            <div className="text-sm text-slate-300 space-y-2 pl-11">
              <p>
                1.1 ไปที่เว็บไซต์ <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-medium inline-flex items-center gap-1">console.firebase.google.com <ExternalLink className="w-3.5 h-3.5" /></a> แล้วล็อกอินด้วยบัญชี Google
              </p>
              <p>
                1.2 กดปุ่ม <strong>"Add project"</strong> (เพิ่มโปรเจกต์) ตั้งชื่อโปรเจกต์ เช่น <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-300">training-feedback-app</code>
              </p>
              <p>
                1.3 ขั้นตอน Google Analytics สามารถปิดไว้ได้ (เพื่อให้ตั้งค่าง่ายและเร็ว) แล้วกด <strong>"Create project"</strong>
              </p>
            </div>
          </div>

          {/* Step 2: Create Realtime Database */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/40">
                2
              </span>
              <h2 className="text-lg font-bold text-white">
                เปิดใช้งาน Realtime Database & ตั้ง Security Rules
              </h2>
            </div>
            <div className="text-sm text-slate-300 space-y-3 pl-11">
              <p>
                2.1 ที่เมนูด้านซ้าย เลือก <strong>Build</strong> &gt; <strong>Realtime Database</strong> จากนั้นกดปุ่ม <strong>"Create Database"</strong>
              </p>
              <p>
                2.2 เลือก Realtime Database Location แนะนำเลือก <strong className="text-emerald-400">Singapore (asia-southeast1)</strong> เพื่อความเร็วสูงสุดในไทย
              </p>
              <p>
                2.3 ในหน้า Security Rules ให้เลือก <strong>"Start in test mode"</strong> หรือเข้าไปที่แท็บ <strong>"Rules"</strong> แล้ววางกฎด้านล่างนี้เพื่อให้ผู้เข้าอบรมส่งคำตอบและแดชบอร์ดอ่านค่าได้โดยไม่ต้องล็อกอิน:
              </p>

              {/* Rules Snippet */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 relative group">
                <button
                  onClick={() => copyToClipboard(securityRulesCode, setCopiedRules)}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700 transition"
                >
                  {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRules ? 'คัดลอกแล้ว' : 'คัดลอก Rules'}</span>
                </button>
                <pre>{securityRulesCode}</pre>
              </div>
              <p className="text-xs text-slate-400">
                * หลังจากวางแล้วกด <strong>"Publish"</strong> เพื่อบันทึก Rules
              </p>
            </div>
          </div>

          {/* Step 3: Get Firebase Config */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/40">
                3
              </span>
              <h2 className="text-lg font-bold text-white">
                คัดลอก Firebase Config มาใส่ในไฟล์ทั้ง 2
              </h2>
            </div>
            <div className="text-sm text-slate-300 space-y-2 pl-11">
              <p>
                3.1 กดที่ไอคอนฟันเฟือง ⚙️ (Project settings) ข้าง Project Overview ที่มุมบนซ้าย
              </p>
              <p>
                3.2 เลื่อนลงมาที่หัวข้อ <strong>"Your apps"</strong> แล้วคลิกไอคอนเว็บ <strong>&lt;/&gt; (Web)</strong>
              </p>
              <p>
                3.3 ตั้งชื่อแอป เช่น <code className="bg-slate-900 px-2 py-0.5 rounded text-emerald-300">Feedback App</code> แล้วกด Register app
              </p>
              <p>
                3.4 คัดลอกค่า <code className="text-emerald-300 font-mono">firebaseConfig</code> ทั้งหมด มาวางแทนที่ในแท็บ <strong>"2. โค้ด survey.html"</strong> และ <strong>"3. โค้ด dashboard.html"</strong>
              </p>
            </div>
          </div>

          {/* Step 4: Deploy Options */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/40">
                4
              </span>
              <h2 className="text-lg font-bold text-white">
                วิธีนำขึ้นใช้งานจริง (Deploy ฟรี)
              </h2>
            </div>
            <div className="text-sm text-slate-300 space-y-3 pl-11">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                
                {/* Option A: GitHub Pages / Netlify / Vercel */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/70">
                  <div className="flex items-center gap-2 font-bold text-white mb-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>วิธีที่ 1: อัปโหลดขึ้น Netlify / Vercel Drop</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    สร้างโฟลเดอร์ นำไฟล์ <code className="text-emerald-300">survey.html</code> (หรือเปลี่ยนชื่อเป็น <code className="text-emerald-300">index.html</code>) และ <code className="text-emerald-300">dashboard.html</code> ใส่ลงไป แล้วลากโฟลเดอร์ไปวางที่ <strong>app.netlify.com/drop</strong> จะได้ URL เป็น HTTPS ให้แชร์และทำ QR Code ได้ฟรีตลอดชีพ
                  </p>
                </div>

                {/* Option B: Firebase Hosting */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/70">
                  <div className="flex items-center gap-2 font-bold text-white mb-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    <span>วิธีที่ 2: ใช้ Firebase Hosting</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    ติดตั้ง Firebase CLI: <code className="text-cyan-300">npm install -g firebase-tools</code> แล้วสั่ง <code className="text-cyan-300">firebase login</code> และ <code className="text-cyan-300">firebase init hosting</code> เลือกโฟลเดอร์ที่มีไฟล์ทั้งสอง แล้วพิมพ์ <code className="text-cyan-300">firebase deploy</code> จะได้โดเมน <code className="text-slate-300">.web.app</code> ทันที
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: survey.html Viewer & Config */}
      {activeTab === 'survey' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Quick Config customizer */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>ปรับแต่ง Firebase Config ของคุณ (โค้ดด้านล่างจะอัปเดตให้อัตโนมัติ):</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">API Key:</label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Project ID:</label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={e => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Database URL:</label>
                <input
                  type="text"
                  value={config.databaseURL}
                  onChange={e => setConfig({ ...config, databaseURL: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-sm text-white font-bold">survey.html</span>
                <span className="text-xs text-slate-400 hidden sm:inline">(สำหรับส่งให้ผู้เข้าอบรมเปิดบนมือถือ)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(surveyCode, setCopiedSurvey)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  {copiedSurvey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSurvey ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</span>
                </button>
                <button
                  onClick={() => downloadFile('survey.html', surveyCode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-xs font-mono text-slate-300 max-h-[500px] leading-relaxed">
              {surveyCode}
            </pre>
          </div>

        </div>
      )}

      {/* Tab 3: dashboard.html Viewer & Config */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Quick Config customizer */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" />
              <span>ปรับแต่ง Firebase Config สำหรับหน้า Dashboard:</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">API Key:</label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Project ID:</label>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={e => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Database URL:</label>
                <input
                  type="text"
                  value={config.databaseURL}
                  onChange={e => setConfig({ ...config, databaseURL: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-sm text-white font-bold">dashboard.html</span>
                <span className="text-xs text-slate-400 hidden sm:inline">(สำหรับวิทยากร/ผู้จัด ฉายขึ้นจอโปรเจกเตอร์)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(dashboardCode, setCopiedDashboard)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  {copiedDashboard ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDashboard ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}</span>
                </button>
                <button
                  onClick={() => downloadFile('dashboard.html', dashboardCode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดไฟล์</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-xs font-mono text-slate-300 max-h-[500px] leading-relaxed">
              {dashboardCode}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
};
