import React from 'react';
import { Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { MoreHorizontalRegular, SettingsRegular, TextAlignLeftRegular, ShieldCheckmarkRegular, PersonFeedbackRegular, ChatAddRegular } from '@fluentui/react-icons';

interface TopBarProps {
  agentName: string;
  onNewThread: () => void;
  onOpenSettings: () => void;
  showControls: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  agentName,
  onNewThread,
  onOpenSettings,
  showControls,
}) => {
  return (
    <div style={barStyle}>
      {/* Left: agent name */}
      <span style={agentNameStyle}>{agentName || 'Voice Assistant'}</span>

      {/* Right: controls */}
      {showControls && (
        <div style={rightStyle}>
          <Button appearance="subtle" icon={<ChatAddRegular />} onClick={onNewThread}>New chat</Button>

          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="subtle" shape="circular" icon={<MoreHorizontalRegular />} aria-label="More options" />
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<SettingsRegular />} onClick={() => onOpenSettings()}>Settings</MenuItem>
                <MenuItem icon={<TextAlignLeftRegular />} onClick={() => window.open('https://aka.ms/aistudio/terms', '_blank')}>Terms of use ↗</MenuItem>
                <MenuItem icon={<ShieldCheckmarkRegular />} onClick={() => window.open('https://go.microsoft.com/fwlink/?linkid=521839', '_blank')}>Privacy ↗</MenuItem>
                <MenuItem icon={<PersonFeedbackRegular />}>Send feedback</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </div>
      )}
    </div>
  );
};

// --- Styles ---

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-1)',
  zIndex: 10,
};

const agentNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--fg-1)',
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};
