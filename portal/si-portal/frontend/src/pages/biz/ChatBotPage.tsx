import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSelector } from 'react-redux';
import { RootState } from '~store/Store';
import styles from './ChatBotPage.module.scss';

type ChatRole = 'user' | 'assistant';
type CompletionRole = 'system' | ChatRole;

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatSessionSummary = {
  id: string;
  title?: string;
  updated_at?: string;
};

const CHAT_API_URL =
  process.env.REACT_APP_CHAT_API_URL || 'http://localhost:8000/api/chat';

const systemMessage: { role: CompletionRole; content: string } = {
  role: 'system',
  content:
    '모든 응답은 한국어로, 간결하고 단계별로 설명해주세요. 사용자의 톤을 존중하고 불필요한 사족은 피하세요.',
};

const initialAssistantMessage: ChatMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content:
    '안녕하세요, AI 어시스턴트입니다. 제품, 코드, 아이디어 무엇이든 질문하세요. 로그나 텍스트도 붙여 주시면 검토해 드립니다.',
};

const getId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`);

const ChatBotPage: React.FC = () => {
  const userId = useSelector((state: RootState) => state.auth.user.userId) || 'anonymous';
  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    }),
    [userId]
  );

  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const conversationPayload = useMemo(
    () => [
      systemMessage,
      ...messages.map(({ role, content }) => ({ role: role as CompletionRole, content })),
    ],
    [messages]
  );

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const upsertAssistantMessage = useCallback(
    (id: string, updater: (prev: string) => string) => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === id && message.role === 'assistant'
            ? { ...message, content: updater(message.content) }
            : message
        )
      );
    },
    []
  );

  const readStream = useCallback(
    async (body: ReadableStream<Uint8Array>, assistantId: string) => {
      const reader = body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        chunk
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .forEach((line) => {
            const cleanLine = line.replace(/^data:\s*/, '');
            if (cleanLine === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(cleanLine);
              const delta =
                parsed?.choices?.[0]?.delta?.content ??
                parsed?.message ??
                parsed?.answer ??
                '';
              accumulated += delta;
            } catch {
              accumulated += cleanLine;
            }
          });

        const snapshot = accumulated;
        upsertAssistantMessage(assistantId, () => snapshot);
      }
    },
    [upsertAssistantMessage]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;
      // 세션이 없으면 우선 생성 시도
      let sessionId = currentSessionId;
      if (!sessionId) {
        try {
          const res = await fetch(`${CHAT_API_URL}/sessions`, {
            method: 'POST',
            headers,
          });
          if (!res.ok) throw new Error(`세션 생성 실패 (${res.status})`);
          const data = await res.json();
          sessionId = data.id as string;
          setCurrentSessionId(sessionId);
          setSessions((prev): ChatSessionSummary[] => [
            { id: sessionId!, title: data.title, updated_at: data.updated_at },
            ...prev,
          ]);
        } catch (e) {
          console.error('세션 자동 생성 실패', e);
          return;
        }
      }

      const userMessage: ChatMessage = {
        id: getId(),
        role: 'user',
        content: text.trim(),
      };
      const assistantId = getId();

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: 'assistant', content: '생각 중...' },
      ]);
      setInput('');
      setIsSending(true);

      try {
        const response = await fetch(`${CHAT_API_URL}/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            messages: [...conversationPayload, userMessage],
            stream: true,
            session_id: sessionId,
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Request failed (${response.status}): ${errText}`);
        }

        if (
          response.body &&
          response.headers.get('content-type')?.includes('text/event-stream')
        ) {
          await readStream(response.body, assistantId);
        } else {
          const data = await response.json();
          const answer =
            data?.choices?.[0]?.message?.content ||
            data?.message ||
            data?.answer ||
            '응답을 받지 못했습니다.';
          upsertAssistantMessage(assistantId, () => answer);
        }
      } catch (error: any) {
        upsertAssistantMessage(
          assistantId,
          () => error?.message || '챗봇 서비스에 연결할 수 없습니다.'
        );
        console.error('메시지 전송 실패', error);
      } finally {
        setIsSending(false);
      }
    },
    [conversationPayload, currentSessionId, headers, isSending, readStream, upsertAssistantMessage]
  );

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    void sendMessage(input);
  }, [input, sendMessage]);

  const handleNewChat = useCallback(() => {
    (async () => {
      try {
        const res = await fetch(`${CHAT_API_URL}/sessions`, {
          method: 'POST',
          headers,
        });
        if (!res.ok) throw new Error(`새 대화 생성 실패 (${res.status})`);
        const data = await res.json();
        const newId = data.id;
        setSessions((prev) => [{ id: newId, title: data.title, updated_at: data.updated_at }, ...prev]);
        setCurrentSessionId(newId);
        setMessages([initialAssistantMessage]);
      } catch (e) {
        console.error('새 대화 생성 실패', e);
      }
    })();
  }, [headers]);

  const handleSelectSession = useCallback(
    async (session: ChatSessionSummary) => {
      setCurrentSessionId(session.id);
      try {
        const res = await fetch(`${CHAT_API_URL}/sessions/${session.id}`, {
          headers,
        });
        const data = await res.json();
        const msgs: ChatMessage[] = (data.messages as ChatMessage[]) || [];
        setMessages(msgs.length ? msgs : [initialAssistantMessage]);
      } catch (e) {
        console.error('대화 불러오기 실패', e);
      }
    },
    [headers]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${CHAT_API_URL}/sessions`, { headers });
        if (!res.ok) throw new Error(`세션 조회 실패 (${res.status})`);
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          const first = data[0];
          setCurrentSessionId(first.id);
          const detailRes = await fetch(`${CHAT_API_URL}/sessions/${first.id}`, { headers });
          const detail = await detailRes.json();
          const msgs: ChatMessage[] = (detail.messages as ChatMessage[]) || [];
          setMessages(msgs.length ? msgs : [initialAssistantMessage]);
        } else {
          // 서버에는 세션이 없으므로 하나 만든다
          const resNew = await fetch(`${CHAT_API_URL}/sessions`, {
            method: 'POST',
            headers,
          });
          if (!resNew.ok) throw new Error(`세션 생성 실패 (${resNew.status})`);
          const created = await resNew.json();
          setSessions([{ id: created.id, title: created.title, updated_at: created.updated_at }]);
          setCurrentSessionId(created.id);
          setMessages([initialAssistantMessage]);
        }
      } catch (e) {
        console.error('세션 목록 불러오기 실패', e);
        // 실패 시에도 최소한 빈 세션을 하나 만든다
        try {
          const resNew = await fetch(`${CHAT_API_URL}/sessions`, {
            method: 'POST',
            headers,
          });
          if (resNew.ok) {
            const created = await resNew.json();
            setSessions([{ id: created.id, title: created.title, updated_at: created.updated_at }]);
            setCurrentSessionId(created.id);
            setMessages([initialAssistantMessage]);
          }
        } catch (err) {
          console.error('세션 생성도 실패', err);
        }
      }
    })();
  }, [headers]);

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>대화</h2>
          <button className={styles.newChatBtn} onClick={handleNewChat}>
            + 새 대화
          </button>
        </div>
        <div className={styles.history}>
          <p className={styles.sectionTitle}>대화 기록</p>
          <div className={styles.historyList}>
            {sessions.map((session) => (
              <button
                key={session.id}
                className={`${styles.historyItem} ${
                  session.id === currentSessionId ? styles.activeHistory : ''
                }`}
                onClick={() => handleSelectSession(session)}
              >
                <span className={styles.historyTitle}>{session.title}</span>
                <span className={styles.historyMeta}>
                  {session.updated_at
                    ? new Date(session.updated_at).toLocaleString('ko-KR', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>BISTelligence AI</p>
            <h1 className={styles.title}>ChatGPT 스타일 어시스턴트</h1>
            <p className={styles.subtitle}>
              FastAPI 브릿지에 바로 연결되는 챗봇입니다. 질문을 입력하고 대화 기록을 선택해 이어서
              이야기하세요.
            </p>
          </div>
        </header>

        <div className={styles.messages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageRow} ${
                message.role === 'user' ? styles.user : styles.assistant
              }`}
            >
              <div className={styles.avatar}>
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              <div className={styles.bubble}>
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={scrollAnchorRef} />
        </div>

        <footer className={styles.inputBar}>
          <input
            type="text"
            value={input}
            placeholder="메시지를 입력하세요..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSubmit();
              }
            }}
            disabled={isSending}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || isSending}
          >
            {isSending ? '보내는 중...' : '보내기'}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ChatBotPage;
