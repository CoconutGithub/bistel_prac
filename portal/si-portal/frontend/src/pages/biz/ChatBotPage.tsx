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
  // [NEW] AI 쿼리 모드 상태
  const [isQueryMode, setIsQueryMode] = useState(false);

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


      // --- AI QUERY MODE EXECUTION ---
      if (isQueryMode) {
        // [FIX] 사용자 질문 DB 저장 (Query Mode에서도 질문 이력 남기기 위함)
        await fetch(`${CHAT_API_URL}/sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ role: 'user', content: text }),
        });

        upsertAssistantMessage(assistantId, () => '질문을 분석하여 적절한 데이터 조회 API를 찾고 있습니다...');

        try {
          // 1. Define Available APIs (Specialized)
          const AVAILABLE_APIS = [
            {
              id: "search_bar_high_yield",
              description: "강봉(Bar) 중 수율이 '일정 수준 이상'(>= min_yield)인 데이터 조회",
              url: "http://localhost:8080/biz/query/bar/high-yield",
              params: ["min_yield"]
            },
            {
              id: "search_bar_low_yield",
              description: "강봉(Bar) 중 수율이 '일정 수준 이하'(<= max_yield)인 데이터 조회",
              url: "http://localhost:8080/biz/query/bar/low-yield",
              params: ["max_yield"]
            },
            {
              id: "search_pipe_low_yield",
              description: "강관(Pipe) 중 수율이 '일정 수준 이하'(<= max_yield)인 데이터 조회 (기간 지정 가능)",
              url: "http://localhost:8080/biz/query/pipe/low-yield",
              params: ["start_date", "end_date", "max_yield"]
            },
            {
              id: "search_pipe_high_yield",
              description: "강관(Pipe) 중 수율이 '일정 수준 이상'(>= min_yield)인 데이터 조회 (기간 지정 가능)",
              url: "http://localhost:8080/biz/query/pipe/high-yield",
              params: ["start_date", "end_date", "min_yield"]
            },
            {
              id: "search_excess_production",
              description: "계획보다 과잉 생산된(Excess Y) 로트 목록 조회",
              url: "http://localhost:8080/biz/query/excess",
              params: ["product_type"]
            }
          ];

          // 2. Construct Prompt for API Selection & Variable Extraction
          const apiDescriptions = AVAILABLE_APIS.map(api => `- ID: ${api.id}, 설명: ${api.description}`).join('\n');
          const selectionPrompt = `
            사용자의 질문을 분석하여 가장 적절한 API를 선택하고, 필요한 변수를 추출하여 JSON으로 반환하세요.
            
            [사용 가능한 API 목록]
            ${apiDescriptions}
            
            [규칙]
            1. 사용자가 "X 이상", "X 보다 큰", "높은" 등을 언급하면 'high_yield' API를 선택하고 'min_yield' 변수를 추출하세요.
            2. 사용자가 "X 이하", "X 보다 작은", "낮은", "불량" 등을 언급하면 'low_yield' API를 선택하고 'max_yield' 변수를 추출하세요.
            3. 강관(Pipe) 조회 시 날짜가 명시되지 않았다면, 전체 기간(예: 2020-01-01 ~ 2099-12-31)을 기본값으로 사용하세요.
            
            [추출할 변수 가이드]
            - product_type: 'bar'(강봉) 또는 'pipe'(강관)
            - min_yield: 최소 수율 (예: 30, 80) -> '이상' 조건일 때 사용
            - max_yield: 최대 수율 (예: 30, 80) -> '이하' 조건일 때 사용
            - start_date, end_date: 조회 기간 (YYYY-MM-DD)
            
            [사용자 질문]
            ${text}
            
            [응답 형식]
            오직 JSON 문자열만 반환하세요.
            예시: {"apiId": "search_bar_high_yield", "variables": {"min_yield": 80}}
            만약 적절한 API가 없다면 "apiId"를 null로 반환하세요.
          `;

          // 3. Call AI for Analysis
          const analysisRes = await fetch(`${CHAT_API_URL}/completions`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              messages: [{ role: 'system', content: 'You are an intelligent API selector.' }, { role: 'user', content: selectionPrompt }],
              stream: false,
              model: 'gpt-4o-mini',
              session_id: sessionId, // [FIX] 새 세션 생성 방지
              save_history: false    // [FIX] 히스토리 저장 방지 (백엔드 지원 시)
            }),
          });

          if (!analysisRes.ok) throw new Error('AI 분석 요청 실패');

          const analysisData = await analysisRes.json();
          let content = analysisData.choices?.[0]?.message?.content || '{}';
          content = content.replace(/```json/g, '').replace(/```/g, '').trim();
          const analysisResult = JSON.parse(content);

          if (!analysisResult.apiId) {
            upsertAssistantMessage(assistantId, () => '질문에 적합한 조회 기능을 찾을 수 없습니다. 일반 대화로 넘어갑니다.');
            // Fallback to standard chat? Or just stop? Let's stop for now as per "Query Mode".
            setIsSending(false);
            return;
          }

          const selectedApi = AVAILABLE_APIS.find(api => api.id === analysisResult.apiId);
          if (!selectedApi) throw new Error('선택된 API ID가 유효하지 않습니다.');

          // 4. Call the Selected API
          upsertAssistantMessage(assistantId, () => `선택된 기능: ${selectedApi.id}\n변수: ${JSON.stringify(analysisResult.variables)}\n\n데이터를 조회중입니다...`);

          const apiRes = await fetch(selectedApi.url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(analysisResult.variables), // Send extracted variables directly
            signal: abortControllerRef.current.signal,
          });

          if (!apiRes.ok) {
            const errorText = await apiRes.text();
            throw new Error(`API 호출 실패: ${errorText}`);
          }

          const apiResult = await apiRes.json();

          // 5. Render Result
          // Assuming apiResult structure is similar to previous { data: [], columns: [], sql: ... }
          // If backend isn't ready, this might fail, but this is the impl.
          let finalAnswer = '';
          if (apiResult.error) {
            finalAnswer = `오류가 발생했습니다: ${apiResult.error}`;
          } else if (!apiResult.data || apiResult.data.length === 0) {
            finalAnswer = '조회된 결과가 없습니다.';
          } else {
            // [FIX] 데이터 과다로 인한 렌더링 이슈 방지 (상위 20건 제한)
            const MAX_ROWS = 20;
            let displayData = apiResult.data;
            let truncationNote = '';

            if (displayData.length > MAX_ROWS) {
              displayData = displayData.slice(0, MAX_ROWS);
              truncationNote = `\n\n*(데이터가 너무 많아 상위 ${MAX_ROWS}건만 표시됩니다. 전체 데이터는 별도 조회를 이용하세요)*`;
            }

            const mkTable = convertJsonToMarkdownTable(displayData, undefined, apiResult.sql);
            finalAnswer = `### 조회 결과\n${mkTable}${truncationNote}`;
          }

          upsertAssistantMessage(assistantId, () => finalAnswer);

          // Save bot message history
          await fetch(`${CHAT_API_URL}/sessions/${sessionId}/messages`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ role: 'assistant', content: finalAnswer }),
          });

        } catch (error: any) {
          console.error('Query Mode Error', error);
          upsertAssistantMessage(assistantId, () => `쿼리 실행 중 오류가 발생했습니다: ${error.message}`);
        } finally {
          setIsSending(false);
          abortControllerRef.current = null;
        }
        return; // Exit sendMessage
      }

      // --- OLD KEYWORD CHECK (Disabled for Query Mode) ---
      // const hasSqlKeyword = /강봉|강관/i.test(text);
      // if (hasSqlKeyword) { ... }


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
      isChartMode, // [NEW] dependency
      isQueryMode
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
                opts={{ renderer: 'svg' }}
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
              <div
                key={session.id}
                className={`${styles.historyItem} ${session.id === currentSessionId ? styles.activeHistory : ''
                  }`}
                onClick={() => handleSelectSession(session)}
                style={{ cursor: 'pointer' }} // div로 변경됨에 따라 포인터 추가
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
              </div>
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

                    {/* [NEW] Query Mode Toggle */}
                    <button
                      type="button"
                      className={`${styles.actionItem} ${isQueryMode ? styles.active : ''}`}
                      onClick={() => {
                        setIsQueryMode(!isQueryMode);
                        setShowActions(false);
                      }}
                      style={{
                        backgroundColor: isQueryMode ? '#e7f5ff' : 'transparent',
                        color: isQueryMode ? '#fffff' : 'inherit',
                        marginTop: '5px'
                      }}
                    >
                      <span className={styles.icon}>🔍</span>
                      <span>AI 쿼리 실행 {isQueryMode ? '(ON)' : '(OFF)'}</span>
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
