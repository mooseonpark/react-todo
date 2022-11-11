import './App.css';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

/// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
	getFirestore,
	collection,
	addDoc,
	setDoc,
	doc,
	deleteDoc,
	getDocs,
} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyAatFMJQGdXk6lUeZns6rcmnx4NBkVy0yM',
	authDomain: 'todo-list-demo-77276.firebaseapp.com',
	projectId: 'todo-list-demo-77276',
	storageBucket: 'todo-list-demo-77276.appspot.com',
	messagingSenderId: '447924059445',
	appId: '1:447924059445:web:5f90f88496055da0aee07c',
	measurementId: 'G-Z7Y5NYVKBX',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

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
	const syncTodoItemListStateWithFirestore = () => {
		// app 처음 켜지면 db의 todoItem 다 읽어와라
		getDocs(collection(db, 'todoItem')).then((querySnapshot) => {
			const firestoreTodoItemList = [];
			querySnapshot.forEach((doc) => {
				firestoreTodoItemList.push({
					id: doc.id,
					todoItemContent: doc.data().todoItemContent,
					isFinished: doc.data().isFinished,
				});
			});
			setTodoItemList(firestoreTodoItemList);
		});
	};
	useEffect(() => {
		syncTodoItemListStateWithFirestore();
	}, []);

	const onSubmit = async (newTodoItem) => {
		await addDoc(collection(db, 'todoItem'), {
			todoItemContent: newTodoItem,
			isFinished: false,
		});
		// firestore db에 todoItem라는 콜렉션에 위 두개 json을 추가해라 라는뜻
		syncTodoItemListStateWithFirestore();
	};

	const onTodoItemClick = async (clickedTodoItem) => {
		const todoItemRef = doc(db, 'todoItem', clickedTodoItem.id);
		await setDoc(
			todoItemRef,
			{ isFinished: !clickedTodoItem.isFinished },
			{ merge: true }
		);
		syncTodoItemListStateWithFirestore();
	};

	const onRemoveClick = async (removedTodoItem) => {
		const todoItemRef = doc(db, 'todoItem', removedTodoItem.id);
		await deleteDoc(todoItemRef);
		syncTodoItemListStateWithFirestore();
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
