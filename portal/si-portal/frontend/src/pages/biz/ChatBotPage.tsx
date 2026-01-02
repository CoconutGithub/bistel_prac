import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown'; // 마크다운 렌더링을 위한 라이브러리
import remarkGfm from 'remark-gfm'; // GFM(Tables, Strikethrough 등) 지원
import ReactECharts from 'echarts-for-react'; // 차트 라이브러리
import styles from './ChatBotPage.module.scss'; // SCSS 모듈

type ChatRole = 'user' | 'assistant';

type CompletionRole = 'system' | ChatRole;

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

// 사이드바에 표시될 세션 요약 정보
type ChatSessionSummary = {
  id: string;
  title?: string;
  updated_at?: string;
};

// 업로드된 문서 정보 (RAG 컨텍스트용)
type UploadedDoc = {
  id: string;
  name: string;
  textLength: number;
};

// 백엔드 채팅 API 기본 URL
const CHAT_API_URL =
  process.env.REACT_APP_CHAT_API_URL || 'http://localhost:8000/api/chat';

// 시스템 프롬프트: AI의 페르소나 및 응답 규칙 설정
const systemMessage: { role: CompletionRole; content: string } = {
  role: 'system',
  content:
    '모든 응답은 한국어로, 간결하고 단계별로 설명해주세요. 사용자의 톤을 존중하고 불필요한 사족은 피하세요.',
};

// 초기 환영 메시지
const initialAssistantMessage: ChatMessage = {
  id: 'assistant-welcome',
  role: 'assistant',
  content:
    '안녕하세요, AI 어시스턴트입니다. 제품, 코드, 아이디어 무엇이든 질문하세요. (model: gpt-5-mini)',
};
// UUID 생성 헬퍼 (crypto API 또는 타임스탬프 폴백)
const getId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`);

// --- Helper for creating Markdown Table from JSON ---
const convertJsonToMarkdownTable = (data: any[], errorMsg?: string, generatedSql?: string) => {
  let md = '';

  if (errorMsg) {
    md += `> **Error**: ${errorMsg}\n\n`;
  }

  if (generatedSql) {
    md += `\`\`\`sql\n${generatedSql}\n\`\`\`\n\n`;
  }

  if (!data || data.length === 0) {
    md += '조회된 결과가 없습니다.';
    return md;
  }

  // extract columns
  const columns = Object.keys(data[0]);
  if (columns.length === 0) return md;

  // Header row
  md += `| ${columns.join(' | ')} |\n`;
  // Separator row
  md += `| ${columns.map(() => '---').join(' | ')} |\n`;
  // Data rows
  data.forEach((row) => {
    const rowStr = columns.map((col) => String(row[col] ?? '')).join(' | ');
    md += `| ${rowStr} |\n`;
  });

  return md;
};
// ...
// ...
// ...



// --- Chart Helper Functions (Simplified from YieldTrendPage) ---
const transformToChartOption = (data: any[]) => {
  if (!data || data.length === 0) return null;

  // 데이터에 날짜(workDate/work_date)와 수율(yieldRate/yield_rate/finalYield/final_yield)이 있는지 확인
  const hasDate = data.some(d => d.workDate || d.work_date);
  const hasYield = data.some(d =>
    d.yieldRate !== undefined || d.yield_rate !== undefined ||
    d.finalYield !== undefined || d.final_yield !== undefined
  );

  if (!hasDate || !hasYield) {
    return null; // 차트 그리기 부적합 데이터
  }

  // 월별 집계
  const monthlyMap = new Map<string, { sum: number; count: number }>();

  data.forEach(item => {
    const dateStr = String(item.workDate || item.work_date || '');
    const monthKey = dateStr.length >= 7 ? dateStr.substring(0, 7) : dateStr;

    // finalYield/final_yield 우선, 없으면 yieldRate/yield_rate
    const val = Number(
      item.finalYield ?? item.final_yield ??
      item.yieldRate ?? item.yield_rate
    );

    if (!isNaN(val) && val > 0 && val <= 100) {
      if (!monthlyMap.has(monthKey)) monthlyMap.set(monthKey, { sum: 0, count: 0 });
      const curr = monthlyMap.get(monthKey)!;
      curr.sum += val;
      curr.count += 1;
    }
  });

  const dates = Array.from(monthlyMap.keys()).sort();
  const averages = dates.map(d => {
    const item = monthlyMap.get(d)!;
    return parseFloat((item.sum / item.count).toFixed(2));
  });

  return {
    title: { text: '월별 평균 수율 트렌드', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates, name: '기간' },
    yAxis: { type: 'value', name: '수율(%)', min: 'dataMin' },
    series: [{
      name: '평균 수율',
      type: 'line',
      data: averages,
      smooth: true,
      itemStyle: { color: '#fd7e14' },
      lineStyle: { width: 3 },
      symbolSize: 8,
      label: { show: true, position: 'top' }
    }]
  };
};

