import React, { useState } from 'react';
import { REFERRAL_REWARD, REFEREE_BONUS } from '../constants';
import { audioService } from '../services/audioService';

interface FriendsProps {
  referralCode: string;
  referralEarnings: number;
  referredBy: string | null;
  onRedeemReferral: (code: string) => boolean;
  onSimulateReferral: () => void;
}

export const Friends: React.FC<FriendsProps> = ({ 
  referralCode, 
  referralEarnings, 
  referredBy, 
  onRedeemReferral, 
  onSimulateReferral 
}) => {
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleRedeem = () => {
    const success = onRedeemReferral(inputCode.trim());
    if (success) {
        setRedeemStatus('success');
        setInputCode('');
    } else {
        setRedeemStatus('error');
        audioService.play('error');
    }
    setTimeout(() => setRedeemStatus('idle'), 3000);
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col items-center space-y-6 bg-emerald-950/70 backdrop-blur-sm text-lime-500">
      
      {/* Header */}
      <div className="text-center space-y-1 mt-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-lime-400 to-lime-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(132,204,22,0.3)]">
          <span className="text-3xl">🤝</span>
        </div>
        <h2 className="text-xl font-bold text-white">Invite Friends</h2>
        <p className="text-sm text-emerald-400">Build your digital tribe</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        
        {/* My Invite Code Card */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 border border-lime-600/30 rounded-xl p-6 relative overflow-hidden shadow-lg">
             <div className="absolute top-0 right-0 p-4 opacity-5 text-8xl grayscale">🐪</div>

            <div className="relative z-10 text-center space-y-4">
                <div>
                    <label className="text-[10px] text-lime-400 uppercase font-bold tracking-wider mb-2 block">Your Referral Code</label>
                    <div 
                        onClick={handleCopyReferral} 
                        className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-all active:scale-95"
                    >
                        <span className="text-2xl font-mono font-bold text-white tracking-widest">{referralCode}</span>
                        <div className="text-emerald-500 hover:text-white">
                             {copiedReferral ? (
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-lime-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                             ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm px-2">
                    <span className="text-emerald-400">Reward per friend</span>
                    <span className="text-lime-400 font-bold">+{REFERRAL_REWARD} ₳</span>
                </div>
            </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-900/50 border border-emerald-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-white">{(referralEarnings / REFERRAL_REWARD).toFixed(0)}</div>
                <div className="text-[10px] text-emerald-500 uppercase tracking-wider">Friends Invited</div>
            </div>
            <div className="bg-emerald-900/50 border border-emerald-800 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-lime-400">{referralEarnings.toFixed(0)} ₳</div>
                <div className="text-[10px] text-emerald-500 uppercase tracking-wider">Total Earned</div>
            </div>
        </div>

        {/* Enter Code Section */}
        {!referredBy ? (
            <div className="bg-emerald-900/50 border border-emerald-800 rounded-lg p-4 space-y-3">
                <label className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Received an invite?</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 bg-emerald-950/50 border border-emerald-700 rounded px-3 py-2 text-sm text-white focus:border-lime-500 focus:outline-none font-mono"
                    />
                    <button 
                        onClick={handleRedeem}
                        disabled={!inputCode.trim()}
                        className="bg-white text-emerald-950 hover:bg-lime-400 font-bold px-4 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        GO
                    </button>
                </div>
                {redeemStatus === 'success' && <p className="text-xs text-lime-500">Success! +{REFEREE_BONUS} ₳ received.</p>}
                {redeemStatus === 'error' && <p className="text-xs text-red-500">Invalid code.</p>}
            </div>
        ) : (
            <div className="bg-emerald-900/50 border border-emerald-800 rounded-lg p-3 text-center flex items-center justify-center gap-2">
                <span className="text-xs text-emerald-500">Invited by</span>
                <span className="text-sm font-mono font-bold text-lime-600">{referredBy}</span>
            </div>
        )}

        {/* Dev Tools */}
        <button 
            onClick={onSimulateReferral}
            className="w-full text-[10px] mt-8 text-emerald-600 hover:text-emerald-400 transition-colors"
        >
            (Simulation Mode) Fake Friend Join
        </button>

      </div>
      <div className="h-10"></div>
    </div>
  );
};