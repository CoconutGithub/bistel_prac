import SiTableIcon from "~components/icons/SiTableIcon";
import styles from "./FloraResumeCreate.module.scss";
import AgGridWrapper from "~components/agGridWrapper/AgGridWrapper";
import ComButton from "~pages/portal/buttons/ComButton";
import SiNewIcon from "~components/icons/SiNewIcon";

const FloraResumeCreate = () => {
  return (
    <div className={styles.start}>
      <header className={styles.header}>
        <div className={styles.title_area}>
          <SiTableIcon width={12} height={12} fillColor="#00000073" />
          <p className={styles.title}>Create Resume</p>
        </div>
      </header>
      <main className={styles.main}>양식 생성 화면입니다.</main>
    </div>
  );
};

export default FloraResumeCreate;
