import React, { useState } from "react";

function AddBar({ addTodo }: { addTodo: (name: string) => void }) {
  const [todoName, setTodoName] = useState("");
  return (
    <input
      value={todoName}
      onChange={(e) => setTodoName(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          console.log("add");
          addTodo(todoName);
          setTodoName("");
        }
      }}
      placeholder="add todo"
      className="w-full appearance-none border border-gray-300 rounded-lg py-2 px-4"
    />
  );
}

function TodoLine({ name }: { name: string }) {
  const slow = Date.now() + 100;
  while (Date.now() < slow) {}
  return (
    <li className="w-full border border-gray-500 rounded-lg py-2 px-4 mt-2">
      {name}
    </li>
  );
}

function App() {
  const [todoList, setTodoList] = useState<string[]>([]);
  console.log(todoList);
  return (
    <div className="flex flex-row justify-center">
      <div className="container flex flex-col">
        <h1 className="underline text-red">TODOLIST</h1>
        <AddBar addTodo={(name: string) => setTodoList([...todoList, name])} />
        <ul>
          {todoList.map((name) => (
            <TodoLine name={name} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
