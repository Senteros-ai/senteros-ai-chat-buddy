
import React, { useEffect } from 'react';

declare global {
  interface Window {
    yaContextCb: Function[];
    Ya?: {
      Context: {
        AdvManager: {
          render: (params: {
            blockId: string;
            type: string;
            platform: string;
          }) => void;
        };
      };
    };
  }
}

interface YandexAdProps {
  trigger: boolean;
  onClose?: () => void;
}

const YandexAdManager: React.FC<YandexAdProps> = ({ trigger, onClose }) => {
  useEffect(() => {
    if (trigger && window.Ya?.Context) {
      window.yaContextCb.push(() => {
        window.Ya?.Context.AdvManager.render({
          "blockId": "R-A-15107666-1",
          "type": "fullscreen",
          "platform": "desktop"
        });
        
        // If an onClose function is provided, call it after a short delay
        // to allow the ad to be displayed properly
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 500);
        }
      });
    }
  }, [trigger, onClose]);

  return null; // This component doesn't render anything visible
};

export default YandexAdManager;
