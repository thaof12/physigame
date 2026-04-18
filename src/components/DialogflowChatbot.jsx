import { useEffect } from 'react';

const DIALOGFLOW_SCRIPT_ID = 'dialogflow-messenger-bootstrap';

const DialogflowChatbot = () => {
  const projectId = import.meta.env.VITE_DF_PROJECT_ID;
  const agentId = import.meta.env.VITE_DF_AGENT_ID;
  const languageCode = import.meta.env.VITE_DF_LANGUAGE_CODE || 'vi';
  const chatTitle = import.meta.env.VITE_DF_CHAT_TITLE || 'Tro ly hoc tap';

  useEffect(() => {
    if (!projectId || !agentId) {
      return;
    }

    if (document.getElementById(DIALOGFLOW_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = DIALOGFLOW_SCRIPT_ID;
    script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';
    script.async = true;

    document.body.appendChild(script);
  }, [projectId, agentId]);

  if (!projectId || !agentId) {
    return null;
  }

  return (
    <df-messenger
      intent="WELCOME"
      project-id={projectId}
      agent-id={agentId}
      language-code={languageCode}
      max-query-length="300"
      chat-title={chatTitle}
    />
  );
};

export default DialogflowChatbot;
