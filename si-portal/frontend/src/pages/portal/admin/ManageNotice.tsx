import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import axios from "axios";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import ComButton from "~pages/portal/buttons/ComButton";
import { cachedAuthToken } from "~store/AuthSlice";

interface Notice {
    id: number;
    title: string;
    content: string;
    noticeStart: string;
    noticeEnd: string;
    fileId?: number;
    file?: {
        fileName: string;
        filePath: string;
    };
}

const columnDefs = [
    { field: "id", headerName: "ID", sortable: true, filter: true, editable: false, width: 100 },
    { field: "title", headerName: "제목", sortable: true, filter: true, editable: true, flex: 1 },
    { field: "noticeStart", headerName: "시작일", sortable: true, filter: true, editable: true, width: 150 },
    { field: "noticeEnd", headerName: "종료일", sortable: true, filter: true, editable: true, width: 150 },
    { field: "createdAt", headerName: "생성일", sortable: true, filter: true, width: 200 },
    { field: "updatedAt", headerName: "수정일", sortable: true, filter: true, width: 200 },
];

const ManageNotice: React.FC = () => {
    console.log("ManageNotice 생성됨.");

    const gridRef = useRef<AgGridWrapperHandle>(null);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [newNotice, setNewNotice] = useState({ title: "", content: "", noticeStart: "", noticeEnd: "" });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const now = new Date();

    const activeNotices = notices.filter((notice) => {
        return new Date(notice.noticeEnd) > now; // ✅ `notice_end`이 지나지 않은 공지사항만 표시
    });

    useEffect(() => {
        fetchNotices();
    }, []);

    // 🔹 공지사항 목록 조회
    const fetchNotices = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_IP}/admin/api/get-notices-list`,
                {
                    headers: {
                        Authorization: `Bearer ${cachedAuthToken}`,
                    },
                }
            );

            if (gridRef.current) {
                gridRef.current.setRowData(response.data);
            }

            setNotices(response.data); // ✅ 타입이 지정된 상태에서 설정

        } catch (error) {
            console.error("공지사항 불러오기 실패:", error);
        }
    };

    // 🔹 입력 값 변경 처리
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewNotice({ ...newNotice, [e.target.name]: e.target.value });
    };

    // 🔹 공지 추가
    const addNotice = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_IP}/admin/api/add-notice`,
                null, // ✅ body 없이 params 사용
                {
                    params: {
                        title: newNotice.title,
                        content: newNotice.content,
                        noticeStart: new Date(newNotice.noticeStart).toISOString(), // ✅ ISO 8601 형식 변환
                        noticeEnd: new Date(newNotice.noticeEnd).toISOString(),
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            );

            setNewNotice({ title: "", content: "", noticeStart: "", noticeEnd: "" });
            fetchNotices();
        } catch (error) {
            console.error("공지사항 추가 실패:", error);
        }
    };

    // 🔹 공지 삭제
    const handleDelete = useCallback((selectedRows: any[]) => {
        if (!selectedRows.length) {
            alert("삭제할 데이터가 없습니다.");
            return;
        }

        const deleteIds = selectedRows.map(item => item.id).join(","); // ✅ 리스트를 ','로 연결하여 파라미터로 전달
        axios
            .post(`${process.env.REACT_APP_BACKEND_IP}/admin/api/delete-notices`,
                null,  // ✅ body 없이 params로 전달
                {
                    params: { ids: deleteIds },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                    },
                }
            )
            .then(response => {
                alert("삭제 완료!");
                fetchNotices();
            })
            .catch(error => console.error("공지사항 삭제 실패:", error));
    }, []);

    const filteredNotices = notices.filter((notice) => {
        return new Date(notice.noticeEnd) > new Date(); // ✅ `notice_end`이 지나면 숨김
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append("title", newNotice.title);
            formData.append("content", newNotice.content);
            formData.append("noticeStart", newNotice.noticeStart);
            formData.append("noticeEnd", newNotice.noticeEnd);
            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            await axios.post(`${process.env.REACT_APP_BACKEND_IP}/admin/api/add-notice`, formData, {
                headers: {
                    Authorization: `Bearer ${cachedAuthToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            fetchNotices();
        } catch (error) {
            console.error("공지사항 추가 실패:", error);
        }
    };

    return (
        <Container fluid className="h-100 container_bg">
            <Row className="container_title">
                <Col>
                    <h2>공지사항 관리</h2>
                </Col>
            </Row>
            <Row className="container_contents">
                {/* 🔹 공지 추가 입력 필드 */}
                <Row className="search_wrap">
                    <Col className="search_cnt">
                        <Form.Group as={Row}>
                            <Form.Label column sm={1}>제목</Form.Label>
                            <Col sm={3}>
                                <Form.Control type="text" name="title" value={newNotice.title} onChange={handleChange} />
                            </Col>
                            <Form.Label column sm={1}>시작일</Form.Label>
                            <Col sm={2}>
                                <Form.Control type="date" name="noticeStart" value={newNotice.noticeStart} onChange={handleChange} />
                            </Col>
                            <Form.Label column sm={1}>종료일</Form.Label>
                            <Col sm={2}>
                                <Form.Control type="date" name="noticeEnd" value={newNotice.noticeEnd} onChange={handleChange} />
                            </Col>
                        </Form.Group>
                    </Col>
                    <Col className="search_btn">
                        <ComButton size="sm" variant="primary" onClick={addNotice}>추가</ComButton>
                    </Col>
                </Row>

                {/* 🔹 공지사항 목록 (AgGrid) */}
                <Row className="contents_wrap">
                    <Col>
                        <AgGridWrapper
                            ref={gridRef}
                            showButtonArea={true}
                            canCreate={true}
                            canDelete={true}
                            canUpdate={true}
                            columnDefs={columnDefs}
                            enableCheckbox={true}
                            onDelete={handleDelete} // 삭제 버튼 동작
                        />
                    </Col>
                </Row>
            </Row>
        </Container>
    );
};

export default ManageNotice;
