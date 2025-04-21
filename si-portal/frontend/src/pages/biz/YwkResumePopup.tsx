import React, { useContext, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import ComButton from '~pages/portal/buttons/ComButton';
import { ComAPIContext } from '~components/ComAPIContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface YwkResumePopupProps {
  show: boolean;
  onClose: () => void;
  resumeData: {
    fullName: string;
    email: string;
    phone: string;
    summary: string;
    experience: any;
    education: any;
    skills: any;
    resumeFilename: string;
  } | null;
}

const parseJSON = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return [];
    }
  }
  return Array.isArray(data) ? data : [];
};

const YwkResumePopup: React.FC<YwkResumePopupProps> = ({
  show,
  onClose,
  resumeData,
}) => {
  const comAPIContext = useContext(ComAPIContext);
  const contentRef = useRef<HTMLDivElement>(null);

  console.log(resumeData);

  const experienceList = parseJSON(resumeData?.experience);
  const educationList = parseJSON(resumeData?.education);
  const skillsList = parseJSON(resumeData?.skills);

  console.log(educationList?.length);

  if (educationList?.length) {
    console.log('A');
  } else {
    console.log('B');
  }

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume');
    if (element) {
      html2canvas(element, { scale: 3, useCORS: true }).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        doc.save('resume.pdf');
      });
    }
  };

  const handleDownloadExcel = () => {
    const sheetData = [
      ['이름', resumeData?.fullName || ''],
      ['이메일', resumeData?.email || ''],
      ['전화번호', resumeData?.phone || ''],
      ['요약', resumeData?.summary || ''],
      [],
      ['경력'],
      ['회사', '직책', '기간', '책임 사항'],
      ...(experienceList.length > 0
        ? experienceList.map((exp: any) => [
            exp.company || '',
            exp.position || '',
            `${exp.start_date} ~ ${exp.end_date || '현재'}`,
            exp.responsibilities.join(', ') || '',
          ])
        : [['경력 없음']]),
      [],
      ['학력'],
      ['학교', '학위', '기간'],
      ...(educationList?.length > 0
        ? educationList.map((edu: any) => [
            edu.company || '',
            edu.position || '',
            `${edu.start_date} ~ ${edu.end_date || '현재'}`,
          ])
        : [['학력 없음']]),
      [],
      ['기술'],
      ['기술명', '직책', '기간'],
      ...(skillsList.length > 0
        ? skillsList.map((skill: any) => [
            skill.company || '',
            skill.position || '',
            `${skill.start_date} ~ ${skill.end_date || '현재'}`,
          ])
        : [['기술 없음']]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, '이력서');

    const columnWidths = Array.from({
      length: Math.max(...sheetData.map((row) => row.length)),
    }).map((_, colIndex) => {
      const maxWidth = Math.max(
        ...sheetData.map((row) =>
          row[colIndex] ? row[colIndex].toString().length : 0
        )
      );
      return { wch: maxWidth + 7 }; // 여유 공간 추가
    });

    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, 'resume.xlsx');
  };

  const handleDownloadWord = async () => {
    if (!contentRef.current) return;

    const styles = `
      <style>
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; }
      </style>
    `;

    // html-docx-js를 동적으로 로드
    const htmlDocx = (await import('html-docx-js/dist/html-docx')).default;

    // HTML 내용을 가져오기
    const contentHtml = styles + contentRef.current.innerHTML;

    // HTML을 Word로 변환
    const converted = htmlDocx.asBlob(
      `<html><body>${contentHtml}</body></html>`
    );

    // 파일 다운로드
    const link = document.createElement('a');
    link.href = URL.createObjectURL(converted);
    link.download = 'resume.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show={show} onHide={onClose} centered className="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {comAPIContext.$msg('label', 'resume', '이력서')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {resumeData ? (
          <div ref={contentRef} id="resume">
            <table
              className="table table-bordered"
              style={{
                width: '100%',
                border: '1px solid #000',
                borderCollapse: 'collapse',
              }}
            >
              <tbody>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    <strong>이름</strong>
                  </th>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {resumeData.fullName}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    <strong>이메일</strong>
                  </th>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {resumeData.email}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    <strong>전화번호</strong>
                  </th>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {resumeData.phone}
                  </td>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    <strong>요약</strong>
                  </th>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    {resumeData.summary}
                  </td>
                </tr>
              </tbody>
            </table>

            <h5>경력</h5>
            <table
              className="table table-bordered"
              style={{
                width: '100%',
                border: '1px solid #000',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    회사
                  </th>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    직책
                  </th>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    기간
                  </th>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    책임 사항
                  </th>
                </tr>
              </thead>
              <tbody>
                {experienceList?.length > 0 ? (
                  experienceList.map((exp: any, index: any) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {exp.company}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {exp.position}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {exp.start_date} ~ {exp.end_date || '현재'}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {exp.responsibilities
                          ? exp.responsibilities.join(', ')
                          : '데이터 X'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      style={{ border: '1px solid #000', padding: '8px' }}
                      colSpan={4}
                    >
                      경력 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <h5>학력</h5>
            <table
              className="table table-bordered"
              style={{
                width: '100%',
                border: '1px solid #000',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    학교
                  </th>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    직책
                  </th>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    기간
                  </th>
                </tr>
              </thead>
              <tbody>
                {educationList?.length > 0 ? (
                  educationList.map((edu: any, index: any) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {edu.company}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {edu.position}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {edu.start_date} ~ {edu.end_date || '현재'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      style={{ border: '1px solid #000', padding: '8px' }}
                      colSpan={3}
                    >
                      학력 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <h5>기술</h5>
            <table
              className="table table-bordered"
              style={{
                width: '100%',
                border: '1px solid #000',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    기술명
                  </th>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    직책
                  </th>
                  <th style={{ border: '1px solid #000', padding: '8px' }}>
                    기간
                  </th>
                </tr>
              </thead>
              <tbody>
                {skillsList?.length > 0 ? (
                  skillsList.map((skill: any, index: any) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {skill.company}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {skill.position}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '8px' }}>
                        {skill.start_date} ~ {skill.end_date || '현재'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      style={{ border: '1px solid #000', padding: '8px' }}
                      colSpan={3}
                    >
                      기술 없음
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <table
              style={{
                width: '100%',
                border: '1px solid #000',
                borderCollapse: 'collapse',
              }}
            >
              <tbody>
                <tr>
                  <th
                    style={{
                      border: '1px solid #000',
                      padding: '8px',
                      width: '20%',
                    }}
                  >
                    <strong>첨부파일</strong>
                  </th>
                  <td
                    style={{
                      border: '1px solid #000',
                      padding: '8px',
                      width: '80%',
                    }}
                  >
                    {resumeData.resumeFilename}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div>이력서 데이터가 없습니다.</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <ComButton onClick={onClose}>닫기</ComButton>
        <ComButton onClick={handleDownloadPDF}>PDF 다운로드</ComButton>
        <ComButton onClick={handleDownloadExcel}>Excel 다운로드</ComButton>
        <ComButton onClick={handleDownloadWord}>Word 다운로드</ComButton>
      </Modal.Footer>
    </Modal>
  );
};

export default YwkResumePopup;
