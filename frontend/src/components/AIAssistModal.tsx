import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../services/api';

interface AIAssistModalProps {
  currentText: string;
  onAccept: (suggestion: string) => void;
  onClose: () => void;
  mode?: 'enhance' | 'assist';
}

const AIAssistModal: React.FC<AIAssistModalProps> = ({ currentText, onAccept, onClose, mode = 'assist' }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [editedSuggestion, setEditedSuggestion] = useState('');

  React.useEffect(() => {
    if (mode === 'enhance' && currentText) {
      handleGenerateSuggestion();
    }
  }, []);

  const handleGenerateSuggestion = async (overridePrompt?: string) => {
    setLoading(true);
    try {
      const promptToSend = typeof overridePrompt === 'string' ? overridePrompt : prompt;
      const response = await aiApi.assistMessage({
        prompt: promptToSend || undefined,
        text: currentText || undefined,
      });
      setSuggestion(response.response);
      setEditedSuggestion(response.response);
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      alert('Failed to get AI suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    onAccept(editedSuggestion || suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="max-w-2xl w-[95%] bg-white p-8 rounded-2xl shadow-2xl text-left" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-gray-200">
          <h3 className="m-0 text-[#667eea] text-xl font-bold">{t('aiAssist')}</h3>
          <button className="bg-transparent border-none text-3xl text-gray-400 cursor-pointer p-0 w-10 h-10 flex items-center justify-center transition-colors hover:text-gray-800" onClick={onClose}>×</button>
        </div>

        <div className="flex flex-col gap-5">
          {mode === 'assist' && (
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">{t('enterPrompt')}</label>
              <textarea
                className="p-3 border-2 border-gray-200 rounded-lg text-base resize-y focus:outline-none focus:border-[#667eea]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('enterPrompt')}
                rows={3}
              />
            </div>
          )}

          {mode === 'assist' && (
            <button
              className="px-6 py-3 bg-[#1565c0] text-white border-none rounded-lg cursor-pointer font-bold transition-colors self-center hover:bg-[#0d47a1] disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => handleGenerateSuggestion()}
              disabled={loading}
            >
              {loading ? t('loading') : t('generateSuggestion')}
            </button>
          )}
          
          {mode === 'enhance' && loading && (
             <div className="text-center text-gray-500">{t('loading')}</div>
          )}

          {suggestion && (
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">{t('aiSuggestion')}</label>
              <textarea
                className="p-3 border-2 border-gray-200 rounded-lg text-base resize-y focus:outline-none focus:border-[#667eea]"
                value={editedSuggestion}
                onChange={(e) => setEditedSuggestion(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2.5 justify-center mt-2.5">
          {suggestion && (
            <>
              <button className="px-6 py-3 bg-[#667eea] text-white border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-[#5568d3]" onClick={handleAccept}>
                {t('acceptSuggestion')}
              </button>
            </>
          )}
          <button className="px-6 py-3 bg-gray-200 text-gray-800 border-none rounded-lg cursor-pointer font-bold transition-colors hover:bg-gray-300" onClick={onClose}>
            {t('rejectSuggestion')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistModal;
