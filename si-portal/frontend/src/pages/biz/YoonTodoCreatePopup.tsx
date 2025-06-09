import { Modal, ModalBody, ModalHeader } from "react-bootstrap"
import {ChangeEvent, useState} from "react"
import 'bootstrap/dist/css/bootstrap.min.css';

interface YoonTodoPopupProps {
  show: boolean,
  onClose: () => void,
}

const YoonTodoCreatePopup: React.FC<YoonTodoPopupProps> =({show, onClose})=>{
    const [todo, setTodo]=useState({
        title:"",
        content:"",
        dueDate:"",
        type:""
    });



    const handleChangeTitle = (e: ChangeEvent<HTMLTextAreaElement>)=>{
        setTodo({
            ...todo,
            title: e.target.value
        })
    };
    const handleChangeContent=(e: ChangeEvent<HTMLTextAreaElement>)=>{
        setTodo({
            ...todo,
            content: e.target.value
        })
    }
    const handleChangeDueDate=(e: ChangeEvent<HTMLTextAreaElement>)=>{
        setTodo({
            ...todo,
            dueDate: e.target.value
        })
    }
    const handleChangeType=(e: ChangeEvent<HTMLTextAreaElement>)=>{
        setTodo({
            ...todo,
            type: e.target.value
        })
    }

    return(
            <Modal
                show={show}
                onHide={onClose}
                backdrop="static"
                size="lg" 
            >
            <ModalHeader>모달 헤더</ModalHeader>
            <ModalBody>모달 바디
                <div className="mb-3">
                    <textarea
                        className="form-control"
                        placeholder="제목"
                        value={todo.title}
                        onChange={handleChangeTitle}
                    />
                </div>
                <div className="mb-3">
                    <textarea
                        className="form-control"
                        placeholder="내용"
                        value={todo.content}
                        onChange={handleChangeContent}
                    />
                </div>
                <div className="mb-3">
                    <textarea
                        placeholder="due"
                        value={todo.dueDate}
                        onChange={handleChangeDueDate}
                    />
                </div>
                <div className="mb-3">
                    <textarea 
                        placeholder="todo타입"
                        value={todo.type}
                        onChange={handleChangeType}
                    />
                </div>

            </ModalBody>

            <button onClick={onClose}>닫기</button>
            <button onClick={onClose}>저장</button>

            </Modal>
    )

}

export default YoonTodoCreatePopup; 