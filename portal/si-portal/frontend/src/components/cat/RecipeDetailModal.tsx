import {Card, Modal} from "react-bootstrap";
import {CorporateCardTransactionData} from "~types/CorporateCardTransactionData";
import {useEffect} from "react";
import styles from "~components/cat/RecipeDetailModal.module.scss";

interface RecipeDetailModalProps{
    show: boolean;
    onHide: () => void;
    onSelect: (accountName: string) => void;
    currentValue: CorporateCardTransactionData
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
    show,
    onHide,
    onSelect,
    currentValue
}) => {

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');  // 월(0~11)
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size={"sm"}
            dialogClassName={styles.recipeDetailModal}
        >
            <Modal.Header closeButton>
                <Modal.Title>영수증 상세내역</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Card className="shadow-sm" style={{ margin: "10px", padding: "15px" }}>
                    <Card.Body>
                        <h5 className="fw-bold mb-3">카드전표</h5>

                        <div className="mb-3 lh-m">
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>카드사</div>
                                <div className={styles.infoValue}>{currentValue?.cardCompany || ''}</div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>카드번호</div>
                                <div className={styles.infoValue}>{currentValue?.cardNumber || ''}</div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>승인일시</div>
                                <div className={styles.infoValue}>{formatDateTime(currentValue?.approvalDate) || ''}</div>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>승인번호</div>
                                <div className={styles.infoValue}>{currentValue?.approvalNumber || ''}</div>
                            </div>
                        </div>

                        <hr />

                        <div className="mb-3 lh-lg">
                            <div><strong>공급금액</strong> <span className="float-end fw-bold">{currentValue?.supplyAmount?.toLocaleString() || ''} 원</span></div>
                            <div><strong>부가세</strong> <span className="float-end fw-bold">{currentValue?.taxAmount?.toLocaleString() || ''} 원</span></div>
                            <div><strong>봉사료</strong> <span className="float-end fw-bold">0원</span></div>
                            <div><strong>승인금액</strong> <span className={styles.recipeApprovalAmount}>{currentValue?.transactionAmount?.toLocaleString() || ''} 원</span></div>
                        </div>

                        <hr />

                        <div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>가맹점명</div>
                                <div className={styles.infoValue}>{currentValue?.merchantName || ''}</div>
                            </div>

                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>사업자등록번호</div>
                                <div className={styles.infoValue}>{currentValue?.businessRegistrationNumber || ''}</div>
                            </div>

                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>업종</div>
                                <div className={styles.infoValue}>{currentValue?.merchantCategory || ''}</div>
                            </div>

                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>대표자</div>
                                <div className={styles.infoValue}>{currentValue?.merchantOwnerName || ''}</div>
                            </div>

                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>주소</div>
                                <div className={styles.infoValue}>{currentValue?.merchantAddress || ''}</div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Modal.Body>
        </Modal>
    )
}

export default RecipeDetailModal