import './App.css';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

let todoItemId = 0;

const TodoItemInputField = (props) => {
	const [input, setInput] = useState('');

	const onSubmit = () => {
		props.onSubmit(input); // 이 컴포넌트 사용하는 애한테서 받아온 함수를 call 해주라는 것
		setInput('');
	};

	return (
		<div>
			<h1>T o d o L i s t</h1>
			<TextField
				id="todo-item-input"
				label="Todo Item"
				variant="outlined"
				onChange={(e) => setInput(e.target.value)}
				value={input}
			/>
			<Button variant="outlined" onClick={onSubmit}>
				Submit
			</Button>
		</div>
	);
};

const TodoItem = (props) => {
	const style = props.todoItem.isFinished
		? { textDecoration: 'line-through' }
		: null;
	return (
		<li>
			<span style={style} onClick={() => props.onTodoItemClick(props.todoItem)}>
				{props.todoItem.todoItemContent}
			</span>
			<Button
				variant="outlined"
				onClick={() => props.onRemoveClick(props.todoItem)}
			>
				X
			</Button>
		</li>
	);
};

const TodoItemList = (props) => {
	const todoList = props.todoItemList.map((todoItem, index) => {
		return (
			<TodoItem
				key={index}
				todoItem={todoItem}
				onTodoItemClick={props.onTodoItemClick}
				onRemoveClick={props.onRemoveClick}
			/>
		);
	});

	return (
		<div>
			<ul>{todoList}</ul>
		</div>
	);
};

function App() {
	const [todoItemList, setTodoItemList] = useState([]);
	const onSubmit = (newTodoItem) => {
		setTodoItemList([
			...todoItemList,
			{ id: todoItemId++, todoItemContent: newTodoItem, isFinished: false },
		]);
	};
	const onTodoItemClick = (clickedTodoItem) => {
		setTodoItemList(
			todoItemList.map((todoItem) => {
				if (clickedTodoItem.id === todoItem.id) {
					return {
						id: clickedTodoItem.id,
						todoItemContent: clickedTodoItem.todoItemContent,
						isFinished: !clickedTodoItem.isFinished,
					};
				} else {
					return todoItem;
				}
			})
		);
	};

	const onRemoveClick = (removedTodoItem) => {
		setTodoItemList(
			todoItemList.filter((todoItem) => {
				return todoItem.id !== removedTodoItem.id;
			})
		);
	};
	return (
		<div className="App">
			<TodoItemInputField onSubmit={onSubmit} />
			<TodoItemList
				todoItemList={todoItemList}
				onTodoItemClick={onTodoItemClick}
				onRemoveClick={onRemoveClick}
			/>
		</div>
	);
}

export default App;