const ChatBotPage: React.FC = () => {
  // 인증 헤더 생성 함수 (useCallback으로 최적화)
  const getHeaders = useCallback(() => {
    const token = sessionStorage.getItem('authToken') || '';
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`; // JWT 토큰 추가
    return h;
  }, []);

  // ... (State management remains same) ...
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);          // 대화 세션 목록
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null); // 현재 활성화된 세션 ID
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage]); // 현재 대화의 메시지 목록
  const [input, setInput] = useState('');                 // 사용자 입력 텍스트
  const [isSending, setIsSending] = useState(false);      // 메시지 전송 중 여부
  const [docs, setDocs] = useState<UploadedDoc[]>([]);    // 업로드된 문서 목록
  const [uploading, setUploading] = useState(false);      // 파일 업로드 중 여부
  const [uploadError, setUploadError] = useState<string | null>(null); // 업로드 에러 메시지
  const [showActions, setShowActions] = useState(false);  // + 버튼 액션 메뉴 표시 여부
  const [showDocChips, setShowDocChips] = useState(true); // 문서 칩(Chip) 표시 여부

  // [NEW] 차트 그리기 모드 상태
  const [isChartMode, setIsChartMode] = useState(false);

  // --- Refs ---
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null); // 자동 스크롤을 위한 앵커
  const abortControllerRef = useRef<AbortController | null>(null); // SSE 요청 중단을 위한 컨트롤러
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // 자동 높이 조절 Textarea
  const fileInputRef = useRef<HTMLInputElement | null>(null);   // 숨겨진 파일 입력 필드

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

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const minHeight = 44;
    const maxHeight = 120; // 약 3줄 정도까지 확장
    el.style.height = 'auto';
    const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

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

  // SSE(Server-Sent Events) 스트림 처리 함수
  // ... (readStream implementation remains same) ...
  const readStream = useCallback(
    async (body: ReadableStream<Uint8Array>, assistantId: string) => {
      const reader = body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulated = ''; // 누적된 응답 텍스트

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // 스트림은 여러 줄이 뭉쳐서 올 수 있으므로 라인 단위 분리
        chunk
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .forEach((line) => {
            const cleanLine = line.replace(/^data:\s*/, '');
            if (cleanLine === '[DONE]') {
              return; // 스트림 종료 시그널
            }

            try {
              // JSON 파싱 후 delta content 추출
              const parsed = JSON.parse(cleanLine);
              const delta =
                parsed?.choices?.[0]?.delta?.content ??
                parsed?.message ??
                parsed?.answer ??
                '';
              accumulated += delta;
            } catch {
              // JSON 파싱 실패 시 원본 라인을 그대로 사용 (예외 처리)
              accumulated += cleanLine;
            }
          });

        const snapshot = accumulated;
        // 상태 업데이트: 현재까지 수신된 텍스트로 메시지 내용 갱신
        upsertAssistantMessage(assistantId, () => snapshot);
      }
    },
    [upsertAssistantMessage]
  );

  // 메시지 전송 핸들러 (메인 로직)
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;

      // 세션이 없으면 생성
      let sessionId = currentSessionId;
      if (!sessionId) {
        try {
          const res = await fetch(`${CHAT_API_URL}/sessions`, {
            method: 'POST',
            headers: getHeaders(),
          });
          if (!res.ok) throw new Error(`세션 생성 실패 (${res.status})`);
          const data = await res.json();
          sessionId = data.id as string;
          setCurrentSessionId(sessionId);
          // 사이드바 목록에 새 세션 추가
          setSessions((prev): ChatSessionSummary[] => [
            { id: sessionId!, title: data.title, updated_at: data.updated_at },
            ...prev,
          ]);
        } catch (e) {
          console.error('세션 자동 생성 실패', e);
          return;
        }
      }

      // 사용자 메시지 및 임시 AI 메시지(로딩 상태) UI 추가
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
      if (docs.length > 0) {
        setShowDocChips(false); // 전송 시작과 동시에 칩을 숨김(데이터는 유지)
      }

      // 이전 요청 중단
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();


      // --- KEYWORD CHECK FOR TEXT-TO-SQL ---
      const hasSqlKeyword = /강봉|강관/i.test(text);

      if (hasSqlKeyword) {
        // [HISTORY] 1. 사용자 질문 저장
        try {
          await fetch(`${CHAT_API_URL}/sessions/${sessionId}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ role: 'user', content: text }),
          });
        } catch (e) {
          console.error('사용자 메시지 저장 실패', e);
        }

        // CALL JAVA BACKEND DIRECTLY
        try {
          // POST /biz/sqlbot/query
          // Note: using direct URL or env var. Assuming localhost:8080 based on context.
          const JAVA_API_URL = 'http://localhost:8080/biz/sqlbot/query';

          const response = await fetch(JAVA_API_URL, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ question: text }),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SQL Service Error: ${errorText}`);
          }

          const result = await response.json();
          // result structure: { data: [], columns: [], sql: string, error?: string } Note: Key is 'sql' not 'generatedSql'

          let finalAnswer = '';

          if (result.error) {
            finalAnswer = `데이터 조회 중 오류가 발생했습니다.\n> ${result.error}`;
            upsertAssistantMessage(assistantId, () => finalAnswer);
          } else {

            // [NEW] 데이터 존재 여부 확인
            if (!result.data || result.data.length === 0) {
              finalAnswer = `조회된 결과가 없습니다. (조건을 변경하여 다시 질문해보세요)`;
            } else if (isChartMode) {
              const chartOption = transformToChartOption(result.data);
              if (chartOption) {
                // 차트 데이터 JSON을 코드 블록으로 감싸서 저장
                finalAnswer = `데이터를 기반으로 차트를 생성했습니다.\n\n\`\`\`chart-json\n${JSON.stringify(chartOption, null, 2)}\n\`\`\``;
              } else {
                finalAnswer = `데이터는 조회되었으나, 차트를 그리기에 적합한 형식(날짜, 수율 등)이 아닙니다.\n\n${convertJsonToMarkdownTable(result.data.slice(0, 5))}`;
              }
            } else {
              // 기존 테이블 렌더링
              // 50건 이상이면 자르기 (채팅방 렌더링 성능 보호)
              const MAX_ROWS = 20;
              let displayData = result.data;
              let truncationNote = '';

              if (displayData && Array.isArray(displayData) && displayData.length > MAX_ROWS) {
                displayData = displayData.slice(0, MAX_ROWS);
                truncationNote = `\n\n*(데이터가 너무 많아 상위 ${MAX_ROWS}건만 표시됩니다. 상세 내용은 전용 조회 페이지를 이용하세요)*`;
              }

              const markdownTable = convertJsonToMarkdownTable(displayData, undefined, result.sql);
              finalAnswer = `데이터 조회 결과입니다.\n\n${markdownTable}${truncationNote}`;
            }

            upsertAssistantMessage(assistantId, () => finalAnswer);
          }

          // [HISTORY] 2. 봇 응답 저장
          try {
            await fetch(`${CHAT_API_URL}/sessions/${sessionId}/messages`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify({ role: 'assistant', content: finalAnswer }),
            });
          } catch (e) {
            console.error('봇 응답 저장 실패', e);
          }

        } catch (error: any) {
          if (error.name === 'AbortError') {
            upsertAssistantMessage(assistantId, () => '요청이 중단되었습니다.');
            return;
          }
          console.error('SQL query failed', error);
          upsertAssistantMessage(assistantId, () => `데이터 조회 서비스 연결 실패: ${error.message}`);
        } finally {
          setIsSending(false);
          abortControllerRef.current = null;
        }
        return;
        // EXIT function, do not proceed to Python Chat API
      }


      // --- STANDARD CHAT API CALL (PYTHON) ---
      try {
        // POST /completions: 채팅 응답 요청
        const response = await fetch(`${CHAT_API_URL}/completions`, {
          method: 'POST',
          headers: getHeaders(),
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            messages: [...conversationPayload, userMessage], // 전체 대화 문맥 + 새 질문
            stream: true,                                    // 스트리밍 활성화
            session_id: sessionId,
            document_ids: docs.map((d) => d.id),            // RAG용 문서 ID 목록
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => '');
          throw new Error(`Request failed (${response.status}): ${errText}`);
        }

        // 응답 처리 (스트리밍 vs 일반 JSON)
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
        if (error?.name === 'AbortError') {
          upsertAssistantMessage(assistantId, () => '응답이 중단되었습니다.');
          return;
        }
        upsertAssistantMessage(
          assistantId,
          () => error?.message || '챗봇 서비스에 연결할 수 없습니다.'
        );
        console.error('메시지 전송 실패', error);
      } finally {
        setIsSending(false);
        abortControllerRef.current = null;
      }
    },
    [
      isSending,
      currentSessionId,
      messages,
      docs,
      conversationPayload,
      readStream,
      getHeaders,
      upsertAssistantMessage,
      isChartMode // [NEW] dependency
    ]
  );

  // Custom Markdown Components for Chart
  const markdownComponents: Components = useMemo(() => ({
    code(props) {
      const { className, children } = props;
      const match = /language-([\w-]+)/.exec(className || '');
      const isChartJson = match && match[1] === 'chart-json';

      if (isChartJson) {
        try {
          const chartOption = JSON.parse(String(children).replace(/\n$/, ''));
          return (
            <div style={{ width: '100%', height: '400px', marginTop: '10px' }}>
              <ReactECharts
                option={chartOption}
                style={{ width: '100%', height: '100%' }}
                notMerge={true}
              />
            </div>
          );
        } catch (e) {
          return <code {...props} />;
        }
      }
      return <code {...props} />;
    }
  }), []);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;
    void sendMessage(input);
  }, [input, sendMessage]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSending(false);
  }, []);

  const handleNewChat = useCallback(() => {
    (async () => {
      try {
        const res = await fetch(`${CHAT_API_URL}/sessions`, {
          method: 'POST',
          headers: getHeaders(),
        });
        if (!res.ok) throw new Error(`새 대화 생성 실패 (${res.status})`);
        const data = await res.json();
        const newId = data.id;
        setSessions((prev) => [{ id: newId, title: data.title, updated_at: data.updated_at }, ...prev]);
        setCurrentSessionId(newId);
        setMessages([initialAssistantMessage]);
        setDocs([]);
      } catch (e) {
        console.error('새 대화 생성 실패', e);
      }
    })();
  }, [getHeaders]);

  const handleSelectSession = useCallback(
    async (session: ChatSessionSummary) => {
      setCurrentSessionId(session.id);
      setDocs([]);
      try {
        const res = await fetch(`${CHAT_API_URL}/sessions/${session.id}`, {
          headers: getHeaders(),
        });
        const data = await res.json();
        const msgs: ChatMessage[] = (data.messages as ChatMessage[]) || [];
        const loadedDocs: UploadedDoc[] = (data.documents as UploadedDoc[]) || [];
        setMessages(msgs.length ? msgs : [initialAssistantMessage]);
        setDocs(loadedDocs);
      } catch (e) {
        console.error('대화 불러오기 실패', e);
      }
    },
    [getHeaders]
  );

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      try {
        const res = await fetch(`${CHAT_API_URL}/sessions/${sessionId}`, {
          method: 'DELETE',
          headers: getHeaders(),
        });
        if (!res.ok) throw new Error(`세션 삭제 실패 (${res.status})`);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          const next = sessions.find((s) => s.id !== sessionId);
          if (next) {
            setCurrentSessionId(next.id);
            const detailRes = await fetch(`${CHAT_API_URL}/sessions/${next.id}`, { headers: getHeaders() });
            const detail = await detailRes.json();
            const msgs: ChatMessage[] = (detail.messages as ChatMessage[]) || [];
            setMessages(msgs.length ? msgs : [initialAssistantMessage]);
          } else {
            // no remaining sessions; create one
            const resNew = await fetch(`${CHAT_API_URL}/sessions`, {
              method: 'POST',
              headers: getHeaders(),
            });
            if (resNew.ok) {
              const created = await resNew.json();
              setSessions([{ id: created.id, title: created.title, updated_at: created.updated_at }]);
              setCurrentSessionId(created.id);
              setMessages([initialAssistantMessage]);
            } else {
              setCurrentSessionId(null);
              setMessages([initialAssistantMessage]);
            }
          }
        }
      } catch (e) {
        console.error('세션 삭제 실패', e);
      }
    },
    [currentSessionId, getHeaders, sessions]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${CHAT_API_URL}/sessions`, { headers: getHeaders() });
        if (!res.ok) throw new Error(`세션 조회 실패 (${res.status})`);
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          const first = data[0];
          setCurrentSessionId(first.id);
          const detailRes = await fetch(`${CHAT_API_URL}/sessions/${first.id}`, { headers: getHeaders() });
          const detail = await detailRes.json();
          const msgs: ChatMessage[] = (detail.messages as ChatMessage[]) || [];
          const loadedDocs: UploadedDoc[] = (detail.documents as UploadedDoc[]) || [];
          setMessages(msgs.length ? msgs : [initialAssistantMessage]);
          setDocs(loadedDocs);
        } else {
          const resNew = await fetch(`${CHAT_API_URL}/sessions`, {
            method: 'POST',
            headers: getHeaders(),
          });
          if (!resNew.ok) throw new Error(`세션 생성 실패 (${resNew.status})`);
          const created = await resNew.json();
          setSessions([{ id: created.id, title: created.title, updated_at: created.updated_at }]);
          setCurrentSessionId(created.id);
          setMessages([initialAssistantMessage]);
        }
      } catch (e) {
        console.error('세션 목록 불러오기 실패', e);
      }
    })();
  }, [getHeaders]);

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
                className={`${styles.historyItem} ${session.id === currentSessionId ? styles.activeHistory : ''
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
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session.id);
                  }}
                  aria-label="대화 세션 삭제"
                >
                  ×
                </button>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>BISTelligence AI</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 className={styles.title}>ChatGPT 스타일 어시스턴트</h1>
              {docs.length > 0 && (
                <div style={{ display: 'flex', gap: '5px' }}>
                  {docs.map((d) => (
                    <span
                      key={d.id}
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#e9ecef',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        color: '#495057',
                        border: '1px solid #ced4da',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      📄 {d.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className={styles.subtitle}>
              질문을 입력하고 대화 기록을 선택해 이어서 이야기하세요.
            </p>
          </div>
        </header>

        <div className={styles.messages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageRow} ${message.role === 'user' ? styles.user : styles.assistant
                }`}
            >
              <div className={styles.avatar}>
                {message.role === 'user' ? 'You' : 'AI'}
              </div>
              <div className={styles.bubble}>
                {/* remarkGfm 플러그인 적용: 테이블 등 GFM 지원 */}
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={scrollAnchorRef} />
        </div>
        {docs.length > 0 && (
          showDocChips && (
            <div className={styles.docChips}>
              {docs.map((doc) => (
                <span key={doc.id} className={styles.docChip}>
                  <span className={styles.docName}>{doc.name}</span>
                  <button
                    type="button"
                    onClick={() => setDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                    aria-label="문서 제거"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )
        )}

        <footer className={styles.inputBar}>
          <div className={styles.inputLeft}>
            <div className={styles.inputRow}>
              <div className={styles.plusWrap}>
                <button
                  className={styles.plusBtn}
                  type="button"
                  onClick={() => setShowActions((v) => !v)}
                  disabled={uploading || isSending}
                  aria-label="액션 열기"
                >
                  +
                </button>
                {showActions && (
                  <div className={styles.actionMenu}>
                    <button
                      type="button"
                      className={styles.actionItem}
                      onClick={() => {
                        setShowActions(false);
                        fileInputRef.current?.click();
                      }}
                      disabled={uploading || isSending}
                    >
                      <span className={styles.icon}>📄</span>
                      <span>PDF 업로드</span>
                    </button>

                    {/* [NEW] Chart Mode Toggle */}
                    <button
                      type="button"
                      className={`${styles.actionItem} ${isChartMode ? styles.active : ''}`}
                      onClick={() => {
                        setIsChartMode(!isChartMode);
                        setShowActions(false);
                      }}
                      style={{
                        backgroundColor: isChartMode ? '#e7f5ff' : 'transparent',
                        color: isChartMode ? '#fffff' : 'inherit',
                        marginTop: '5px'
                      }}
                    >
                      <span className={styles.icon}>📊</span>
                      <span>차트 그리기 {isChartMode ? '(ON)' : '(OFF)'}</span>
                    </button>
                  </div>
                )}
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                placeholder="메시지를 입력하세요..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                disabled={isSending}
                rows={1}
              />
            </div>
            {uploadError && <span className={styles.uploadError}>{uploadError}</span>}

            {/* 숨겨진 파일 입력 필드: PDF 업로드 처리 */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // 세션이 있어야 파일 업로드 가능
                if (!currentSessionId) {
                  setUploadError('대화 세션이 없습니다. 새 대화를 생성한 뒤 업로드해주세요.');
                  return;
                }
                setUploadError(null);
                setUploading(true);
                try {
                  // FormData를 사용하여 파일 전송
                  const form = new FormData();
                  form.append('file', file);
                  form.append('session_id', currentSessionId);
                  // POST /upload-pdf
                  const res = await fetch(`${CHAT_API_URL}/upload-pdf`, {
                    method: 'POST',
                    headers: { Authorization: getHeaders().Authorization || '' },
                    body: form,
                  });
                  if (!res.ok) {
                    const t = await res.text().catch(() => '');
                    throw new Error(`업로드 실패 (${res.status}): ${t}`);
                  }
                  // 업로드 성공 시 문서 목록 업데이트 및 칩 표시
                  const data = await res.json();
                  setDocs((prev) => [
                    ...prev,
                    {
                      id: data.document_id,
                      name: data.filename,
                      textLength: data.text_length,
                    },
                  ]);
                  setShowDocChips(true); // 새 업로드 시 다시 표시
                } catch (err: any) {
                  setUploadError(err?.message || '업로드 실패');
                } finally {
                  setUploading(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              }}
            />

          </div>
          <button
            type="button"
            onClick={isSending ? handleStop : handleSubmit}
            disabled={!input.trim() && !isSending}
          >
            {isSending ? '응답 중지' : '보내기'}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ChatBotPage;
