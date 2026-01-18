import React, { useState } from 'react';
import { Quest, AchievementDef } from '../types';
import { ACHIEVEMENT_DEFS } from '../constants';

interface GoalsProps {
  quests: Quest[];
  unlockedAchievements: string[];
  onClaimQuest: (questId: string) => void;
}

export const Goals: React.FC<GoalsProps> = ({ quests, unlockedAchievements, onClaimQuest }) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'achievements'>('quests');

  return (
    <div className="flex flex-col h-full bg-emerald-950/70 backdrop-blur-sm text-lime-500">
      {/* Tab Switcher */}
      <div className="flex border-b border-lime-600/30 bg-emerald-950/40">
        <button
          onClick={() => setActiveTab('quests')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors
            ${activeTab === 'quests' ? 'bg-lime-500/10 text-lime-400 border-b-2 border-lime-500' : 'text-emerald-500'}`}
        >
          Daily Quests
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors
            ${activeTab === 'achievements' ? 'bg-lime-500/10 text-lime-400 border-b-2 border-lime-500' : 'text-emerald-500'}`}
        >
          Achievements
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'quests' && (
          <div className="space-y-4">
            <div className="text-xs text-emerald-500 uppercase tracking-widest text-center mb-2">
              Resets Daily
            </div>
            {quests.length === 0 && <div className="text-center text-emerald-500">No quests available today.</div>}
            {quests.map(quest => {
              const progress = Math.min(quest.current / quest.target, 1);
              const isCompleted = quest.current >= quest.target;
              
              return (
                <div key={quest.id} className="bg-emerald-900/80 border border-emerald-800 rounded-lg p-4 shadow-lg backdrop-blur-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-sm">{quest.description}</h3>
                    <span className="text-lime-400 font-mono text-xs">+{quest.reward} ₳</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-emerald-950/50 rounded-full overflow-hidden mb-3 border border-white/5">
                    <div 
                      className="h-full bg-gradient-to-r from-lime-600 to-lime-400 transition-all duration-500"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-500 font-mono">
                      {Math.min(quest.current, quest.target).toFixed(0)} / {quest.target}
                    </span>
                    
                    <button
                      onClick={() => onClaimQuest(quest.id)}
                      disabled={!isCompleted || quest.isClaimed}
                      className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all
                        ${quest.isClaimed 
                          ? 'bg-transparent text-emerald-500 border border-emerald-500/30 cursor-default'
                          : isCompleted
                            ? 'bg-lime-500 text-black hover:bg-lime-400 animate-pulse'
                            : 'bg-emerald-800 text-emerald-600 cursor-not-allowed'
                        }`}
                    >
                      {quest.isClaimed ? 'Claimed' : 'Claim'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 gap-3">
            {ACHIEVEMENT_DEFS.map((achievement) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              
              return (
                <div 
                  key={achievement.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 backdrop-blur-md
                    ${isUnlocked 
                      ? 'bg-lime-900/20 border-lime-600/50 shadow-[0_0_15px_rgba(132,204,22,0.1)]' 
                      : 'bg-emerald-900/60 border-emerald-800 opacity-60 grayscale'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border
                    ${isUnlocked ? 'bg-emerald-950 border-lime-500' : 'bg-emerald-950/50 border-emerald-700'}`}>
                    {achievement.icon}
                  </div>
                  
                  <div>
                    <h4 className={`font-bold text-sm ${isUnlocked ? 'text-lime-400' : 'text-emerald-400'}`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-emerald-500">{achievement.description}</p>
                  </div>
                  
                  {isUnlocked && (
                    <div className="ml-auto text-lime-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};