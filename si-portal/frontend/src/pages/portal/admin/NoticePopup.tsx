import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cachedAuthToken } from '~store/AuthSlice';
import { ComAPIContext } from '~components/ComAPIContext';

interface Notice {
  id: number;
  title: string;
  content: string;
  noticeStart: string;
  noticeEnd: string;
}

interface NoticePopupProps {
  handleClose: () => void;
  isToast: boolean;
}

const NoticePopup: React.FC<NoticePopupProps> = ({ handleClose, isToast }) => {
  const [show, setShow] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const comAPIContext = useContext(ComAPIContext);

  useEffect(() => {
    const hideNotice = localStorage.getItem('hideNoticePopup');
    if (hideNotice === new Date().toLocaleDateString()) return;

    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await axios.get<Notice[]>(
        `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-notices-list`,
        {
          headers: { Authorization: `Bearer ${cachedAuthToken}` },
        }
      );

      const activeNotices = response.data.filter(
        (n) => new Date(n.noticeEnd) > new Date()
      );

      if (activeNotices.length > 0) {
        setNotices(activeNotices);
        setShow(true);
      } else if (activeNotices.length === 0 && isToast) {
          comAPIContext.showToast(
            comAPIContext.$msg(
              'message',
              '등록된 공지사항이 없습니다.',
              '등록된 공지사항이 없습니다.'
            ),
          'dark'
        );
      }
    } catch (error) {
      console.error('공지사항 불러오기 실패:', error);
    }
  };

  const handleDoNotShowToday = () => {
    localStorage.setItem('hideNoticePopup', new Date().toLocaleDateString());
    setShow(false);
  };

  const handleNext = () => {
    if (currentPage < notices.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      dialogClassName="notice-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>공지사항</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {notices.length > 0 ? (
          <>
            <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>
              {notices[currentPage].title}
            </h4>
            <hr />
            <div style={{ fontSize: '16px', color: '#444', whiteSpace: 'pre-wrap' }}>
              <ReactQuill
                value={notices[currentPage].content}
                readOnly={true}
                theme="snow"
                modules={{ toolbar: false }}
              />
            </div>
            <div className="d-flex justify-content-between mt-4">
              <Button variant="light" onClick={handlePrev} disabled={currentPage === 0}>
                ◀ 이전
              </Button>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {currentPage + 1} / {notices.length}
              </span>
              <Button variant="light" onClick={handleNext} disabled={currentPage === notices.length - 1}>
                다음 ▶
              </Button>
            </div>
          </>
        ) : (
          <p>공지사항이 없습니다.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleDoNotShowToday}>
          오늘 다시 보지 않기
        </Button>
        <Button variant="primary" onClick={handleClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>

  );
};

export default NoticePopup;
