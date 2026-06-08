import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import './dify-chatbot.css';

function DifyChatbot() {
  const { user } = useAuth();
  const storageKey = 'physigame-dify-chat-history';
  const sessionsKey = 'physigame-dify-chat-sessions';
  const conversationKey = 'physigame-dify-conversation-id';
  const messagesTable = 'chat_histories';
  const apiBaseUrl = import.meta.env.VITE_DIFY_API_BASE_URL || 'https://api.dify.ai/v1';
  const apiKey = import.meta.env.VITE_DIFY_APP_API_KEY || '';
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(() => localStorage.getItem(conversationKey) || '');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem(storageKey);
    if (savedHistory) {
      try {
        setMessages(JSON.parse(savedHistory));
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from(messagesTable)
        .select('conversation_id, messages, updated_at, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to load chat history:', error.message);
        return;
      }

      const items = Array.isArray(data) ? data : [];
      const savedSessions = localStorage.getItem(sessionsKey);
      let fallbackSessions = [];
      if (items.length === 0 && savedSessions) {
        try {
          const parsedSessions = JSON.parse(savedSessions);
          if (Array.isArray(parsedSessions)) {
            fallbackSessions = parsedSessions;
          }
        } catch {
          localStorage.removeItem(sessionsKey);
        }
      }

      const historySource = items.length > 0 ? items : fallbackSessions;
      setHistoryItems(historySource);

      const lastConversation = historySource[0];
      if (lastConversation?.messages?.length) {
        setConversationId(lastConversation.conversation_id || '');
        setMessages(lastConversation.messages);
      }
    };

    loadHistory();
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(conversationKey, conversationId);
    } else {
      localStorage.removeItem(conversationKey);
    }
  }, [conversationId]);

  useEffect(() => {
    const persistHistory = async () => {
      if (!user?.id || !conversationId || messages.length === 0) return;

      const payload = {
        user_id: user.id,
        conversation_id: conversationId,
        messages,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from(messagesTable).upsert(payload, {
        onConflict: 'user_id,conversation_id'
      });

      if (error) {
        console.warn('Failed to persist chat history:', error.message);
        return;
      }

      setHistoryItems((current) => {
        const nextItem = { ...payload };
        const filtered = current.filter((item) => item.conversation_id !== conversationId);
        const nextHistory = [nextItem, ...filtered].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
        localStorage.setItem(sessionsKey, JSON.stringify(nextHistory));
        return nextHistory;
      });
    };

    persistHistory();
  }, [messages, conversationId, user?.id]);

  useEffect(() => {
    const listEl = listRef.current;
    if (listEl) {
      listEl.scrollTop = listEl.scrollHeight;
    }
  }, [messages, isOpen]);

  const canSend = useMemo(() => inputValue.trim().length > 0 && !isSending, [inputValue, isSending]);

  const formatAssistantContent = (content) => {
    if (typeof content !== 'string') return '';

    return content
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, ' ')
      .replace(/\\\(|\\\)|\\\[|\\\]/g, ' ')
      .replace(/\$+/g, ' ')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[_^~]/g, ' ')
      .replace(/\\[a-zA-Z]+/g, ' ')
      .replace(/[^\p{L}\p{N}\s.,!?;:()%/+\-\n]/gu, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/(\s|^)(\d+)\.\s+/g, '\n$2. ')
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map((line) => line.replace(/\s{2,}/g, ' ').trim())
      .join('\n')
      .trim();
  };

  const formatConversationTitle = (item) => {
    const firstUserMessage = item?.messages?.find((message) => message.role === 'user');
    if (firstUserMessage?.content) {
      return firstUserMessage.content.slice(0, 42);
    }

    return 'Cuộc trò chuyện';
  };

  const buildStructuredQuery = (question) => {
    const cleanQuestion = String(question || '').trim();
    return [
      'Bạn là Trợ lý học tập Vật lý.',
      'Hãy trả lời đúng định dạng sau:',
      '1. Tóm tắt ngắn gọn trong 1-2 câu.',
      '2. Trình bày ý chính theo danh sách đánh số rõ ràng.',
      '3. Nếu có công thức, đặt ở phần cuối với tiêu đề "Công thức".',
      '4. Không dùng ký tự đặc biệt dư thừa hoặc markdown rối.',
      '',
      `Câu hỏi: ${cleanQuestion}`
    ].join('\n');
  };

  const mapDifyErrorMessage = (rawError) => {
    const message = String(rawError || '').toLowerCase();

    if (message.includes('provider not initialize') || message.includes('credentials is not initialized')) {
      return 'Dify chưa được cấu hình API key cho model (provider credentials). Vào Dify > Settings > Model Providers để thêm key OpenAI/nhà cung cấp model rồi thử lại.';
    }

    if (message.includes('conversation not exists') || message.includes('code not found')) {
      return 'Phiên hội thoại cũ đã hết hạn trên Dify. Hệ thống đã thử tạo phiên mới, bạn hãy gửi lại câu hỏi một lần nữa.';
    }

    if (message.includes('unauthorized') || message.includes('invalid api key') || message.includes('forbidden')) {
      return 'API key Dify không hợp lệ hoặc không có quyền. Kiểm tra lại VITE_DIFY_APP_API_KEY trong .env.';
    }

    return `Lỗi Dify: ${rawError}`;
  };

  const openConversation = (item) => {
    if (!item?.conversation_id) return;
    setConversationId(item.conversation_id);
    setMessages(Array.isArray(item.messages) ? item.messages : []);
    setIsOpen(true);
  };

  const resetChat = () => {
    const previousMessages = Array.isArray(messages) ? messages : [];
    const previousConversationId = conversationId || crypto.randomUUID();

    if (previousMessages.length > 0) {
      setHistoryItems((current) => {
        const nextHistory = [
          {
            user_id: user?.id || 'guest',
            conversation_id: previousConversationId,
            messages: previousMessages,
            updated_at: new Date().toISOString()
          },
          ...current.filter((item) => item.conversation_id !== previousConversationId)
        ];
        localStorage.setItem(sessionsKey, JSON.stringify(nextHistory));
        return nextHistory;
      });
    }

    setMessages([]);
    setConversationId('');
    setInputValue('');
    localStorage.removeItem(storageKey);
    localStorage.removeItem(conversationKey);
  };

  const sendMessage = async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;
    const structuredQuery = buildStructuredQuery(content);

    const sessionId = conversationId || crypto.randomUUID();

    if (!apiKey) {
      const userMessage = { id: crypto.randomUUID(), role: 'user', content };
      const assistantMessage = { id: crypto.randomUUID(), role: 'assistant', content: 'Thiếu VITE_DIFY_APP_API_KEY trong .env.' };
      const sessionMessages = [userMessage, assistantMessage];

      setMessages((current) => [
        ...current,
        userMessage,
        assistantMessage
      ]);
      setConversationId(sessionId);
      setHistoryItems((current) => {
        const nextHistory = [
          {
            user_id: user?.id || 'guest',
            conversation_id: sessionId,
            messages: sessionMessages,
            updated_at: new Date().toISOString()
          },
          ...current.filter((item) => item.conversation_id !== sessionId)
        ];
        localStorage.setItem(sessionsKey, JSON.stringify(nextHistory));
        return nextHistory;
      });
      setInputValue('');
      setIsOpen(true);
      return;
    }

    const userMessage = { id: crypto.randomUUID(), role: 'user', content };
    const pendingId = crypto.randomUUID();
    const pendingMessage = { id: pendingId, role: 'assistant', content: 'Đang trả lời...' };
    const nextMessages = [...messages, userMessage, pendingMessage];

    setMessages(nextMessages);
    setConversationId(sessionId);
    setHistoryItems((current) => {
      const nextHistory = [
        {
          user_id: user?.id || 'guest',
          conversation_id: sessionId,
          messages: nextMessages,
          updated_at: new Date().toISOString()
        },
        ...current.filter((item) => item.conversation_id !== sessionId)
      ];
      localStorage.setItem(sessionsKey, JSON.stringify(nextHistory));
      return nextHistory;
    });
    setInputValue('');
    setIsOpen(true);
    setIsSending(true);

    try {
      const requestChat = async (conversationIdParam) => {
        const response = await fetch(`${apiBaseUrl}/chat-messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify({
            inputs: {},
            query: structuredQuery,
            response_mode: 'blocking',
            user: 'physigame-web-user',
            conversation_id: conversationIdParam || undefined
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return {
            ok: false,
            status: response.status,
            errorText: errorText || `HTTP ${response.status}`
          };
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          return {
            ok: false,
            status: response.status,
            errorText: 'Dify returned a non-JSON response.'
          };
        }

        const data = await response.json();
        return { ok: true, data };
      };

      let result = await requestChat(sessionId || undefined);
      if (!result.ok) {
        const isConversationNotFound = result.status === 404 && /conversation not exists|code not found/i.test(result.errorText || '');
        if (isConversationNotFound) {
          result = await requestChat(undefined);
        }
      }

      if (!result.ok) {
        throw new Error(result.errorText || `HTTP ${result.status}`);
      }

      const data = result.data;
      const answer = data?.answer || data?.data?.answer || data?.message || data?.data?.message || data?.data?.outputs?.answer || data?.data?.outputs?.text || data?.outputs?.answer || data?.outputs?.text;
      const resolvedConversationId = data?.conversation_id || sessionId;

      setConversationId(resolvedConversationId);

      if (!answer) {
        throw new Error('Dify returned JSON without an answer.');
      }

      const finalMessages = nextMessages.map((message) => (
        message.id === pendingId ? { ...message, content: answer } : message
      ));

      setHistoryItems((current) => {
        const nextHistory = [
          {
            user_id: user?.id || 'guest',
            conversation_id: resolvedConversationId,
            messages: finalMessages,
            updated_at: new Date().toISOString()
          },
          ...current.filter((item) => item.conversation_id !== resolvedConversationId && item.conversation_id !== sessionId)
        ];
        localStorage.setItem(sessionsKey, JSON.stringify(nextHistory));
        return nextHistory;
      });

      setMessages((current) => current.map((message) => message.id === pendingId ? { ...message, content: answer } : message));
      return;
    } catch (error) {
      const failureAnswer = mapDifyErrorMessage(error.message);
      const finalMessages = nextMessages.map((message) => (
        message.id === pendingId ? { ...message, content: failureAnswer } : message
      ));

      setHistoryItems((current) => {
        const nextHistory = [
          {
            user_id: user?.id || 'guest',
            conversation_id: sessionId,
            messages: finalMessages,
            updated_at: new Date().toISOString()
          },
          ...current.filter((item) => item.conversation_id !== sessionId)
        ];
        localStorage.setItem(sessionsKey, JSON.stringify(nextHistory));
        return nextHistory;
      });

      setMessages((current) => current.map((message) => message.id === pendingId ? { ...message, content: failureAnswer } : message));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="dify-chatbot-shell">
      {isOpen && (
        <section className="dify-chatbot-panel" aria-label="AI chatbot window">
          <header className="dify-chatbot-header">
            <div>
              <p className="dify-chatbot-kicker">Trợ lý học tập</p>
              <h3>Hỏi đáp vật lý</h3>
            </div>
            <div className="dify-chatbot-header-actions">
              <button type="button" className="dify-chatbot-text-button" onClick={resetChat}>
                New chat
              </button>
              <button type="button" className="dify-chatbot-icon-button" onClick={() => setIsOpen(false)} aria-label="Đóng chat">
                ×
              </button>
            </div>
          </header>

          <div className="dify-chatbot-body">
            <div className="dify-chatbot-main">
              <div className="dify-chatbot-history" ref={listRef}>
                {!apiKey && (
                  <div className="dify-chatbot-empty dify-chatbot-warning">
                    <strong>Chưa có khóa Dify</strong>
                    <p>Điền VITE_DIFY_APP_API_KEY trong .env để chatbot trả lời thật.</p>
                  </div>
                )}
                {messages.length === 0 ? (
                  <div className="dify-chatbot-empty">
                    <strong>Bắt đầu một cuộc trò chuyện</strong>
                    <p>Hỏi mình bất cứ điều gì về vật lý.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`dify-chatbot-message ${message.role}`}>
                      <span className="dify-chatbot-message-label">{message.role === 'user' ? 'Bạn' : 'Bot'}</span>
                      <p>{message.role === 'assistant' ? formatAssistantContent(message.content) : message.content}</p>
                    </div>
                  ))
                )}
              </div>
              <form
                className="dify-chatbot-composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
              >
                <textarea
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Nhập câu hỏi vật lý..."
                  rows={3}
                />
                <button type="submit" disabled={!canSend}>
                  {isSending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </form>
            </div>

            <aside className="dify-chatbot-history-strip" aria-label="Lịch sử chat">
              <span className="dify-chatbot-history-strip-label">Lịch sử chat</span>
              <div className="dify-chatbot-history-list compact">
                {historyItems.length === 0 ? (
                  <div className="dify-chatbot-history-empty">
                    Chưa có lịch sử nào
                  </div>
                ) : (
                  historyItems.map((item) => (
                    <button
                      key={item.conversation_id}
                      type="button"
                      className={`dify-chatbot-history-item compact ${item.conversation_id === conversationId ? 'active' : ''}`}
                      onClick={() => openConversation(item)}
                    >
                      <strong>{formatConversationTitle(item)}</strong>
                      <span>{item.messages?.length || 0} tin nhắn</span>
                    </button>
                  ))
                )}
              </div>
            </aside>
          </div>
        </section>
      )}

      <button type="button" className="dify-chatbot-launcher" onClick={() => setIsOpen((value) => !value)} aria-label="Mở chatbot">
        <span>{isOpen ? '−' : 'Chat'}</span>
      </button>
    </div>
  );
}

export default DifyChatbot;
