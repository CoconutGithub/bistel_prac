import React, { useState } from "react";
import { Modal, Button, Table, Dropdown } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ResumePopup_hdh = ({ show, resume, onClose }: any) => {
    const [printFormat, setPrintFormat] = useState<string>("PDF");

    if (!resume) return null;

    /** ✅ JSON 데이터가 undefined/null일 경우 기본값 [] 설정 */
    const skills = resume.skills ? JSON.parse(resume.skills) : [];
    const experiences = resume.experience ? JSON.parse(resume.experience) : [];
    const education = resume.education ? JSON.parse(resume.education) : [];
    const licenses = resume.license ? JSON.parse(resume.license) : [];
    const training = resume.training ? JSON.parse(resume.training) : [];

    /** ✅ PDF 변환 및 인쇄 (한글 깨짐 해결 + 줄바꿈 적용 + 페이지 정렬) */
    const printPDF = () => {
        const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
        let lastY = 20; // 테이블 위치 저장

        doc.setFont("helvetica"); // ✅ 한글 지원 폰트 설정
        doc.text(`이력서 - ${resume.fullName}`, 10, lastY);

        autoTable(doc, {
            startY: lastY + 5,
            head: [["항목", "내용"]],
            body: [
                ["이메일", resume.email || "정보 없음"],
                ["전화번호", resume.phone || "정보 없음"],
                ["성별", resume.gender || "정보 없음"],
                ["주소", resume.address || "정보 없음"],
                ["회사", resume.company || "정보 없음"],
                ["부서", resume.department || "정보 없음"],
                ["포지션", resume.position || "정보 없음"],
                ["직무", resume.jobTitle || "정보 없음"],
                ["군필 여부", resume.militaryService === "Y" ? "군필" : "미필"],
            ],
            margin: { top: 25 },
            styles: { font: "helvetica", fontSize: 10 },
            didDrawPage: (data) => { lastY = data.cursor?.y ? data.cursor.y + 10 : lastY; } // ✅ TypeScript 오류 해결
        });

        doc.text("💼 경력", 10, lastY);
        autoTable(doc, {
            startY: lastY + 5,
            head: [["회사", "직책", "기간", "주요 업무"]],
            body: experiences.length > 0
                ? experiences.map((exp: any) => [
                    exp.company || "정보 없음",
                    exp.position || "정보 없음",
                    `${exp.start_date || "정보 없음"} ~ ${exp.end_date || "현재"}`,
                    exp.responsibilities ? exp.responsibilities.join(", ") : "정보 없음"
                ])
                : [["경력 정보 없음", "", "", ""]],
            styles: { font: "helvetica", fontSize: 10 },
            didDrawPage: (data) => { lastY = data.cursor?.y ? data.cursor.y + 10 : lastY; }
        });

        doc.text("🎓 학력", 10, lastY);
        autoTable(doc, {
            startY: lastY + 5,
            head: [["학교", "입학일", "졸업일", "졸업 여부"]],
            body: education.length > 0
                ? education.map((edu: any) => [
                    edu.school || "정보 없음",
                    edu.schoolStart || "정보 없음",
                    edu.schoolEnd || "현재",
                    edu.graduateYn === "Y" ? "졸업" : "미졸업"
                ])
                : [["학력 정보 없음", "", "", ""]],
            styles: { font: "helvetica", fontSize: 10 }
        });

        doc.save(`이력서_${resume.fullName}.pdf`);
    };

    /** ✅ Excel 변환 후 다운로드 */
    const printExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet([resume]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "이력서");

        const excelData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    };

    /** ✅ Word 변환 후 다운로드 */
    const printWord = () => {
        const content = `
            <html>
            <head><title>이력서 - ${resume.fullName}</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="text-align: center;">이력서 - ${resume.fullName}</h2>
                <hr>
                <p><strong>이메일:</strong> ${resume.email || "정보 없음"}</p>
                <p><strong>전화번호:</strong> ${resume.phone || "정보 없음"}</p>
                <p><strong>성별:</strong> ${resume.gender || "정보 없음"}</p>
                <p><strong>주소:</strong> ${resume.address || "정보 없음"}</p>
                <p><strong>회사:</strong> ${resume.company || "정보 없음"}</p>
                <p><strong>부서:</strong> ${resume.department || "정보 없음"}</p>
                <p><strong>포지션:</strong> ${resume.position || "정보 없음"}</p>
                <p><strong>직무:</strong> ${resume.jobTitle || "정보 없음"}</p>
                <p><strong>군필 여부:</strong> ${resume.militaryService === "Y" ? "군필" : "미필"}</p>
            </body>
            </html>
        `;
        const blob = new Blob([content], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>📄 {resume.fullName} - 이력서</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: "30px", backgroundColor: "#ffffff" }}>

                {/* ✅ 기본 정보 */}
                <h4>📌 기본 정보</h4>
                <Table bordered size="sm">
                    <tbody>
                    <tr><th>이름</th><td>{resume.fullName || "정보 없음"}</td></tr>
                    <tr><th>이메일</th><td>{resume.email || "정보 없음"}</td></tr>
                    <tr><th>전화번호</th><td>{resume.phone || "정보 없음"}</td></tr>
                    <tr><th>성별</th><td>{resume.gender || "정보 없음"}</td></tr>
                    <tr><th>주소</th><td>{resume.address || "정보 없음"}</td></tr>
                    </tbody>
                </Table>

                {/* ✅ 직무 정보 */}
                <h4>🏢 직무 정보</h4>
                <Table bordered size="sm">
                    <tbody>
                    <tr><th>회사</th><td>{resume.company || "정보 없음"}</td></tr>
                    <tr><th>부서</th><td>{resume.department || "정보 없음"}</td></tr>
                    <tr><th>포지션</th><td>{resume.position || "정보 없음"}</td></tr>
                    <tr><th>직무</th><td>{resume.jobTitle || "정보 없음"}</td></tr>
                    </tbody>
                </Table>

                {/* ✅ 경력 */}
                <h4>💼 경력</h4>
                <Table bordered size="sm">
                    <thead>
                    <tr><th>회사</th><th>직책</th><th>기간</th><th>주요 업무</th></tr>
                    </thead>
                    <tbody>
                    {experiences.length > 0 ? experiences.map((exp: any, index: number) => (
                        <tr key={index}>
                            <td>{exp.company || "정보 없음"}</td>
                            <td>{exp.position || "정보 없음"}</td>
                            <td>{exp.start_date || "정보 없음"} ~ {exp.end_date || "현재"}</td>
                            <td>{exp.responsibilities ? exp.responsibilities.join(", ") : "정보 없음"}</td>
                        </tr>
                    )) : <tr><td colSpan={4}>경력 정보 없음</td></tr>}
                    </tbody>
                </Table>

                {/* ✅ 학력 */}
                <h4>🎓 학력</h4>
                <Table bordered size="sm">
                    <thead>
                    <tr><th>학교</th><th>입학일</th><th>졸업일</th><th>졸업 여부</th></tr>
                    </thead>
                    <tbody>
                    {education.length > 0 ? education.map((edu: any, index: number) => (
                        <tr key={index}>
                            <td>{edu.school || "정보 없음"}</td>
                            <td>{edu.schoolStart || "정보 없음"}</td>
                            <td>{edu.schoolEnd || "현재"}</td>
                            <td>{edu.graduateYn === "Y" ? "졸업" : "미졸업"}</td>
                        </tr>
                    )) : <tr><td colSpan={4}>학력 정보 없음</td></tr>}
                    </tbody>
                </Table>

                {/* ✅ 자격증 */}
                <h4>📜 자격증</h4>
                <ul>
                    {licenses.length > 0 ? licenses.map((l: any, index: number) => (
                        <li key={index}>{l.licenseName || "정보 없음"} (취득일: {l.certifiedDate || "정보 없음"})</li>
                    )) : <p>자격증 정보 없음</p>}
                </ul>

                {/* ✅ 군 복무 여부 */}
                <h4>🪖 군 복무 여부</h4>
                <p>{resume.militaryService === "Y" ? "군필" : "미필"}</p>
            </Modal.Body>
            <Modal.Footer>
                <Dropdown onSelect={(eventKey) => setPrintFormat(eventKey || "PDF")}>
                    <Dropdown.Toggle variant="info">
                        {printFormat} 선택
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item eventKey="PDF">PDF</Dropdown.Item>
                        <Dropdown.Item eventKey="Excel">Excel</Dropdown.Item>
                        <Dropdown.Item eventKey="Word">Word</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Button variant="primary" onClick={() => {
                    if (printFormat === "PDF") printPDF();
                    else if (printFormat === "Excel") printExcel();
                    else printWord();
                }}>출력</Button>
                <Button variant="secondary" onClick={onClose}>닫기</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ResumePopup_hdh;
