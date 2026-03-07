import React, { useState, useEffect } from 'react';
import { useVoiceSession } from './hooks/useVoiceSession';
import { useTheme } from './hooks/useTheme';
import { useUrlParams } from './hooks/useUrlParams';
import type { InputMode } from './hooks/useUrlParams';
import { TopBar } from './components/TopBar';
import { ActiveSession } from './components/ActiveSession';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
import { AgentPrimaryDetails } from './components/AgentPrimaryDetails';
import { StarterMessages } from './components/StarterMessages';
import { Waves } from './components/Waves';
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
    sendTextMessage,
    configLoaded,
  } = useVoiceSession();

  const { theme, setTheme } = useTheme();
  const { lockedMode, isLocked } = useUrlParams();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(lockedMode ?? 'voice');

  // Auto-connect once server config is loaded
  const [autoStarted, setAutoStarted] = useState(false);
  useEffect(() => {
    if (!autoStarted && state === 'idle' && configLoaded) {
      if (settings.mode === 'agent' && (!settings.agentName?.trim() || !settings.project?.trim())) {
        return;
      }
      setAutoStarted(true);
      startSession();
    }
  }, [autoStarted, state, configLoaded, settings.mode, settings.agentName, settings.project, startSession]);

  const handleNewThread = () => {
    resetSession();
    setTimeout(() => startSession(), 0);
  };

  const showModeToggle = !isLocked && !lockedMode;
  const showSettings = !isLocked;

  const isActive =
    state === 'connecting' || state === 'listening' || state === 'thinking' || state === 'speaking';

  const isIdle = state === 'idle' || state === 'ended';

  const starterPrompts = [
    'Tell me about your capabilities',
    'What can you help me with?',
    'How does this work?',
  ];

  const handleStarterPrompt = (prompt: string) => {
    if (inputMode === 'text' && isActive) {
      sendTextMessage(prompt);
    }
  };

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
            <Waves paused={!isIdle} />
            <div style={idleContentStyle}>
              <AgentPrimaryDetails
                name={settings.mode === 'agent' ? settings.agentName : settings.model || 'Voice Assistant'}
                description={state === 'ended'
                  ? 'Session ended. Click + to start a new thread.'
                  : 'Connecting to Voice Live...'}
              />
              <StarterMessages prompts={starterPrompts} onPromptClick={handleStarterPrompt} />
            </div>
          </div>
        )}

        {isActive && inputMode === 'voice' && (
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

        {isActive && inputMode === 'text' && (
          <ChatMessages transcripts={transcripts} />
        )}
      </div>

      {isActive && inputMode === 'text' && (
        <ChatInput onSend={sendTextMessage} />
      )}

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
  position: 'relative',
};

const idleContentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  zIndex: 1,
};

export default App;
