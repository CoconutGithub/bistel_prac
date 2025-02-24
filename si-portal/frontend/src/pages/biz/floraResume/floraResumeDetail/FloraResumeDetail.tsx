import SiTableIcon from '~components/icons/SiTableIcon';
import styles from './FloraResumeDetail.module.scss';
import AgGridWrapper from '~components/agGridWrapper/AgGridWrapper';
import ComButton from '~pages/portal/buttons/ComButton';
import SiCheckIcon from '~components/icons/SiCheckIcon';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridWrapperHandle } from '~types/GlobalTypes';
import cn from 'classnames';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addTab, setActiveTab } from '~store/RootTabs';
import axios from 'axios';

let cachedAuthToken: string | null = sessionStorage.getItem('authToken');

const fetchResume = async (id: any) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_IP}/biz/flora-resumes/detail/${id}`,
      {
        headers: {
          Authorization: `Bearer ${cachedAuthToken}`,
        },
      }
    );

    console.log('response.data', response.data);

    return response.data;
  } catch (error) {
    console.error('Failed to fetch resume', error);
    return [];
  }
};

const FloraResumeDetail = () => {
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
  const { id } = useParams();
  const eduGridRef = useRef<AgGridWrapperHandle>(null);
  const skillGridRef = useRef<AgGridWrapperHandle>(null);
  const workGridRef = useRef<AgGridWrapperHandle>(null);

  const eduColumns = useMemo(
    () => [
      {
        field: 'schoolName',
        headerName: '학교명',
        editable: false,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'educationLevel',
        headerName: '학교 유형',
        editable: false,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'period',
        headerName: '재학 기간',
        editable: false,
        autoHeight: true,
        flex: 3,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'status',
        headerName: '졸업 상태',
        editable: false,
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
        editable: false,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'certificationDate',
        headerName: '취득일',
        editable: false,
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
        editable: false,
        flex: 2,
        autoHeight: true,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'workPeriod',
        headerName: '기간',
        editable: false,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
      {
        field: 'workDetail',
        headerName: '담당 업무',
        editable: false,
        autoHeight: true,
        flex: 2,
        wrapText: true,
        cellStyle: { display: 'flex', alignItems: 'center' },
      },
    ],
    []
  );

  useEffect(() => {
    if (eduGridRef.current && formData.education.length > 0) {
      const eduData = formData.education.map((row: any, index: any) => ({
        gridRowId: index,
        ...row,
      }));

      console.log('eduData', eduData);
      eduGridRef.current.setRowData(eduData);
    }
    if (workGridRef.current && formData.experience.length > 0) {
      const workData = formData.experience.map((row: any, index: any) => ({
        gridRowId: index,
        ...row,
      }));
      workGridRef.current.setRowData(workData);
    }
    if (skillGridRef.current && formData.skills.length > 0) {
      const skillData = formData.skills.map((row: any, index: any) => ({
        gridRowId: index,
        ...row,
      }));
      skillGridRef.current.setRowData(skillData);
    }
  }, [formData]);

  useEffect(() => {
    const loadInitData = async () => {
      const initData = await fetchResume(id);
      if (initData) {
        setFormData((prev) => ({
          ...prev,
          ...Object.keys(prev).reduce((acc, key) => {
            const typedKey = key as keyof typeof prev;
            if (typedKey === 'education' && initData['education']) {
              const jsonArray = JSON.parse(initData[typedKey]);

              const formattedEducation = jsonArray.map((item: any) => {
                return eduColumns.reduce((eduAcc: any, eduCol) => {
                  if (!eduCol.field) return eduAcc;

                  eduAcc[eduCol.field] = item[eduCol.field] || '';
                  return eduAcc;
                }, {});
              });

              acc[typedKey] = formattedEducation;
            } else if (typedKey === 'skills' && initData['skills']) {
              const jsonArray = JSON.parse(initData[typedKey]);

              const formattedSkills = jsonArray.map((item: any) => {
                return certificationColumns.reduce(
                  (certiAcc: any, certiCol) => {
                    if (!certiCol.field) return certiAcc;
                    certiAcc[certiCol.field] = item[certiCol.field] || '';
                    return certiAcc;
                  },
                  {}
                );
              });

              acc[typedKey] = formattedSkills;
            } else if (typedKey === 'experience' && initData['experience']) {
              const jsonArray = JSON.parse(initData[typedKey]);

              const formattedExperience = jsonArray.map((item: any) => {
                return workColumns.reduce((workAcc: any, workCol) => {
                  if (!workCol.field) return workAcc;
                  workAcc[workCol.field] = item[workCol.field] || '';
                  return workAcc;
                }, {});
              });

              acc[typedKey] = formattedExperience;
            } else if (initData.hasOwnProperty(typedKey)) {
              acc[typedKey] = initData[typedKey];
            }
            return acc;
          }, {} as typeof prev),
        }));
      }
    };

    loadInitData();
  }, [id]);

  return (
    <div className={styles.start}>
      <header className={styles.header}>
        <div className={styles.title_area}>
          <SiTableIcon width={12} height={12} fillColor="#00000073" />
          <p className={styles.title}>Detail Resume</p>
        </div>
        <div className={styles.button_area}>
          <ComButton
            onClick={() => {}}
            size="sm"
            className={styles.button}
            variant="outline-secondary"
          >
            Delete
          </ComButton>
          <ComButton
            onClick={() => {}}
            size="sm"
            className={styles.button}
            variant="outline-primary"
          >
            Update
          </ComButton>
        </div>
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
                readOnly
                value={formData.fullName}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="phone" className={styles.label}>
                전화번호
              </label>
              <input
                id="phone"
                className={styles.input}
                readOnly
                value={formData.phone}
              />
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
                readOnly
                value={formData.email}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="gender" className={styles.label}>
                성별
              </label>
              <input
                id="gender"
                className={styles.input}
                readOnly
                value={formData.gender}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="company" className={styles.label}>
                회사
              </label>
              <input
                id="company"
                className={styles.input}
                readOnly
                value={formData.company}
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
                readOnly
                value={formData.department}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="position" className={styles.label}>
                직위
              </label>
              <input
                id="position"
                className={styles.input}
                readOnly
                value={formData.position}
              />
            </div>
            <div className={styles.form_item}>
              <label htmlFor="jobTitle" className={styles.label}>
                직무
              </label>
              <input
                id="jobTitle"
                className={styles.input}
                readOnly
                value={formData.position}
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
              showButtonArea={false}
              canCreate={false}
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
              ref={skillGridRef}
              enableCheckbox={false}
              showButtonArea={false}
              canCreate={false}
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
            showButtonArea={false}
            canCreate={false}
            canDelete={false}
            canUpdate={false}
            columnDefs={workColumns}
            tableHeight={'600px'}
            useNoColumn={true}
          />
        </div>
      </main>
    </div>
  );
};

export default FloraResumeDetail;
