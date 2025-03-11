import React, { useState, useContext, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Container, Row, Col, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ComAPIContext } from "~components/ComAPIContext";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import axios from "axios";
import { RootState } from "~store/Store";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import ComButton from "~pages/portal/buttons/ComButton";
import { cachedAuthToken } from "~store/AuthSlice";
import { useSelector } from "react-redux";
import { ICellRendererParams } from "ag-grid-community"; // ag-Grid의 타입 불러오기

interface Notice {
    id: number;
    title: string;
    content: string;
    noticeStart: string;
    noticeEnd: string;
    fileId?: number;
}

const columnDefs = [
    { field: "id", headerName: "ID", sortable: true, filter: true, editable: false, width: 100 },
    { field: "title", headerName: "제목", sortable: true, filter: true, editable: true, flex: 1 },
    {
        headerName: "시작일",
        field: "noticeStart",
        editable: true,
        cellRenderer: (params: ICellRendererParams) => {
            return (
                <DatePicker
                    selected={params.value ? new Date(params.value) : null}
                    onChange={(date) => {
                        params.node.setData({
                            ...params.data,
                            noticeStart: date ? date.toISOString().split("T")[0] : null
                        });
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                />
            );
        },
    },
    {
        headerName: "종료일",
        field: "noticeEnd",
        editable: true,
        cellRenderer: (params: ICellRendererParams) => {
            return (
                <DatePicker
                    selected={params.value ? new Date(params.value) : null}
                    onChange={(date) => {
                        params.node.setData({
                            ...params.data,
                            noticeEnd: date ? date.toISOString().split("T")[0] : null
                        });
                    }}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                />
            );
        },
    },
    {
        field: "createdAt",
        headerName: "생성일",
        sortable: true,
        filter: true,
        width: 200,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : "-",
    },
    {
        field: "updatedAt",
        headerName: "수정일",
        sortable: true,
        filter: true,
        width: 200,
        valueFormatter: (params: any) => params.value ? new Date(params.value).toLocaleDateString() : "-",
    },
];

const ManageNotice: React.FC = () => {
    console.log("ManageNotice 생성됨.");

    const state = useSelector((state: RootState) => state.auth);
    const canCreate = useSelector((state: RootState) => state.auth.pageButtonAuth.canCreate);
    const canDelete = useSelector((state: RootState) => state.auth.pageButtonAuth.canDelete);
    const canUpdate = useSelector((state: RootState) => state.auth.pageButtonAuth.canUpdate);
    const comAPIContext = useContext(ComAPIContext);

    const gridRef = useRef<AgGridWrapperHandle>(null);

    const [newNotice, setNewNotice] = useState<{
        title: string;
        content: string;
        noticeStart: Date | null;
        noticeEnd: Date | null;
    }>({
        title: "",
        content: "",
        noticeStart: null,
        noticeEnd: null,
    });


    useEffect(() => {
        handleSearch();
    }, []);

    // 🔹 공지사항 조회
    const handleSearch = async () => {
        if (!cachedAuthToken) {
            comAPIContext.showToast("인증이 만료되었습니다. 다시 로그인해주세요.", "danger");
            window.location.href = "/login";
            return;
        }

        comAPIContext.showProgressBar();

        axios.get(`${process.env.REACT_APP_BACKEND_IP}/notice/api/get-notices`, {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
        })
            .then((res) => {
                if (gridRef.current) {
                    res.data.forEach((notice: any) => {
                        notice.gridRowId = `${notice.id}-${new Date().getTime()}`;
                    });
                    gridRef.current.setRowData(res.data);
                }
                comAPIContext.showToast("공지사항 조회 완료!", "success");
            })
            .catch((err) => {
                console.error("공지사항 조회 실패:", err);
                comAPIContext.showToast("공지사항 조회 실패", "danger");
            })
            .finally(() => {
                comAPIContext.hideProgressBar();
            });
    };

    // 🔹 공지사항 저장
    const handleSave = async () => {
        if (!cachedAuthToken) {
            comAPIContext.showToast("인증이 만료되었습니다. 다시 로그인해주세요.", "danger");
            window.location.href = "/login";
            return;
        }

        const payload = {
            ...newNotice,
            noticeStart: newNotice.noticeStart ? newNotice.noticeStart.toISOString() : null,
            noticeEnd: newNotice.noticeEnd ? newNotice.noticeEnd.toISOString() : null,
        };


        comAPIContext.showProgressBar();

        axios.post(`${process.env.REACT_APP_BACKEND_IP}/notice/api/update-notices`, payload, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cachedAuthToken}`,
            },
        })
            .then((res) => {
                if (res.data.messageCode === "success") {
                    comAPIContext.showToast(res.data.message, "success");
                    handleSearch(); // ✅ 저장 후 다시 조회
                } else {
                    comAPIContext.showToast("저장 실패: " + res.data.message, "danger");
                }
            })
            .catch((err) => {
                console.error("공지사항 저장 실패:", err);
                comAPIContext.showToast("저장 중 오류 발생", "danger");
            })
            .finally(() => {
                comAPIContext.hideProgressBar();
            });
    };

    // 🔹 공지사항 삭제
    const handleDelete = async () => {
        if (!gridRef.current) return;

        if (!cachedAuthToken) {
            comAPIContext.showToast("인증이 만료되었습니다. 다시 로그인해주세요.", "danger");
            window.location.href = "/login";
            return;
        }

        const selectedRows = gridRef.current?.gridApi?.getSelectedRows();
        if (!selectedRows || selectedRows.length === 0) {
            comAPIContext.showToast("삭제할 데이터를 선택하세요.", "dark");
            return;
        }

        const deleteIds = selectedRows.map((row: Notice) => row.id);

        comAPIContext.showProgressBar();

        axios.post(`${process.env.REACT_APP_BACKEND_IP}/notice/api/delete-notices`, { deleteIds }, {
            headers: { Authorization: `Bearer ${cachedAuthToken}` },
        })
            .then(() => {
                comAPIContext.showToast("공지사항 삭제 완료!", "success");
                handleSearch(); // ✅ 삭제 후 다시 조회
            })
            .catch((err) => {
                console.error("공지사항 삭제 실패:", err);
                comAPIContext.showToast("삭제 중 오류 발생", "danger");
            })
            .finally(() => {
                comAPIContext.hideProgressBar();
            });
    };


    return (
        <Container fluid className="h-100 container_bg">
            {/* 🔹 타이틀 영역 */}
            <Row className="container_title">
                <Col><h2>공지사항 관리</h2></Col>
            </Row>

            {/* 🔹 입력 필드 영역 */}
            <Row className="contents_wrap">
                <Col md={3}>
                    <label>제목:</label>
                    <input
                        type="text"
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                        className="form-control"
                        placeholder="공지 제목 입력"
                    />
                </Col>

                <Col md={3}>
                    <label>시작일:</label>
                    <DatePicker
                        selected={newNotice.noticeStart ? new Date(newNotice.noticeStart) : null} // ✅ `Date` 타입 유지
                        onChange={(date: Date | null) => setNewNotice({ ...newNotice, noticeStart: date })}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                    />
                </Col>

                <Col md={3}>
                    <label>종료일:</label>
                    <DatePicker
                        selected={newNotice.noticeEnd ? new Date(newNotice.noticeEnd) : null} // ✅ `Date` 타입 유지
                        onChange={(date: Date | null) => setNewNotice({ ...newNotice, noticeEnd: date })}
                        dateFormat="yyyy-MM-dd"
                        className="form-control"
                    />
                </Col>

                <Col md={3} className="text-end">
                    {/* 🔹 저장 버튼 */}
                    <ComButton size="sm" variant="primary" onClick={handleSave}>추가</ComButton>
                </Col>
            </Row>

            {/* 🔹 공지사항 목록 (AG Grid) */}
            <Row className="contents_wrap">
                <Col>
                    <AgGridWrapper
                        ref={gridRef}
                        canCreate={canCreate}
                        canDelete={canDelete}
                        canUpdate={canUpdate}
                        columnDefs={columnDefs}
                        enableCheckbox={true}
                        rowSelection="multiple"
                        onSave={handleSave}
                        onDelete={handleDelete}
                    />
                </Col>
            </Row>
        </Container>
    );

};

export default ManageNotice;
