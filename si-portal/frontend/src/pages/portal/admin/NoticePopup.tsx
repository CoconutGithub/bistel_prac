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
    const [notices, setNotices] = useState<Notice[]>([]);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const hideNotice = localStorage.getItem("hideNoticePopup");
        if (hideNotice === new Date().toLocaleDateString()) return;

        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const response = await axios.get<Notice[]>(`${process.env.REACT_APP_BACKEND_IP}/admin/api/get-notices-list`, {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
            });

            const activeNotices = response.data.filter((n) => new Date(n.noticeEnd) > new Date());
            if (activeNotices.length > 0) {
                setNotices(activeNotices);
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
        <Modal show={show} onHide={handleClose} centered size="lg"> {/* ✅ 팝업 크기 고정 */}
            <Modal.Header closeButton>
                <Modal.Title>공지사항</Modal.Title>
            </Modal.Header>
            <Modal.Body
                style={{
                    width: "700px",
                    minHeight: "500px", // ✅ 기본 높이 지정
                    maxHeight: "700px",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {notices.length > 0 ? (
                    <>
                        <h4 style={{ fontWeight: "bold", color: "#333", marginBottom: "15px" }}>
                            {notices[currentPage].title}
                        </h4>
                        <hr />
                        <div
                            style={{
                                flexGrow: 1,
                                minHeight: "400px",
                                maxHeight: "500px",
                                overflowY: "auto",
                                paddingRight: "10px",
                                fontSize: "16px",
                                color: "#444",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {notices[currentPage].content}
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                            <Button variant="light" onClick={handlePrev} disabled={currentPage === 0}>
                                ◀ 이전
                            </Button>
                            <span style={{ fontSize: "16px", fontWeight: "bold" }}>
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
