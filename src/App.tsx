/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FeedbackItem } from './types';
import { SurveyView } from './components/SurveyView';
import { ProjectorDashboard } from './components/ProjectorDashboard';
import { FirebaseStandaloneGuide } from './components/FirebaseStandaloneGuide';
import {
  MonitorPlay,
  Smartphone,
  FileCode2,
  Share2,
  ExternalLink,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'survey' | 'firebase'>('dashboard');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [surveyUrl, setSurveyUrl] = useState<string>('');

  // Determine current origin and compute direct survey URL for QR Code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const directSurvey = `${origin}/?view=survey`;
      setSurveyUrl(directSurvey);

      // Check URL query parameters for view override
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('mode');
      if (viewParam === 'survey') {
        setActiveView('survey');
      } else if (viewParam === 'firebase' || viewParam === 'guide') {
        setActiveView('firebase');
      }
    }
  }, []);

  // Fetch feedbacks from backend
  const fetchFeedbacks = useCallback(async () => {
    try {
      const res = await fetch('/api/feedbacks');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setFeedbacks(json.data);
          setIsConnected(true);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch initial feedbacks:', e);
      setIsConnected(false);
    }
  }, []);

  // Connect to Server-Sent Events (SSE) for instant live push
  useEffect(() => {
    fetchFeedbacks();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/stream');

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data: FeedbackItem[] = JSON.parse(event.data);
          setFeedbacks(data);
          setIsConnected(true);
        } catch (err) {
          console.error('Error parsing SSE payload:', err);
        }
      };

      eventSource.onerror = () => {
        setIsConnected(false);
        // Fallback polling will handle it if SSE drops
      };
    } catch (e) {
      console.warn('SSE not supported or failed to connect:', e);
      setIsConnected(false);
    }

    // Safety fallback interval every 5 seconds to ensure sync across networks
    const interval = setInterval(() => {
      fetchFeedbacks();
    }, 5000);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(interval);
    };
  }, [fetchFeedbacks]);

  // Seed sample mock data
  const handleSeedDemo = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        fetchFeedbacks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset all feedbacks
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        setFeedbacks([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Successful submission callback from local survey
  const handleSurveySuccess = (newItem: FeedbackItem) => {
    setFeedbacks(prev => [newItem, ...prev.filter(f => f.id !== newItem.id)]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Prompt',sans-serif] selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Application Mode Switcher Navigation */}
      <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo / App Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-base shadow-md shadow-emerald-500/20">
              TF
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-wide">
                Live Feedback
              </span>
              <span className="text-[11px] text-emerald-400 font-medium ml-1.5 hidden sm:inline">
                ระบบประเมินความพึงพอใจการอบรม
              </span>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'dashboard'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>จอโปรเจกเตอร์</span>
            </button>

            <button
              onClick={() => setActiveView('survey')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'survey'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>หน้าแบบสอบถาม (มือถือ)</span>
            </button>

            <button
              onClick={() => setActiveView('firebase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'firebase'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">โค้ด 2 ไฟล์ & </span>
              <span>วิธีตั้งค่า Firebase</span>
            </button>
          </div>

          {/* Connection status indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            {isConnected ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Wifi className="w-3 h-3" />
                <span>ซิงค์สดเรียลไทม์</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <WifiOff className="w-3 h-3" />
                <span>กำลังเชื่อมต่อ...</span>
              </span>
            )}

            <a
              href={surveyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition"
              title="เปิดหน้าตอบแบบประเมินในแท็บใหม่เพื่อทดสอบตอบ"
            >
              <Share2 className="w-3 h-3" />
              <span>เปิดแท็บตอบ</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

        </div>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {activeView === 'dashboard' && (
          <ProjectorDashboard
            feedbacks={feedbacks}
            onRefresh={fetchFeedbacks}
            onSeedDemo={handleSeedDemo}
            onReset={handleResetData}
            onOpenSurvey={() => setActiveView('survey')}
            surveyUrl={surveyUrl}
          />
        )}

        {activeView === 'survey' && (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
            <SurveyView
              onSuccessSubmit={handleSurveySuccess}
              onSwitchToDashboard={() => setActiveView('dashboard')}
            />
          </div>
        )}

        {activeView === 'firebase' && (
          <FirebaseStandaloneGuide />
        )}
      </main>

    </div>
  );
}
