import React from 'react';
import Index from './Index';

// This component is a wrapper for the Index component
// We're doing this to keep all the existing functionality while changing routes
const Chat: React.FC = () => {
  return <Index />;
};

export default Chat;
