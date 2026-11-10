import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FeedbackItem, QUESTIONS, getLikertInterpretation } from '../types';
import { exportFeedbacksToCSV } from '../utils/csvExport';
import QRCode from 'qrcode';
import {
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  QrCode,
  Users,
  Award,
  Sparkles,
  BarChart3,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Percent,
  Layers
} from 'lucide-react';

interface ProjectorDashboardProps {
  feedbacks: FeedbackItem[];
  onRefresh: () => void;
  onSeedDemo: () => void;
  onReset: () => void;
  onOpenSurvey: () => void;
  surveyUrl: string;
}

export const ProjectorDashboard: React.FC<ProjectorDashboardProps> = ({
  feedbacks,
  onRefresh,
  onSeedDemo,
  onReset,
  onOpenSurvey,
  surveyUrl,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showLargeQR, setShowLargeQR] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const prevCountRef = useRef(feedbacks.length);

  // Generate QR Code data URL
  useEffect(() => {
    if (surveyUrl) {
      QRCode.toDataURL(surveyUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [surveyUrl]);

  // Audio Chime using Web Audio API (No external assets required)
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Note 1: High tone
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: Higher pleasant chime
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12); // A5
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  // Trigger chime when response count increases
  useEffect(() => {
    if (soundEnabled && feedbacks.length > prevCountRef.current) {
      playChime();
    }
    prevCountRef.current = feedbacks.length;
  }, [feedbacks.length, soundEnabled]);

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Copy survey link
  const copySurveyUrl = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Calculated Metrics
  const stats = useMemo(() => {
    const count = feedbacks.length;
    if (count === 0) {
      return {
        count: 0,
        overallAvg: 0,
        positivePct: 0,
        qAverages: [0, 0, 0, 0, 0],
        comments: [],
        bestQ: null,
        needsImproveQ: null
      };
    }

    const qSums = [0, 0, 0, 0, 0];
    let positiveCount = 0;
    const commentsList: { text: string; date: string; avg: number }[] = [];

    feedbacks.forEach(f => {
      qSums[0] += f.q1;
      qSums[1] += f.q2;
      qSums[2] += f.q3;
      qSums[3] += f.q4;
      qSums[4] += f.q5;

      if (f.average >= 4.0) {
        positiveCount++;
      }

      if (f.comment && f.comment.trim()) {
        commentsList.push({
          text: f.comment.trim(),
          date: f.createdAt,
          avg: f.average
        });
      }
    });

    const qAvgs = qSums.map(sum => Number((sum / count).toFixed(2)));
    const overall = Number((qAvgs.reduce((a, b) => a + b, 0) / 5).toFixed(2));
    const positiveRate = Number(((positiveCount / count) * 100).toFixed(0));

    // Find best and lowest
    let maxIdx = 0;
    let minIdx = 0;
    for (let i = 1; i < 5; i++) {
      if (qAvgs[i] > qAvgs[maxIdx]) maxIdx = i;
      if (qAvgs[i] < qAvgs[minIdx]) minIdx = i;
    }

    return {
      count,
      overallAvg: overall,
      positivePct: positiveRate,
      qAverages: qAvgs,
      comments: commentsList,
      bestQ: { index: maxIdx, q: QUESTIONS[maxIdx], score: qAvgs[maxIdx] },
      needsImproveQ: { index: minIdx, q: QUESTIONS[minIdx], score: qAvgs[minIdx] }
    };
  }, [feedbacks]);

  const interpretation = getLikertInterpretation(stats.overallAvg);

  return (
    <div className="w-full flex-1 flex flex-col p-4 sm:p-6 lg:p-8 bg-slate-950 text-slate-100 max-w-[1600px] mx-auto">
      
      {/* Top Projector Header Bar */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 shrink-0">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Live Training Satisfaction Dashboard
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                เรียลไทม์สด (LIVE)
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              ผลการประเมินความพึงพอใจการอบรม • อัปเดตทันทีเมื่อมีผู้ส่งข้อมูลผ่านมือถือ
            </p>
          </div>
        </div>

        {/* Projector Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Large QR Modal Trigger */}
          <button
            onClick={() => setShowLargeQR(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 shadow-md transition active:scale-95"
            title="เปิด QR Code ขนาดใหญ่เต็มจอให้ผู้เข้าอบรมสแกน"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>QR Code สแกนตอบ</span>
          </button>

          {/* Sound Notification Toggle */}
          <button
            onClick={() => {
              if (!soundEnabled) playChime();
              setSoundEnabled(!soundEnabled);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition active:scale-95 ${
              soundEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="เปิด/ปิด เสียงเตือนเมื่อมีคนตอบแบบสอบถาม"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'เสียงเตือน: เปิด' : 'เสียงเตือน: ปิด'}</span>
          </button>

          {/* Download CSV */}
          <button
            onClick={() => exportFeedbacksToCSV(feedbacks)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 shadow-md transition active:scale-95"
            title="ส่งออกผลคะแนนทั้งหมดเป็นไฟล์ Excel CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>ดาวน์โหลด CSV</span>
          </button>

          {/* Seed Demo Button */}
          <button
            onClick={onSeedDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-700/80 transition"
            title="จำลองคำตอบ +5 คน สำหรับทดสอบการแสดงผล"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>+5 คำตอบทดสอบ</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/30 transition active:scale-95"
            title="ฉายแบบเต็มจอ (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'ย่อหน้าจอ' : 'ฉายโปรเจกเตอร์'}</span>
          </button>
        </div>
      </header>

      {/* 4 Summary Stat Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        
        {/* Total Respondents */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>ผู้ประเมินทั้งหมด</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {stats.count}
            </span>
            <span className="text-sm font-medium text-slate-400">คน</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ซิงค์อัตโนมัติจากผู้เข้าอบรม
          </div>
        </div>

        {/* Overall Average Satisfaction */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>คะแนนเฉลี่ยรวม</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400 tracking-tight">
              {stats.overallAvg.toFixed(2)}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 5.00</span>
          </div>
          <div className="mt-2">
            <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold border ${interpretation.badgeColor}`}>
              ระดับ: {interpretation.label}
            </span>
          </div>
        </div>

        {/* Positive Satisfaction Rate */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>ร้อยละความพึงพอใจดีเยี่ยม</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-cyan-400 tracking-tight">
              {stats.positivePct}%
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            ให้คะแนนระดับ 4-5 ดาว
          </div>
        </div>

        {/* Comments Count */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>ข้อเสนอแนะเพิ่มเติม</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-amber-400 tracking-tight">
              {stats.comments.length}
            </span>
            <span className="text-sm font-medium text-slate-400">ข้อความ</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            ความคิดเห็นเพื่อการพัฒนา
          </div>
        </div>

      </section>

      {/* Main Grid: Bar Chart (Left 7 Cols) + QR & Live Feed (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Column (7 cols): Average by Question Bar Chart & Criteria Guide */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Bar Chart Container */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>📊</span> คะแนนเฉลี่ยจำแนกรายข้อ (1-5 สเกล)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  วิเคราะห์ผลการประเมินแยกตามหมวดหมู่หลักสูตร วิทยากร กิจกรรม และสถานที่
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                คะแนนเต็ม 5.00
              </span>
            </div>

            {/* Custom High-Legibility Projector Bar Chart */}
            <div className="space-y-4 flex-1 flex flex-col justify-around py-2">
              {QUESTIONS.map((q, idx) => {
                const score = stats.qAverages[idx];
                const pct = (score / 5) * 100;
                const interp = getLikertInterpretation(score);

                return (
                  <div key={q.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-slate-700">
                          {q.id}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {q.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0 pl-3">
                        <span className={`text-[11px] font-semibold hidden sm:inline ${interp.textColor}`}>
                          ({interp.label})
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-white">
                          {score.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-slate-800/90 h-4 sm:h-5 rounded-xl overflow-hidden p-0.5 border border-slate-700/50 shadow-inner">
                      <div
                        className={`h-full rounded-lg transition-all duration-700 ease-out shadow flex items-center justify-end pr-2 ${
                          idx === 0 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                          idx === 1 ? 'bg-gradient-to-r from-teal-600 to-teal-400' :
                          idx === 2 ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                          idx === 3 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                          'bg-gradient-to-r from-indigo-600 to-purple-400'
                        }`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      >
                        {pct > 25 && (
                          <span className="text-[10px] font-bold text-slate-950/90 select-none">
                            {pct.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Highest & Opportunity Highlights */}
            {stats.count > 0 && stats.bestQ && (
              <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    🏆
                  </div>
                  <div>
                    <div className="font-bold text-emerald-300">จุดเด่นที่ได้คะแนนสูงสุด:</div>
                    <div className="text-slate-300 line-clamp-1">{stats.bestQ.q.shortLabel} ({stats.bestQ.score.toFixed(2)} / 5)</div>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-3 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    💡
                  </div>
                  <div>
                    <div className="font-bold text-amber-300">ประเด็นเพื่อการต่อยอด:</div>
                    <div className="text-slate-300 line-clamp-1">{stats.needsImproveQ?.q.shortLabel} ({stats.needsImproveQ?.score.toFixed(2)} / 5)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5-Level Likert Scale Scientific Reference Card */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                เกณฑ์การแปลผลคะแนนเฉลี่ย 5 ระดับ (Likert Scale Standard)
              </h3>
              <span className="text-[11px] text-slate-500">ช่วงกว้างอันตรภาคชั้น = 0.80</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-emerald-500/30">
                <div className="font-extrabold text-emerald-400 text-sm">4.51 - 5.00</div>
                <div className="text-slate-200 font-bold mt-0.5">มากที่สุด</div>
                <div className="text-[10px] text-emerald-400/80 mt-0.5">ดีเยี่ยม</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-cyan-500/30">
                <div className="font-extrabold text-cyan-400 text-sm">3.51 - 4.50</div>
                <div className="text-slate-200 font-bold mt-0.5">มาก</div>
                <div className="text-[10px] text-cyan-400/80 mt-0.5">ดี</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-amber-500/30">
                <div className="font-extrabold text-amber-400 text-sm">2.51 - 3.50</div>
                <div className="text-slate-200 font-bold mt-0.5">ปานกลาง</div>
                <div className="text-[10px] text-amber-400/80 mt-0.5">พอใช้</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-orange-500/30">
                <div className="font-extrabold text-orange-400 text-sm">1.51 - 2.50</div>
                <div className="text-slate-200 font-bold mt-0.5">น้อย</div>
                <div className="text-[10px] text-orange-400/80 mt-0.5">ควรปรับปรุง</div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-rose-500/30">
                <div className="font-extrabold text-rose-400 text-sm">1.00 - 1.50</div>
                <div className="text-slate-200 font-bold mt-0.5">น้อยที่สุด</div>
                <div className="text-[10px] text-rose-400/80 mt-0.5">ปรับปรุงเร่งด่วน</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Embedded QR Code Card + Live Feedback Feed */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Projector QR Code Display Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-5">
              {/* QR Image */}
              <div 
                onClick={() => setShowLargeQR(true)}
                className="bg-white p-2.5 rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition-transform duration-200 shrink-0 group relative"
                title="คลิกเพื่อขยาย QR Code ให้เต็มจอ"
              >
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code สแกนทำแบบประเมิน" className="w-28 h-28 object-contain" />
                ) : (
                  <div className="w-28 h-28 bg-slate-200 animate-pulse rounded-lg" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                  คลิกขยาย
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  สแกนด้วยกล้องมือถือ
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  ร่วมตอบแบบประเมิน
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  ผู้เข้าอบรมสามารถเปิดกล้องโทรศัพท์สแกน QR Code นี้เพื่อตอบได้ทันที
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={copySurveyUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}</span>
                  </button>

                  <button
                    onClick={onOpenSurvey}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-medium border border-emerald-500/40 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดแบบฟอร์ม</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Participant Comments Stream */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex-1 flex flex-col min-h-[380px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>💬</span> ข้อเสนอแนะสด (Live Stream)
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                รวม {stats.comments.length} ความคิดเห็น
              </span>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto max-h-[460px] space-y-3 pr-1.5 custom-scrollbar">
              {stats.comments.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-sm">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  ยังไม่มีข้อเสนอแนะเพิ่มเติมในขณะนี้
                </div>
              ) : (
                stats.comments.map((c, i) => {
                  const dateStr = new Date(c.date).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <div
                      key={i}
                      className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-2xl p-4 transition-all duration-200 animate-fadeIn"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          เฉลี่ย {c.avg.toFixed(2)} / 5
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {dateStr} น.
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-normal">
                        "{c.text}"
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Reset Action */}
            <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-1.5 hover:text-slate-200 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเฟรชข้อมูล</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-400 transition"
                title="ล้างข้อมูลการประเมินทั้งหมดเพื่อเริ่มการอบรมรุ่นใหม่"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ล้างข้อมูลเริ่มรุ่นใหม่</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Large Projector QR Modal */}
      {showLargeQR && (
        <div 
          onClick={() => setShowLargeQR(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-4">
              <QrCode className="w-4 h-4" />
              สแกนด้วยกล้องสมาร์ตโฟน
            </div>
            <h2 className="text-2xl font-black text-white mb-2">สแกนเพื่อร่วมประเมิน</h2>
            <p className="text-slate-400 text-xs mb-6">
              เปิดกล้องมือถือส่องมาที่ QR Code นี้ เพื่อทำแบบประเมินความพึงพอใจ
            </p>

            <div className="bg-white p-5 rounded-2xl inline-block shadow-2xl mb-6">
              {qrDataUrl && (
                <img src={qrDataUrl} alt="Large QR Code" className="w-64 h-64 mx-auto" />
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={copySurveyUrl}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
              >
                {copiedLink ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์แบบฟอร์ม'}
              </button>
              <button
                onClick={() => setShowLargeQR(false)}
                className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/40">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">ยืนยันการล้างข้อมูล?</h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              การกระทำนี้จะล้างผลการประเมินของผู้เข้าอบรมทั้งหมด ({stats.count} คน) เพื่อเตรียมพร้อมสำหรับการอบรมรอบถัดไป
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
              >
                ยืนยันล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
