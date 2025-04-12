
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator text-muted-foreground">
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
      <span className="typing-dot"></span>
    </div>
  );
};

export default TypingIndicator;
