import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { SendHorizonal } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import styles from './ChatBot.module.scss';
import { cachedAuthToken } from '~store/AuthSlice';
interface Message {
  from: 'user' | 'bot';
  text: string;
}

const BACKEND_URL = 'http://localhost:8080/biz/chatbot/ask-stream';

interface IChatBotProps {
  visible: boolean;
  onClose: () => void;
}
// 아래 주소에서 clone > 8001 port로 서버 실행 > localhost:8001/docs build-vector-store 실행 > 서버 재시작 > 챗봇 사용 가능
// https://github.com/ryuwisdom/rag-chatbot

const logger = {
  info: console.log,
  error: console.error,
  warning: console.warn,
};

const ChatBot: React.FC<IChatBotProps> = (props) => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const currentAbortController = abortControllerRef.current;
    return () => {
      if (currentAbortController) {
        logger.info('컴포넌트 언마운트로 인해 진행 중인 요청 취소');
        currentAbortController.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const formatAndCleanBotResponse = useCallback((text: string): string => {
    let processedText = text;

    processedText = processedText.replace(/!.*[절대지침].*!:/gs, '').trim();

    // 숫자) 또는 숫자. 로 시작하는 각 항목을 새 줄로 분리하고 - 마커 추가
    processedText = processedText.replace(
      /\s*(\d+[.)])\s*/g,
      (match, p1) => `\n- ${p1.replace(/[.)]/, '')}) `
    ); // "1)" -> "\n- 1) " 또는 "1." -> "\n- 1. "

    const lines = processedText.split('\n');
    const newLines = lines
      .map((line) => {
        const trimmedLine = line.trim();
        // 이미 "- "로 시작하면 그대로 둠
        if (trimmedLine.startsWith('- ')) {
          return trimmedLine;
        }
        const listPattern = /^(\d+[.)])\s*(.*)/;
        const match = trimmedLine.match(listPattern);
        if (match) {
          return `- ${match[2].trim()}`;
        }
        return trimmedLine;
      })
      .filter((line) => line.length > 0); // 빈 줄 제거

    processedText = newLines.join('\n');

    // 3. 기타 정리 (연속된 공백 하나로, 시작/끝 공백 제거)
    processedText = processedText.replace(/\s\s+/g, ' ').trim();

    return processedText;
  }, []);

  const processStream = useCallback(
    async (stream: ReadableStream<Uint8Array>) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedResponse = ''; // 스트리밍 중 축적되는 원본 텍스트
      let firstChunkReceived = false;

      const updateBotMessage = (rawText: string, isFinal: boolean) => {
        // 스트리밍 중이거나 최종 업데이트 시 모두 포맷팅 함수를 통과시킵니다.
        const displayText = formatAndCleanBotResponse(rawText);

        setMessages((prev) => {
          const newMessages = [...prev];
          const botMessageIndex = newMessages.length - 1;
          if (
            newMessages[botMessageIndex] &&
            newMessages[botMessageIndex].from === 'bot'
          ) {
            // 로딩 메시지('답변 생성 중...')를 첫 청크로 교체하거나,
            // 이후 청크들을 이어붙이거나, 최종 메시지로 업데이트합니다.
            if (!firstChunkReceived || isFinal) {
              newMessages[botMessageIndex] = {
                ...newMessages[botMessageIndex],
                text: displayText,
              };
              if (!isFinal && displayText !== '생각 중...')
                firstChunkReceived = true;
            } else {
              newMessages[botMessageIndex].text = displayText; // 스트리밍 중 계속 업데이트
            }
          }
          return newMessages;
        });
      };

      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            logger.info('스트림 정상 종료 (done 플래그)');
            // 최종적으로 accumulatedResponse에 대해 포맷팅 및 클리닝 적용
            updateBotMessage(accumulatedResponse, true);
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data:')) {
              const textData = line.substring(5).trim();
              if (textData === '[DONE]') {
                logger.info('스트리밍 완료 ([DONE] 수신, 추가 처리 없음)');
                // [DONE] 신호는 스트림의 끝을 의미하므로,
                // 위 done 플래그가 true가 될 때 최종 업데이트됨.
                continue;
              }
              accumulatedResponse += textData;
              // 스트리밍 중에도 매번 포맷팅된 텍스트로 UI 업데이트
              updateBotMessage(accumulatedResponse, false);
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          logger.info('스트림 처리가 사용자에 의해 중단되었습니다.');
          updateBotMessage('요청이 취소되었습니다.', true);
        } else {
          logger.error('스트림 처리 중 오류:', err);
          updateBotMessage(
            `오류: ${err.message || '알 수 없는 스트림 오류가 발생했습니다.'}`,
            true
          );
        }
      }
    },
    [formatAndCleanBotResponse]
  );

  const mutation = useMutation<ReadableStream<Uint8Array>, Error, string>({
    mutationFn: async (userQuestion: string) => {
      if (abortControllerRef.current) {
        logger.info('Mutation 시작 전, 이전 요청 취소');
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Connection: 'keep-alive',
          Authorization: `Bearer ${cachedAuthToken}`,
        },
        body: JSON.stringify({ question: userQuestion }),
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: `HTTP 오류: ${response.status}` }));
        throw new Error(errorData.detail || `HTTP 오류: ${response.status}`);
      }
      if (!response.body) throw new Error('스트림 응답을 받지 못했습니다.');
      return response.body;
    },
    onSuccess: (stream) => {
      processStream(stream);
    },
    onError: (error) => {
      logger.error('API 호출 오류 (mutation):', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastBotMessageIndex = newMessages.length - 1;
        if (newMessages[lastBotMessageIndex]?.from === 'bot') {
          newMessages[lastBotMessageIndex].text =
            `오류: ${error.message || '알 수 없는 오류'}`;
        } else {
          newMessages.push({
            from: 'bot',
            text: `오류: ${error.message || '알 수 없는 오류'}`,
          });
        }
        return newMessages;
      });
    },
    onSettled: () => {
      abortControllerRef.current = null;
      logger.info('Mutation settled, AbortController 해제됨.');
    },
  });

  const handleSend = useCallback(async () => {
    if (!input.trim() || mutation.isPending) return;
    const userQuestion = input;
    setInput('');
    setMessages((prev) => [
      ...prev,
      { from: 'user', text: userQuestion },
      { from: 'bot', text: '생각중...' },
    ]);
    mutation.mutate(userQuestion);
  }, [input, mutation]);

  if (!props.visible) return null;

  return (
    <div className={styles.chatbot}>
      <header className={styles.header}>
        <div className={styles.title}>인사 및 복리후생 지원규정 챗봇</div>
        <button className={styles.closeBtn} onClick={props.onClose}>
          ✕
        </button>
      </header>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${msg.from === 'user' ? styles.user : styles.bot}`}
          >
            {msg.from === 'bot' &&
            mutation.isPending &&
            index === messages.length - 1 &&
            msg.text === '답변 생성 중...' ? (
              <span>{msg.text}</span>
            ) : (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* FileUpload 기능 사용 시 주석 해제
      {showUpload && <FileUpload onUploadSuccess={handleUploadSuccess} />}
      */}
      <div className={styles.inputArea}>
        {/* FileUpload 버튼 (SCSS에 스타일 정의 필요)
        <Button
          onClick={() => setShowUpload(!showUpload)}
          variant="outline-secondary"
          className={styles.fileUploadButton} // SCSS 모듈 사용 시
        >
          <FontAwesomeIcon icon={faPlusSquare} />
        </Button>
        */}
        <input
          type="text"
          placeholder="Reply..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (
              e.key === 'Enter' &&
              !e.nativeEvent.isComposing &&
              !mutation.isPending
            ) {
              handleSend();
            }
          }}
          disabled={mutation.isPending}
        />
        <button
          onClick={handleSend}
          disabled={mutation.isPending || !input.trim()}
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
