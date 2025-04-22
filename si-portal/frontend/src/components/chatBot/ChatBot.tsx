import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ChatBot.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons';
import { cachedAuthToken } from '~store/AuthSlice';

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
  if (!visible) return null;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userQuestion = input;
    setInput('');

    // 1. user와 bot(작성중...) 메시지를 한 번에 넣기
    setMessage((prev) => [
      ...prev,
      { from: 'user', text: userQuestion },
      { from: 'bot', text: '작성중...' },
    ]);

    try {
      const response = await axios.post(
        'http://localhost:8080/biz/chatbot/ask',
        { question: userQuestion },
        {
          headers: {
            Authorization: `Bearer ${cachedAuthToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const answer = response.data || '답변을 불러올 수 없습니다.';

      // 2. 가장 마지막 bot 메시지를 실제 답변으로 대체
      setMessage((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { from: 'bot', text: answer };
        return newMessages;
      });
    } catch (err) {
      console.error(err);
      setMessage((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          from: 'bot',
          text: '답변을 가져오는 데 실패했어요.',
        };
        return newMessages;
      });
    }
  };

  // const handleSend = async () => {
  //   if (!input.trim()) return;
  //   try {
  //     const answer = await sendQuestion(input);
  //     setMessage((prev) => [...prev, { from: 'user', text: input }]);
  //   } catch (err) {
  //     console.error(err);
  //     setMessage((prev) => [
  //       ...prev,
  //       { from: 'bot', text: '에러가 발생했어요.' },
  //     ]);
  //   }
  //   //   setMessage((prev) => [...prev, {from: 'user', text: input}])
  //   //   setInput('')
  //   //   setIsLoading(true);
  //   //
  //   // const answer = await sendQuestion(input)
  //   // setMessage(prev => [...prev, { from: 'bot', text: answer }])
  //   //   setIsLoading(false);
  // };

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
      <div className={styles.inputArea}>
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
      </div>
    </div>
  );
};

export default ChatBot;
