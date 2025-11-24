import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../services/api';
import '../styles/AIAssistModal.css';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal ai-assist-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{mode === 'enhance' ? t('aiAssist') : t('aiAssist')}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {mode === 'assist' && (
            <div className="input-section">
              <label>{t('enterPrompt')}</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('enterPrompt')}
                rows={3}
              />
            </div>
          )}

          {mode === 'assist' && (
            <button
              className="generate-button"
              onClick={() => handleGenerateSuggestion()}
              disabled={loading}
            >
              {loading ? t('loading') : t('generateSuggestion')}
            </button>
          )}
          
          {mode === 'enhance' && loading && (
             <div className="loading-indicator">{t('loading')}</div>
          )}

          {suggestion && (
            <div className="suggestion-section">
              <label>{t('aiSuggestion')}</label>
              <textarea
                value={editedSuggestion}
                onChange={(e) => setEditedSuggestion(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="modal-buttons">
          {suggestion && (
            <>
              <button className="accept-button" onClick={handleAccept}>
                {t('acceptSuggestion')}
              </button>
            </>
          )}
          <button className="reject-button" onClick={onClose}>
            {t('rejectSuggestion')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistModal;
