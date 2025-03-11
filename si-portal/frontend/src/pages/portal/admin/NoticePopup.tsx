import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { cachedAuthToken } from "~store/AuthSlice";

interface Notice {
    id: number;
    title: string;
    content: string;
    noticeStart: string;
    noticeEnd: string;
}

const NoticePopup: React.FC = () => {
    const [show, setShow] = useState(false);
    const [notice, setNotice] = useState<Notice | null>(null);

    useEffect(() => {
        const hideNotice = localStorage.getItem("hideNoticePopup");
        if (hideNotice === new Date().toLocaleDateString()) return;

        fetchLatestNotice();
    }, []);

    const fetchLatestNotice = async () => {
        try {
            const response = await axios.get<Notice[]>(`${process.env.REACT_APP_BACKEND_IP}/admin/api/get-notices-list`, {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
            });

            const activeNotices = response.data.filter((n) => new Date(n.noticeEnd) > new Date());
            if (activeNotices.length > 0) {
                setNotice(activeNotices[0]); // 가장 최신 공지사항만 표시
                setShow(true);
            }
        } catch (error) {
            console.error("공지사항 불러오기 실패:", error);
        }
    };

    const handleClose = () => setShow(false);

    const handleDoNotShowToday = () => {
        localStorage.setItem("hideNoticePopup", new Date().toLocaleDateString());
        setShow(false);
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>📢 공지사항</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {notice ? (
                    <>
                        <h5>{notice.title}</h5>
                        <p>{notice.content}</p>
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
