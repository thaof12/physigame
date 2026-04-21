import { useEffect } from 'react';
import './dialogflow-chatbot.css';

const DEFAULT_CHAT_TITLE = 'Physical-Assistant';

function DialogflowChatbot({ hidden = false }) {
  const projectId = import.meta.env.VITE_DF_PROJECT_ID;
  const agentId = import.meta.env.VITE_DF_AGENT_ID;
  const languageCode = import.meta.env.VITE_DF_LANGUAGE_CODE || 'vi';
  const chatTitle = import.meta.env.VITE_DF_CHAT_TITLE || DEFAULT_CHAT_TITLE;

  useEffect(() => {
    if (!projectId || !agentId) {
      if (import.meta.env.DEV) {
        console.warn('Dialogflow chatbot is disabled: missing VITE_DF_PROJECT_ID or VITE_DF_AGENT_ID.');
      }
      return undefined;
    }

    const scriptId = 'dialogflow-messenger-bootstrap';
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
      script.async = true;
      document.body.appendChild(script);
    }

    return undefined;
  }, [projectId, agentId]);

  if (hidden || !projectId || !agentId) {
    return null;
  }

  return (
    <div className="df-wrapper" aria-label="AI chatbot support">
      <df-messenger
        location="global"
        project-id={projectId}
        agent-id={agentId}
        language-code={languageCode}
        max-query-length="220"
        allow-feedback="all"
      >
        <df-messenger-chat-bubble chat-title={chatTitle} />
      </df-messenger>
    </div>
  );
}

export default DialogflowChatbot;
