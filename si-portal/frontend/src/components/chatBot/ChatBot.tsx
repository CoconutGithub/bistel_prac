import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ChatBot.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faPlusSquare,
} from '@fortawesome/free-regular-svg-icons';
import { cachedAuthToken } from '~store/AuthSlice';
import { Button } from 'react-bootstrap';
import FileUpload from '~components/chatBot/fileUpload/FileUpload';

interface IChatBotProps {
  visible: boolean;
  onClose: () => void;
}
// 아래 주소에서 clone 후 8001 port로 실행 후 챗봇 사용 가능
// https://github.com/ryuwisdom/rag-chatbot

const ChatBot: React.FC<IChatBotProps> = ({ visible, onClose }) => {
  const [messages, setMessage] = useState<
    { from: 'user' | 'bot'; text: string }[]
  >([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUpload, setShowUpload] = useState<boolean>(false);

  if (!visible) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userQuestion = input;
    setInput('');

    setMessage((prev) => [
      ...prev,
      { from: 'user', text: userQuestion },
      { from: 'bot', text: '작성중...' },
    ]);

    try {
      const controller = new AbortController();
      const response = await fetch(
        'http://localhost:8080/biz/chatbot/ask-stream',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cachedAuthToken}`,
            'Content-Type': 'application/json',
            Connection: 'keep-alive',
          },
          body: JSON.stringify({ question: userQuestion }),
          signal: controller.signal,
        }
      );

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      if (!response.body) throw new Error('스트림 리더 초기화 실패');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('정상 종료');
          setMessage((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              from: 'bot',
              text: fullText || '답변 완료',
            };
            return newMessages;
          });
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const text = line.replace(/^data:\s*/, '');
            if (!text.trim()) continue;

            if (text === '[DONE]') {
              console.log('스트리밍 완료');
              setMessage((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  from: 'bot',
                  text: fullText || '답변 완료',
                };
                return newMessages;
              });
              return; // 루프 종료 및 reader 해제
            }

            fullText += text;
            setMessage((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = {
                from: 'bot',
                text: fullText,
              };
              return newMessages;
            });
            // return;
          }
        }
      }
    } catch (err) {
      console.error('스트리밍 중 오류:', err);
      setMessage((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          from: 'bot',
          text: `답변 중 오류가 발생했습니다: ${err}`,
        };
        return newMessages;
      });
    } finally {
      let controller: any = new AbortController();
      controller.abort(); // 명시적으로 연결 종료
      controller = null; // 메모리 누수 방지
    }
  };

  const handleUploadSuccess = () => {
    setMessage((prev: any) => [
      ...prev,
      { from: 'bot', text: '파일이 성공적으로 업로드되었습니다!' },
    ]);
    setShowUpload(false);
  };
  return (
    <div className={styles.chatbot}>
      <div className={styles.header}>
        <div className={styles.title}>ChatFlow</div>
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>
      </div>
      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.from]}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {showUpload && <FileUpload onUploadSuccess={handleUploadSuccess} />}
      <div className={styles.inputArea}>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          variant="outline-secondary"
          className="ms-2, mt-2"
        >
          <FontAwesomeIcon icon={faPlusSquare} />
        </Button>
        <input
          type="text"
          placeholder="Reply..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
        {/*<Button*/}
        {/*  onClick={() => setShowUpload(!showUpload)}*/}
        {/*  variant="outline-secondary"*/}
        {/*  className="ms-2"*/}
        {/*>*/}
        {/*  <FontAwesomeIcon icon={faPlusSquare} />*/}
        {/*</Button>*/}
      </div>
    </div>
  );
};

export default ChatBot;
