import { Container, Row } from "react-bootstrap";

type MangeMenuContentProps = {
    selectedMenu: { id: string; name: string; content: string } | null;
};

const MangeMenuContent: React.FC<MangeMenuContentProps> = ({ selectedMenu }) => {
    return (
        <Container fluid className="h-100">
            <Row className="h-100 align-items-start">
                {selectedMenu ? (
                    <div>
                        <h2>{selectedMenu.name}</h2>
                        <p>{selectedMenu.content}</p>
                    </div>
                ) : (
                    <p>Please select a menu item to view content.</p>
                )}
            </Row>
        </Container>
    );
};

export default MangeMenuContent;
