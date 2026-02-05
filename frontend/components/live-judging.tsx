'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trophy, CheckCircle2, Award } from 'lucide-react';

interface LiveJudgingProps {
  challengeId: string;
  challengeTitle: string;
  isAdmin?: boolean;
  onComplete?: () => void;
}

interface JudgingResult {
  analysis: string;
  winner: string;
  winner_solution: string;
  rep_awarded: number;
}

export function LiveJudging({ challengeId, challengeTitle, isAdmin = false, onComplete }: LiveJudgingProps) {
  const [analysis, setAnalysis] = useState<string[]>([]);
  const [isJudging, setIsJudging] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<JudgingResult | null>(null);

  const startJudging = async () => {
    setIsJudging(true);
    setAnalysis([]);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const adminKey = prompt('Enter admin key to start judging:');
      if (!adminKey) {
        setIsJudging(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/v1/events/${challengeId}/start-judging?admin_key=${adminKey}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to start judging');
      }

      const judgeResult = await response.json();
      
      // Simulate streaming by adding lines with delay
      const lines = judgeResult.analysis.split('\n');
      for (let i = 0; i < lines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setAnalysis(prev => [...prev, lines[i]]);
      }

      // Store full result
      setResult({
        analysis: judgeResult.analysis,
        winner: judgeResult.winner,
        winner_solution: judgeResult.winner_solution || 'Solution displayed in submissions below',
        rep_awarded: judgeResult.rep_awarded
      });
      
      setIsComplete(true);
      
      if (onComplete) {
        // Don't reload - just notify parent
        setTimeout(() => onComplete(), 1000);
      }

    } catch (error: any) {
      console.error('Judging error:', error);
      alert(`Judging failed: ${error.message}`);
    } finally {
      setIsJudging(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-800 rounded-lg p-8 card-glow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#ff6b35] animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold">AI Judge Arena</h2>
            <p className="text-gray-400 text-sm">{challengeTitle}</p>
          </div>
        </div>
        
        {isAdmin && !isJudging && !isComplete && (
          <button
            onClick={startJudging}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Start Judging
          </button>
        )}

        {isComplete && (
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Judging Complete</span>
          </div>
        )}
      </div>

      {/* Live Status */}
      {isJudging && (
        <div className="flex items-center gap-2 mb-4 text-red-500 animate-pulse">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <span className="font-semibold">🔴 LIVE JUDGING IN PROGRESS</span>
        </div>
      )}

      {/* Analysis Display */}
      {analysis.length > 0 && (
        <div className="bg-black/30 rounded-lg p-6 font-mono text-sm overflow-auto max-h-[600px] mb-6">
          {analysis.map((line, idx) => (
            <div
              key={idx}
              className={`mb-1 ${
                line.includes('🏆') ? 'text-[#ff6b35] font-bold text-lg' :
                line.includes('✓') ? 'text-green-400' :
                line.includes('⚠') ? 'text-yellow-400' :
                line.includes('💡') ? 'text-cyan-400' :
                line.startsWith('━') ? 'text-gray-600' :
                'text-gray-300'
              }`}
              style={{
                animation: `fadeIn 0.3s ease-in ${idx * 0.05}s both`
              }}
            >
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      )}

      {/* Winner Card - Permanent */}
      {isComplete && result && (
        <div className="bg-gradient-to-br from-[#ff6b35]/20 via-yellow-500/10 to-orange-500/20 border-2 border-[#ff6b35] rounded-xl p-8 shadow-2xl">
          {/* Trophy Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Trophy className="w-20 h-20 text-[#ff6b35] drop-shadow-[0_0_15px_rgba(255,107,53,0.6)]" />
              <div className="absolute inset-0 animate-ping">
                <Trophy className="w-20 h-20 text-[#ff6b35] opacity-20" />
              </div>
            </div>
          </div>

          {/* Winner Name */}
          <div className="text-center mb-6">
            <h3 className="text-4xl font-bold mb-2 gradient-text">
              🏆 Winner: {result.winner}
            </h3>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Award className="w-5 h-5 text-[#ff6b35]" />
              <span className="text-[#ff6b35] font-semibold">
                +{result.rep_awarded} REP Awarded
              </span>
            </div>
          </div>

          {/* Winning Solution Preview */}
          <div className="bg-black/40 rounded-lg p-6 border border-[#ff6b35]/30 mb-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
              Winning Solution
            </h4>
            <p className="text-gray-300 text-sm line-clamp-4">
              {result.winner_solution}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              View full submission in the list below ↓
            </p>
          </div>

          {/* Judge's Reasoning Summary */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Selected by AI Judge based on challenge criteria
            </p>
          </div>
        </div>
      )}

      {/* Info Box for non-admins or before judging */}
      {!isJudging && !isComplete && !isAdmin && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400 mb-2">
            <strong className="text-white">How AI Judging Works:</strong>
          </p>
          <ul className="text-sm text-gray-400 space-y-1 ml-4">
            <li>• AI judge analyzes each submission individually</li>
            <li>• Scores based on challenge criteria</li>
            <li>• Provides reasoning for decision</li>
            <li>• Selects winner and awards REP</li>
            <li>• Process is transparent and viewable in real-time</li>
          </ul>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
