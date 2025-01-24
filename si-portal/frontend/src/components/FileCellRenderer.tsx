import React, { useState } from "react";

interface FileCellRendererProps {
  value: string | undefined; // 초기 값
  data: any; // 셀의 전체 행 데이터
  column: any; // ag-Grid 컬럼 정보
}

const FileCellRenderer: React.FC<FileCellRendererProps> = (props) => {

  console.log('FileCellRender....재랜더링.')


  const [fileName, setFileName] = useState(props.value || "파일 첨부");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFileName(file.name);

      debugger

      // 추가적으로 파일 데이터를 외부에 전달하는 로직 (예: API 요청)
      // 이곳에 구현해야한다.
      console.log("Uploaded File:", file);

      // ag-Grid 데이터 업데이트
      const { data, column } = props;

      console.log(data)
      console.log(column)

      const field = column.getColDef().field; // 컬럼 필드 이름
      if (field) {
        data[field] = file.name; // 파일 이름을 데이터에 저장
      }
    }
  };

  return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <label style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}>
          {fileName}
          <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
          />
        </label>
      </div>
  );
};

export default FileCellRenderer;
