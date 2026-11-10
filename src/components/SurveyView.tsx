import React, { useState, useEffect } from 'react';
import { QUESTIONS, LIKERT_OPTIONS, getLikertInterpretation, FeedbackItem } from '../types';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, Sparkles, AlertCircle, RotateCcw, ThumbsUp, ShieldCheck } from 'lucide-react';

interface SurveyViewProps {
  onSuccessSubmit?: (newItem: FeedbackItem) => void;
  onSwitchToDashboard?: () => void;
}

export const SurveyView: React.FC<SurveyViewProps> = ({ onSuccessSubmit, onSwitchToDashboard }) => {
  const [ratings, setRatings] = useState<{ [qId: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedFeedback, setSubmittedFeedback] = useState<FeedbackItem | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Storage key for device-level duplicate prevention
  const STORAGE_KEY = 'training_feedback_submitted_device';

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSubmittedFeedback(parsed);
        setAlreadySubmitted(true);
      } catch {
        setAlreadySubmitted(true);
      }
    }
  }, []);

  const handleSelectRating = (questionId: number, value: number) => {
    setRatings(prev => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  const handleResetForTesting = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAlreadySubmitted(false);
    setSubmittedFeedback(null);
    setRatings({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    setComment('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation: All 5 questions must be answered
    const unanswered = QUESTIONS.filter(q => !ratings[q.id] || ratings[q.id] < 1);
    if (unanswered.length > 0) {
      setError(`กรุณาตอบแบบประเมินให้ครบทุกข้อ (ยังขาดข้อ: ${unanswered.map(u => u.id).join(', ')})`);
      // Scroll to the first unanswered question
      const el = document.getElementById(`question-card-${unanswered[0].id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Get or create unique device token
      let deviceToken = localStorage.getItem('device_survey_token');
      if (!deviceToken) {
        deviceToken = 'dev-' + Math.random().toString(36).substring(2) + '-' + Date.now();
        localStorage.setItem('device_survey_token', deviceToken);
      }

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q1: ratings[1],
          q2: ratings[2],
          q3: ratings[3],
          q4: ratings[4],
          q5: ratings[5],
          comment: comment.trim(),
          deviceToken
        })
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setAlreadySubmitted(true);
          setError(json.error || 'เครื่องนี้ได้ส่งแบบประเมินแล้ว');
          return;
        }
        throw new Error(json.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      const feedbackData: FeedbackItem = json.data;

      // Save locally to prevent duplicate re-answering
      localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbackData));
      setSubmittedFeedback(feedbackData);
      setAlreadySubmitted(true);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }

      if (onSuccessSubmit) {
        onSuccessSubmit(feedbackData);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already submitted on this device
  if (alreadySubmitted) {
    const avgScore = submittedFeedback?.average || 
      Number(((ratings[1] + ratings[2] + ratings[3] + ratings[4] + ratings[5]) / 5 || 5).toFixed(2));
    const interp = getLikertInterpretation(avgScore);

    return (
      <div className="w-full max-w-lg mx-auto py-8 px-4 animate-fadeIn">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            ส่งแบบประเมินเรียบร้อยแล้ว
          </span>

          <h2 className="text-2xl font-bold text-white mb-2">ขอบคุณสำหรับข้อเสนอแนะ!</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            ข้อมูลการประเมินของท่านถูกส่งต่อไปประมวลผลบนหน้าจอวิทยากรแบบเรียลไทม์แล้ว เพื่อพัฒนาการจัดอบรมในครั้งถัดไปให้ดียิ่งขึ้น
          </p>

          {/* Feedback Summary Card */}
          <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-700/60 mb-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs text-slate-400">คะแนนเฉลี่ยที่คุณให้:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold text-emerald-400">{avgScore.toFixed(2)}</span>
                <span className="text-xs text-slate-400">/ 5.00</span>
              </div>
            </div>

            <div className="inline-block w-full py-1.5 px-3 rounded-lg text-center text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200">
              ความพึงพอใจ: <span className={interp.textColor}>{interp.label}</span>
            </div>

            {submittedFeedback?.comment && (
              <div className="mt-3 text-xs bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/40 text-slate-300 italic">
                "{submittedFeedback.comment}"
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {onSwitchToDashboard && (
              <button
                type="button"
                onClick={onSwitchToDashboard}
                className="w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition flex items-center justify-center gap-2 shadow"
              >
                <span>ดูผลสรุปบนหน้าจอ Dashboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetForTesting}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 py-2 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>(สำหรับผู้ทดสอบ) รีเซ็ตสถานะเพื่อส่งแบบประเมินอีกครั้ง</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate filled count
  const filledCount = Object.values(ratings).filter(v => v > 0).length;

  return (
    <div className="w-full max-w-lg mx-auto py-4 px-3 sm:px-4">
      {/* Mobile-first Header Banner */}
      <header className="bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 mb-5 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">แบบประเมินความพึงพอใจ</h1>
            <p className="text-xs text-emerald-400 font-medium">การฝึกอบรมและสัมมนาเชิงปฏิบัติการ</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mt-2">
          โปรดสละเวลาตอบแบบสอบถามเพื่อนำผลไปปรับปรุงและพัฒนาการจัดอบรมในโอกาสต่อไป (ใช้เวลาประมาณ 1 นาที)
        </p>

        <div className="mt-3.5 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700/60">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ไม่ต้องล็อกอิน • ไม่ระบุตัวตน 100%
          </span>
          <span className="font-semibold text-emerald-400">
            ตอบแล้ว {filledCount}/5 ข้อ
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(filledCount / 5) * 100}%` }}
          />
        </div>
      </header>

      {/* Error alert if any */}
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {QUESTIONS.map((q) => {
          const selectedVal = ratings[q.id];
          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className={`bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
                selectedVal > 0 
                  ? 'border-emerald-500/50 shadow-md shadow-emerald-500/5' 
                  : 'border-slate-700/70 hover:border-slate-600'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700 text-slate-300">
                      ข้อ {q.id}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      หมวด: {q.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm sm:text-base leading-snug">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {q.description}
                  </p>
                </div>
              </div>

              {/* 5-scale touch buttons */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-3.5">
                {LIKERT_OPTIONS.map((opt) => {
                  const isChecked = selectedVal === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectRating(q.id, opt.value)}
                      className={`relative flex flex-col items-center justify-center py-3 px-1 rounded-xl border text-center transition-all duration-150 active:scale-95 touch-manipulation ${
                        isChecked
                          ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/40'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow select-none mb-1">
                        {opt.emoji}
                      </span>
                      <span className={`text-xs font-bold ${isChecked ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {opt.value}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate w-full px-0.5 leading-tight">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend guide */}
              <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
                <span>1 = น้อยที่สุด</span>
                <span>5 = มากที่สุด</span>
              </div>
            </div>
          );
        })}

        {/* Suggestion Textarea */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-700/70">
          <label htmlFor="survey-comment" className="block font-semibold text-slate-200 text-sm mb-1.5">
            ข้อเสนอแนะเพิ่มเติมเพื่อการปรับปรุง <span className="text-slate-400 text-xs font-normal">(ไม่บังคับ)</span>
          </label>
          <textarea
            id="survey-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="สิ่งที่ประทับใจ หรือสิ่งที่ต้องการให้เพิ่มเติมในการจัดอบรมครั้งต่อไป..."
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 rounded-xl p-3.5 text-sm border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 sticky bottom-4 z-20">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-base shadow-xl flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] ${
              filledCount === 5
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30'
                : 'bg-slate-700 text-slate-300 cursor-pointer opacity-90'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>กำลังส่งผลประเมิน...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>ส่งแบบประเมินความพึงพอใจ ({filledCount}/5)</span>
              </>
            )}
          </button>
        </div>
      </form>

      <footer className="mt-8 mb-4 text-center text-xs text-slate-400">
        ระบบบันทึกความพึงพอใจ • ส่งตรงขึ้นหน้าจอ Dashboard ทันที
      </footer>
    </div>
  );
};
