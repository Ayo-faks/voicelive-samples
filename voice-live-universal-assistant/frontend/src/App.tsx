import React, { useState, useEffect } from 'react';
import { useVoiceSession } from './hooks/useVoiceSession';
import { useTheme } from './hooks/useTheme';
import { useUrlParams } from './hooks/useUrlParams';
import type { InputMode } from './hooks/useUrlParams';
import { TopBar } from './components/TopBar';
import { ActiveSession } from './components/ActiveSession';
import { SettingsPanel } from './components/SettingsPanel';
import { ErrorBanner } from './components/ErrorBanner';
import { BuiltWithBadge } from './components/BuiltWithBadge';
import { VoiceOrb } from './components/VoiceOrb';

const App: React.FC = () => {
  const {
    state,
    transcripts,
    settings,
    updateSettings,
    startSession,
    stopSession,
    resetSession,
    toggleMute,
    isMuted,
    toggleCC,
    isCCEnabled,
    errorMessage,
    dismissError,
    azureSpeechLocales,
  } = useVoiceSession();

  const { theme, setTheme } = useTheme();
  const { lockedMode, isLocked } = useUrlParams();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(lockedMode ?? 'voice');

  // Auto-connect on mount once settings are loaded from server
  const [autoStarted, setAutoStarted] = useState(false);
  useEffect(() => {
    if (!autoStarted && state === 'idle' && settings.mode) {
      // In agent mode, only auto-start if agent config is present
      if (settings.mode === 'agent' && (!settings.agentName?.trim() || !settings.project?.trim())) {
        return;
      }
      setAutoStarted(true);
      startSession();
    }
  }, [autoStarted, state, settings.mode, settings.agentName, settings.project, startSession]);

  const handleNewThread = () => {
    resetSession();
    setTimeout(() => startSession(), 0);
  };

  const showModeToggle = !isLocked && !lockedMode;
  const showSettings = !isLocked;

  const isActive =
    state === 'connecting' || state === 'listening' || state === 'thinking' || state === 'speaking';

  const isIdle = state === 'idle' || state === 'ended';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ErrorBanner message={errorMessage} onDismiss={dismissError} />

      <TopBar
        agentName={settings.mode === 'agent' ? settings.agentName : settings.model}
        inputMode={inputMode}
        onInputModeChange={setInputMode}
        onNewThread={handleNewThread}
        onOpenSettings={() => setSettingsOpen(true)}
        showModeToggle={showModeToggle}
        showSettings={showSettings}
      />

      <div style={contentStyle}>
        {isIdle && (
          <div style={idleContainerStyle}>
            <VoiceOrb state="idle" size={160} />
            <h2 style={idleHeadingStyle}>
              {settings.mode === 'agent' ? settings.agentName || 'Voice Assistant' : 'Voice Assistant'}
            </h2>
            <p style={idleDescStyle}>
              {state === 'ended' ? 'Session ended. Click + to start a new thread.' : 'Connecting...'}
            </p>
          </div>
        )}

        {isActive && (
          <ActiveSession
            state={state}
            transcripts={transcripts}
            isCCEnabled={isCCEnabled}
            isMuted={isMuted}
            onToggleCC={toggleCC}
            onToggleMute={toggleMute}
            onEndSession={stopSession}
          />
        )}
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        settings={settings}
        onUpdate={updateSettings}
        onClose={() => setSettingsOpen(false)}
        azureSpeechLocales={azureSpeechLocales}
        theme={theme}
        onThemeChange={setTheme}
      />

      <BuiltWithBadge />
    </div>
  );
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
};

const idleContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  gap: '16px',
};

const idleHeadingStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 600,
  color: 'var(--fg-1)',
  margin: 0,
};

const idleDescStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: 'var(--fg-3)',
  margin: 0,
};

export default App;
