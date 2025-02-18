import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./FloraResumeCreate.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import ComButton from "~pages/portal/buttons/ComButton";
import SiCheckIcon from "~components/icons/SiCheckIcon";
import { useRef, useState } from "react";
import { AgGridWrapperHandle } from "~types/GlobalTypes";
import cn from "classnames";
import axios from "axios";

const FloraResumeCreate = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    company: "",
    department: "",
    position: "",
    jobTitle: "",
    experience: [],
    education: [],
    skills: [],
  });
  const eduGridRef = useRef<AgGridWrapperHandle>(null);
  const certGridRef = useRef<AgGridWrapperHandle>(null);
  const workGridRef = useRef<AgGridWrapperHandle>(null);

  const eduColumns = [
    {
      field: "schoolName",
      headerName: "학교명",
      editable: true,
      flex: 2,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "educationLevel",
      headerName: "학교 유형",
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "period",
      headerName: "재학 기간",
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "status",
      headerName: "졸업 상태",
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
  ];
  const certificationColumns = [
    {
      field: "certificationName",
      headerName: "자격증명",
      editable: true,
      flex: 2,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "certificationDate",
      headerName: "취득일",
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
  ];
  const workColumns = [
    {
      field: "companyName",
      headerName: "회사명",
      editable: true,
      flex: 2,
      autoHeight: true,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "workPeriod",
      headerName: "기간",
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
    {
      field: "workDetail",
      headerName: "담당 업무",
      editable: true,
      autoHeight: true,
      flex: 2,
      wrapText: true,
      cellStyle: { display: "flex", alignItems: "center" },
    },
  ];

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      alert("성명을 입력해주세요.");
      return;
    }
    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    const educationData = eduGridRef.current?.getRowData() || [];
    const certificationData = certGridRef.current?.getRowData() || [];
    const workExperienceData = workGridRef.current?.getRowData() || [];

    const resumeDate = {
      ...formData,
      education: educationData,
      experience: workExperienceData,
      skills: certificationData,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_IP}/biz/flora-resumes/create`,
        resumeDate
      );
      console.log("response", response);
    } catch (error) {
      console.error("이력서 저장에 실패했습니다.", error);
    }
  };

  return (
    <div className={styles.start}>
      <header className={styles.header}>
        <div className={styles.title_area}>
          <SiTableIcon width={12} height={12} fillColor="#00000073" />
          <p className={styles.title}>Create Resume</p>
        </div>
        <ComButton onClick={handleSave} size="sm" className={styles.button}>
          <SiCheckIcon width={14} height={14} currentFill={true} />
          Save
        </ComButton>
      </header>
      <main className={styles.main}>
        <div className={styles.form}>
          <div className={styles.form_row}>
            <div className={styles.form_item}>
              <label htmlFor="fullName" className={styles.label}>
                성명
              </label>
              <input
                id="fullName"
                required
                className={styles.input}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label
                htmlFor="phone"
                className={styles.label}
                onChange={handleInputChange}
              >
                전화번호
              </label>
              <input id="phone" className={styles.input} />
            </div>
            <div className={styles.form_item}>
              <label className={styles.label}>주민등록번호</label>
              <input disabled className={styles.input} />
            </div>
          </div>
          <div className={styles.form_row}>
            <div className={styles.form_item}>
              <label htmlFor="email" className={styles.label}>
                이메일
              </label>
              <input
                id="email"
                required
                className={styles.input}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="gender" className={styles.label}>
                성별
              </label>
              <input
                id="gender"
                className={styles.input}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="company" className={styles.label}>
                회사
              </label>
              <input
                id="company"
                className={styles.input}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className={styles.form_row}>
            <div className={styles.form_item}>
              <label htmlFor="department" className={styles.label}>
                부서
              </label>
              <input
                id="department"
                className={styles.input}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="position" className={styles.label}>
                직위
              </label>
              <input
                id="position"
                className={styles.input}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="jobTitle" className={styles.label}>
                직무
              </label>
              <input
                id="jobTitle"
                className={styles.input}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className={styles.table_form_wrap}>
          <div className={styles.table_form}>
            <label className={styles.label}>학력 사항</label>
            <AgGridWrapper
              ref={eduGridRef}
              enableCheckbox={false}
              showButtonArea={true}
              canCreate={true}
              canDelete={false}
              canUpdate={false}
              columnDefs={eduColumns}
              tableHeight="400px"
              useNoColumn={true}
            />
          </div>
          <div className={styles.table_form}>
            <label className={styles.label}>자격증</label>
            <AgGridWrapper
              ref={certGridRef}
              enableCheckbox={false}
              showButtonArea={true}
              canCreate={true}
              canDelete={false}
              canUpdate={false}
              columnDefs={certificationColumns}
              tableHeight="400px"
              useNoColumn={true}
            />
          </div>
        </div>
        <div className={cn(styles.table_form, styles.wide)}>
          <label className={styles.label}>프로젝트 경험(경력 사항)</label>
          <AgGridWrapper
            ref={workGridRef}
            enableCheckbox={false}
            showButtonArea={true}
            canCreate={true}
            canDelete={false}
            canUpdate={false}
            columnDefs={workColumns}
            tableHeight={"600px"}
            useNoColumn={true}
          />
        </div>
      </main>
    </div>
  );
};

export default FloraResumeCreate;
