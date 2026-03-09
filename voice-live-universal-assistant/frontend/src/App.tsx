import React, { useState, useEffect } from 'react';
import { useVoiceSession } from './hooks/useVoiceSession';
import { useTheme } from './hooks/useTheme';
import { useUrlParams } from './hooks/useUrlParams';
import type { InputMode } from './hooks/useUrlParams';
import { TopBar } from './components/TopBar';
import { ActiveSession } from './components/ActiveSession';
import { ChatMessages } from './components/ChatMessages';
import { ChatInput } from './components/ChatInput';
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
    setInputModeRef,
  } = useVoiceSession();

  const { theme, setTheme } = useTheme();
  const { lockedMode, isLocked, agent, project, theme: urlTheme, greetingDisabled } = useUrlParams();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>(lockedMode ?? 'voice');

  useEffect(() => { setInputModeRef(inputMode); }, [inputMode, setInputModeRef]);

  // Apply URL param overrides once config is loaded
  useEffect(() => {
    if (!configLoaded) return;
    const overrides: Record<string, any> = {};
    if (agent) overrides.agentName = agent;
    if (project) overrides.project = project;
    if (greetingDisabled) overrides.proactiveGreeting = false;
    if (agent && project) overrides.mode = 'agent';
    if (Object.keys(overrides).length > 0) updateSettings(overrides);
  }, [configLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply URL theme override
  useEffect(() => {
    if (urlTheme) setTheme(urlTheme);
  }, [urlTheme, setTheme]);

  const isActive = state === 'connecting' || state === 'listening' || state === 'thinking' || state === 'speaking';
  const isIdle = state === 'idle' || state === 'ended';

  const handleNewThread = () => {
    if (isActive) { stopSession(); }
    resetSession();
  };

  const showControls = !isLocked;
  const agentMissingConfig = settings.mode === 'agent' && (!settings.agentName?.trim() || !settings.project?.trim());
  // In locked mode with missing config, don't block — auto-start may still work with server defaults
  const startDisabled = agentMissingConfig && !isLocked;
  const agentDisplayName = settings.mode === 'agent' ? (settings.agentName || 'Voice Assistant') : (settings.model || 'Voice Assistant');
  const formatName = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ErrorBanner message={errorMessage} onDismiss={dismissError} />
      <TopBar agentName={agentDisplayName} onNewThread={handleNewThread} onOpenSettings={() => setSettingsOpen(true)} showControls={showControls} />

      <div style={contentStyle}>
        {isIdle && configLoaded && (
          <div style={idleContainerStyle}>
            <Waves paused={false} />
            <div style={idleContentStyle}>
              <h1 style={agentHeadingStyle}>{formatName(agentDisplayName)}</h1>
              <p style={agentDescStyle}>
                {settings.mode === 'agent' ? `Agent with ${settings.project || 'Foundry'} project.` : 'Talk like you would to a person. The agent listens and responds.'}
              </p>
              <VoiceOrb state="idle" size={120} />
              <h2 style={letsTalkStyle}>Let's talk</h2>
              <p style={talkDescStyle}>Talk like you would to a person. The agent listens and responds.</p>
              <button
                style={{ ...startBtnStyle, ...(startDisabled ? startBtnDisabledStyle : {}) }}
                onClick={startDisabled ? undefined : () => startSession()}
                disabled={startDisabled}
                title={startDisabled ? 'Agent Name and Project required' : undefined}
              >
                Start session
              </button>
              {startDisabled && !isLocked && <p style={warningStyle}>Open Settings (···) to configure Agent Name and Project</p>}
            </div>
          </div>
        )}

        {state === 'connecting' && (
          <div style={idleContainerStyle}>
            <div style={idleContentStyle}>
              <VoiceOrb state="connecting" size={120} />
              <p style={letsTalkStyle}>Connecting...</p>
            </div>
          </div>
        )}

        {isActive && state !== 'connecting' && inputMode === 'voice' && (
          <ActiveSession state={state} transcripts={transcripts} isCCEnabled={isCCEnabled} isMuted={isMuted} onToggleCC={toggleCC} onToggleMute={toggleMute} onEndSession={stopSession} />
        )}

        {isActive && state !== 'connecting' && inputMode === 'text' && <ChatMessages transcripts={transcripts} />}
      </div>

      {isActive && state !== 'connecting' && inputMode === 'text' && (
        <div style={textModeBottomStyle}>
          <ChatInput onSend={sendTextMessage} />
          <button style={endSessionTextStyle} onClick={stopSession} aria-label="End session">✕ End</button>
        </div>
      )}

      <SettingsPanel isOpen={settingsOpen} settings={settings} onUpdate={updateSettings} onClose={() => setSettingsOpen(false)} azureSpeechLocales={azureSpeechLocales} theme={theme} onThemeChange={setTheme} />
      <BuiltWithBadge />
    </div>
  );
};

const contentStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' };
const idleContainerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' };
const idleContentStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, textAlign: 'center', maxWidth: '500px', padding: '16px 20px 0' };
const agentHeadingStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 600, color: 'var(--fg-1)', margin: 0, lineHeight: '32px' };
const agentDescStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--fg-2)', margin: '0 0 16px 0', lineHeight: '20px', maxWidth: '250px' };
const letsTalkStyle: React.CSSProperties = { fontSize: '20px', fontWeight: 600, color: 'var(--fg-1)', margin: '8px 0 0 0', lineHeight: '20px' };
const talkDescStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--fg-2)', margin: 0, maxWidth: '250px', lineHeight: '20px' };
const startBtnStyle: React.CSSProperties = { marginTop: '24px', padding: '8px 16px', borderRadius: '9999px', border: 'none', background: 'var(--voice-primary)', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', lineHeight: '22px', minWidth: '200px' };
const startBtnDisabledStyle: React.CSSProperties = { opacity: 0.45, cursor: 'not-allowed' };
const warningStyle: React.CSSProperties = { fontSize: '12px', color: 'var(--fg-2)', margin: 0 };
const textModeBottomStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-2)', padding: '0 8px 0 0' };
const endSessionTextStyle: React.CSSProperties = { padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--error)', background: 'var(--error-bg-subtle)', color: 'var(--error)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' };

export default App;
