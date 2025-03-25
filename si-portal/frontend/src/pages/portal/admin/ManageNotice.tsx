import React, { useState, useContext, useRef, useEffect } from "react";
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
    { field: "title", headerName: "제목", sortable: true, filter: true, editable: true, width: 200 },
    { field: "content", headerName: "내용", sortable: true, filter: true, editable: true, width: 300 },
    {
        headerName: "시작일",
        field: "noticeStart",
        editable: true,
        filter: "agDateColumnFilter",
        cellEditor: "agDateCellEditor",
    },
    {
        headerName: "종료일",
        field: "noticeEnd",
        editable: true,
        filter: "agDateColumnFilter",
        cellEditor: "agDateCellEditor",
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
    const handleSave = async (lists: { deleteList: any[]; updateList: any[]; createList: any[] }) => {
        if (!gridRef.current) return;

        if (
            lists.deleteList.length === 0 &&
            lists.updateList.length === 0 &&
            lists.createList.length === 0
        ) {
            comAPIContext.showToast("저장할 데이터가 없습니다.", "dark");
            return;
        }

        try {
            comAPIContext.showProgressBar();
            console.log("업데이트 리스트:", lists.updateList);
            console.log("삭제 리스트:", lists.deleteList);
            console.log("생성 리스트:", lists.createList);

            // 날짜 데이터 변환 (yyyy-MM-dd HH:mm:ss)
            const formatDate = (date: string | Date | null | undefined): string | null => {
                if (!date) return null;
                const d = new Date(date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} 
            ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
            };

            lists.updateList.forEach((item) => {
                item.noticeStart = formatDate(item.noticeStart);
                item.noticeEnd = formatDate(item.noticeEnd);
            });

            lists.createList.forEach((item) => {
                item.noticeStart = formatDate(item.noticeStart);
                item.noticeEnd = formatDate(item.noticeEnd);
            });

            const payload = {
                updateList: lists.updateList,
                deleteList: lists.deleteList,
                createList: lists.createList,
            };

            console.log("서버로 전송할 데이터:", payload);

            const response = await axios.post(`${process.env.REACT_APP_BACKEND_IP}/notice/api/update-notices`, payload, {
                headers: { Authorization: `Bearer ${cachedAuthToken}` },
            });

            console.log("서버 응답:", response.data);

            if (response.data.messageCode === "success") {
                comAPIContext.showToast(response.data.message, "success");
                handleSearch(); // ✅ 저장 후 다시 조회
            } else {
                comAPIContext.showToast("저장 실패: " + response.data.message, "danger");
            }
        } catch (err) {
            console.error("공지사항 저장 실패:", err);
            comAPIContext.showToast("저장 중 오류 발생", "danger");
        } finally {
            comAPIContext.hideProgressBar();
        }
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

            {/* 🔹 공지사항 목록 (AG Grid) */}
            <Row className="container_contents">
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
