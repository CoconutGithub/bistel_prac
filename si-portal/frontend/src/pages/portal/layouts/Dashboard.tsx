import React, {useContext, useState} from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import MenuVisitorChart from "~components/chart/MenuVisitorChart";
import {ComAPIContext} from "~components/ComAPIContext";


const Dashboard: React.FC = () => {

    const sampleData = [
        { menu: '홈', visitors: 1200 },
        { menu: '상품', visitors: 800 },
        { menu: '이벤트', visitors: 500 },
        { menu: '고객센터', visitors: 300 },
    ];

    const comAPIContext = useContext(ComAPIContext);
    const [inputText, setInputText] = useState('');
    const [response, setResponse] = useState('');
    const [selectedModel, setSelectedModel] = useState('llama3.2');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputText.trim()) {
            alert('질문을 입력하세요.');
            return;
        }

        setLoading(true);
        try {
            console.log("============>" + selectedModel);

            comAPIContext.showProgressBar();

            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // body: JSON.stringify({
                //     model: 'llama3.2',
                //     prompt: inputText,
                // }),
                body: JSON.stringify({
                    model: selectedModel,
                    prompt: inputText,
                }),
            });

            if (!res.ok) {
                throw new Error('서버 응답 오류');
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let fullResponse = '';

            while (!done) {
                const { value, done: streamDone } = await reader?.read() || {};
                if (value) {
                    const chunk = decoder.decode(value);
                    const jsonObjects = chunk.split('\n').filter(Boolean);  // 각 JSON 객체 분리
                    jsonObjects.forEach(jsonStr => {
                        try {
                            const json = JSON.parse(jsonStr);
                            fullResponse += json.response;  // 응답 텍스트 누적
                        } catch (error) {
                            console.error('JSON 파싱 오류:', error);
                        }
                    });
                }
                done = streamDone ?? true;
            }

            setResponse(fullResponse || '응답이 없습니다.');
        } catch (error) {
            console.error('API 요청 오류:', error);
            setResponse('오류가 발생했습니다.');
        } finally {
            setLoading(false);
            comAPIContext.hideProgressBar();
        }
    };

    return (
        <Container>
            <Row className="text-center" style={{ marginTop: '50px' }}>
                <Col>
                    <h1>메뉴 방문 이력</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <MenuVisitorChart data={sampleData} />
                </Col>
            </Row>
            <Row>
                <div className="p-4">
                    <h1 className="text-xl font-bold mb-4">Ollama API 요청 테스트</h1>

                    <form onSubmit={handleSubmit} className="mb-4">
                        <div>
                            <label className="block me-2 font-medium">모델:</label>
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className="border p-2 mb-4"
                            >
                                <option value="llama3.2">LLaMA3.2</option>
                                <option value="deepseek-r1">DeepSeek R1</option>
                            </select>
                        </div>
                        <div>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="border w-full p-2 mb-4"
                                rows={4}
                                placeholder="질문을 입력하세요..."
                            ></textarea>
                        </div>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? '전송 중...' : '질문 전송'}
                        </Button>
                    </form>

                    <div className="mt-4">
                        <h2 className="text-lg font-bold">응답 내용:</h2>
                        <div className="border p-2 mt-2">{response}</div>
                    </div>
                </div>
            </Row>
        </Container>
    );
};

export default Dashboard;
