import './App.css';
import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete';

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
	query,
	orderBy,
	where,
} from 'firebase/firestore';

import {
	GoogleAuthProvider,
	getAuth,
	signInWithRedirect,
	onAuthStateChanged,
	signOut,
} from 'firebase/auth';

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

const provider = new GoogleAuthProvider();
const auth = getAuth(app);

const TodoItemInputField = (props) => {
	const [input, setInput] = useState('');

	const onSubmit = () => {
		props.onSubmit(input); // 이 컴포넌트 사용하는 애한테서 받아온 함수를 call 해주라는 것
		setInput('');
	};

	return (
		<div>
			<h1>T o d o L i s t</h1>
			<Box sx={{ margin: 'auto' }}>
				<Stack direction="row" spacing={2} justifyContent="center">
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
				</Stack>
			</Box>
		</div>
	);
};

const TodoItem = (props) => {
	const style = props.todoItem.isFinished
		? { textDecoration: 'line-through' }
		: null;
	return (
		<ListItem
			secondaryAction={
				<IconButton
					edge="end"
					aria-label="comments"
					onClick={() => props.onRemoveClick(props.todoItem)}
				>
					<DeleteIcon />
				</IconButton>
			}
		>
			<ListItemButton
				role={undefined}
				onClick={() => props.onTodoItemClick(props.todoItem)}
				dense
			>
				<ListItemIcon>
					<Checkbox
						edge="start"
						checked={props.todoItem.isFinished}
						disableRipple
					/>
				</ListItemIcon>
				<ListItemText style={style} primary={props.todoItem.todoItemContent} />
			</ListItemButton>
		</ListItem>
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
		<Box>
			<List sx={{ margin: 'auto', maxWidth: 720 }}>{todoList}</List>
		</Box>
	);
};

const TodoListAppBar = (props) => {
	const loginWithGoogleButton = (
		<Button
			color="inherit"
			onClick={() => {
				signInWithRedirect(auth, provider);
			}}
		>
			Login with Google
		</Button>
	);
	const logoutButton = (
		<Button
			color="inherit"
			onClick={() => {
				signOut(auth);
			}}
		>
			Log out
		</Button>
	);
	const button =
		props.currentUser === null ? loginWithGoogleButton : logoutButton;

	return (
		<AppBar position="static">
			<Toolbar sx={{ width: '100%', maxWidth: 720, margin: 'auto' }}>
				<Typography variant="h6" component="div">
					Todo List App
				</Typography>
				<Box sx={{ flexGrow: 1 }} />
				{button}
			</Toolbar>
		</AppBar>
	);
};

function App() {
	const [currentUser, setCurrentUser] = useState(null);
	const [todoItemList, setTodoItemList] = useState([]);

	onAuthStateChanged(auth, (user) => {
		if (user) {
			setCurrentUser(user.uid);
		} else {
			setCurrentUser(null);
		}
	});

	const syncTodoItemListStateWithFirestore = () => {
		// 이 함수 call 될 때마다 firestore에서 모든 정보 읽어오고 todoItemList initialize 시키는것
		// app 처음 켜지면 db의 todoItem 다 읽어와라
		const q = query(
			collection(db, 'todoItem'),
			where('userId', '==', currentUser),
			orderBy('createdTime', 'desc')
		);

		// createdTime기준으로 sorting해서 가져와라
		getDocs(q).then((querySnapshot) => {
			const firestoreTodoItemList = [];
			querySnapshot.forEach((doc) => {
				firestoreTodoItemList.push({
					id: doc.id,
					todoItemContent: doc.data().todoItemContent,
					isFinished: doc.data().isFinished,
					createdTime: doc.data().createdTime ?? 0,
					userId: doc.data().userId,
				});
			});
			setTodoItemList(firestoreTodoItemList);
		});
	};
	useEffect(() => {
		syncTodoItemListStateWithFirestore();
	}, [currentUser]); // userId 바뀔때마다 새로 읽어와야함

	const onSubmit = async (newTodoItem) => {
		await addDoc(collection(db, 'todoItem'), {
			todoItemContent: newTodoItem,
			isFinished: false,
			createdTime: Math.floor(Date.now() / 1000),
			userId: currentUser,
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
		syncTodoItemListStateWithFirestore(); // 직접 state update필요없이 firestore 불러오기
	};

	const onRemoveClick = async (removedTodoItem) => {
		const todoItemRef = doc(db, 'todoItem', removedTodoItem.id);
		await deleteDoc(todoItemRef);
		syncTodoItemListStateWithFirestore();
	};
	return (
		<div className="App">
			<TodoListAppBar currentUser={currentUser} />
			<Container sx={{ paddingTop: 3 }}>
				<TodoItemInputField onSubmit={onSubmit} />
				<TodoItemList
					todoItemList={todoItemList}
					onTodoItemClick={onTodoItemClick}
					onRemoveClick={onRemoveClick}
				/>
			</Container>
		</div>
	);
}

export default App;
