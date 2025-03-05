import SiTableIcon from '~components/icons/SiTableIcon';
import styles from './FloraResumeCreate.module.scss';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import ComButton from '~pages/portal/buttons/ComButton';
import SiCheckIcon from '~components/icons/SiCheckIcon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import cn from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';
import axios from 'axios';

let cachedAuthToken: string | null = sessionStorage.getItem('authToken');

const FloraResumeCreate = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    company: '',
    department: '',
    position: '',
    jobTitle: '',
    experience: [],
    education: [],
    skills: [],
  });
  const [eduData, setEduData] = useState(new Map<string, any>());
  const [experienceData, setExperienceData] = useState(new Map<string, any>());
  const [skillsData, setSkillsData] = useState(new Map<string, any>());
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const eduColumns = useMemo(
    () => [
      {
        field: 'schoolName',
        headerName: '학교명',
        editable: true,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'educationLevel',
        headerName: '학교 유형',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'period',
        headerName: '재학 기간',
        editable: true,
        autoHeight: true,
        flex: 3,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'status',
        headerName: '졸업 상태',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
    ],
    []
  );

  const certificationColumns = useMemo(
    () => [
      {
        field: 'certificationName',
        headerName: '자격증명',
        editable: true,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'certificationDate',
        headerName: '취득일',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
    ],
    []
  );

  const workColumns = useMemo(
    () => [
      {
        field: 'companyName',
        headerName: '회사명',
        editable: true,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'workPeriod',
        headerName: '기간',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'workDetail',
        headerName: '담당 업무',
        editable: true,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
    ],
    []
  );

  const handleInputChange = useCallback((e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const handleCellValueChange = useCallback((event: any, type: any) => {
    const { data } = event;

    const eduFilteredData: Record<string, any> = {};
    const skillsFilteredData: Record<string, any> = {};
    const experienceFilteredData: Record<string, any> = {};

    if (type === 'education') {
      const eduValidFields = new Set(eduColumns.map((col) => col.field));
      eduValidFields.forEach((key) => {
        if (!key) return;

        if (data.hasOwnProperty(key)) {
          eduFilteredData[key] = data[key] ?? '';
        } else {
          eduFilteredData[key] = '';
        }
      });
    }

    if (type === 'skills') {
      const skillsValidFields = new Set(
        certificationColumns.map((col) => col.field)
      );
      skillsValidFields.forEach((key) => {
        if (!key) return;

        if (data.hasOwnProperty(key)) {
          skillsFilteredData[key] = data[key] ?? '';
        } else {
          skillsFilteredData[key] = '';
        }
      });
    }

    if (type === 'experience') {
      const experienceValidFields = new Set(
        workColumns.map((col) => col.field)
      );
      experienceValidFields.forEach((key) => {
        if (!key) return;

        if (data.hasOwnProperty(key)) {
          experienceFilteredData[key] = data[key] ?? '';
        } else {
          experienceFilteredData[key] = '';
        }
      });
    }

    if (data.isCreated === true) {
      if (type === 'education') {
        setEduData((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.gridRowId, eduFilteredData);
          return newMap;
        });
      } else if (type === 'experience') {
        setExperienceData((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.gridRowId, experienceFilteredData);
          return newMap;
        });
      } else if (type === 'skills') {
        setSkillsData((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.gridRowId, skillsFilteredData);
          return newMap;
        });
      }
    } else {
      data.isUpdated = true;
      console.log('Update List:', data);
    }
  }, []);

  const handleEducationCellChange = useCallback(
    (e: any) => handleCellValueChange(e, 'education'),
    [handleCellValueChange]
  );
  const handleSkillsCellChange = useCallback(
    (e: any) => handleCellValueChange(e, 'skills'),
    [handleCellValueChange]
  );
  const handleExperienceCellChange = useCallback(
    (e: any) => handleCellValueChange(e, 'experience'),
    [handleCellValueChange]
  );

  const handleSelectTab = useCallback(
    (tab: { key: string; label: string; path: string }) => {
      const rootTabsData = sessionStorage.getItem('persist:rootTabs');
      if (rootTabsData) {
        const parsedData = JSON.parse(rootTabsData);
        const cachedTabs = JSON.parse(parsedData.tabs);

        if (cachedTabs.length === 8) {
          alert('최대 8개의 탭만 열 수 있습니다.');
          return;
        } else {
          dispatch(addTab(tab));
          dispatch(setActiveTab(tab.key));
          navigate(tab.path);
        }
      }
    },
    []
  );

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      alert('성명을 입력해주세요.');
      return;
    }
    if (!formData.email.trim()) {
      alert('이메일을 입력해주세요.');
      return;
    }

    const eduArray = Array.from(eduData.values());
    const experienceArray = Array.from(experienceData.values());
    const skillsArray = Array.from(skillsData.values());

    const resumeData = {
      ...formData,
      education: eduArray,
      experience: experienceArray,
      skills: skillsArray,
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_IP}/biz/flora-resumes/create`,
        resumeData,
        {
          headers: {
            Authorization: `Bearer ${cachedAuthToken}`,
          },
        }
      );
      handleSelectTab({
        key: '199',
        label: 'Flora resume',
        path: '/main/flora-resume',
      });
    } catch (error) {
      console.error('이력서 저장에 실패했습니다.', error);
      alert('이력서 저장에 실패했습니다.');
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
              enableCheckbox={false}
              showButtonArea={true}
              canCreate={true}
              canDelete={false}
              canUpdate={false}
              columnDefs={eduColumns}
              tableHeight="400px"
              useNoColumn={true}
              onCellValueChanged={handleEducationCellChange}
            />
          </div>
          <div className={styles.table_form}>
            <label className={styles.label}>자격증</label>
            <AgGridWrapper
              enableCheckbox={false}
              showButtonArea={true}
              canCreate={true}
              canDelete={false}
              canUpdate={false}
              columnDefs={certificationColumns}
              tableHeight="400px"
              useNoColumn={true}
              onCellValueChanged={handleSkillsCellChange}
            />
          </div>
        </div>
        <div className={cn(styles.table_form, styles.wide)}>
          <label className={styles.label}>프로젝트 경험(경력 사항)</label>
          <AgGridWrapper
            enableCheckbox={false}
            showButtonArea={true}
            canCreate={true}
            canDelete={false}
            canUpdate={false}
            columnDefs={workColumns}
            tableHeight={'600px'}
            useNoColumn={true}
            onCellValueChanged={handleExperienceCellChange}
          />
        </div>
      </main>
    </div>
  );
};

export default FloraResumeCreate;
