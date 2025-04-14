
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="typing-indicator text-muted-foreground flex items-center h-6">
      <span className="typing-single-dot"></span>
    </div>
  );
};

export default TypingIndicator;
