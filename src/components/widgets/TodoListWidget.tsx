import React, { useState } from 'react';
import { Bell, Plus, Check } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoListWidget: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false
    };

    setTodos(prev => [...prev, todo]);
    setNewTodo('');
    setIsAdding(false);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">To-Do List</h3>
        <Bell className="text-emerald-600" size={20} />
      </div>

      {isAdding ? (
        <form onSubmit={handleAddTodo} className="mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter a new task..."
            className="w-full p-2 rounded border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Add Task
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-between text-[#1E1B4B] hover:bg-white/50 p-2 rounded transition-colors"
        >
          <span>Add task</span>
          <Plus size={20} />
        </button>
      )}

      {todos.length > 0 && (
        <div className="mt-4 space-y-2">
          {todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-2 p-2 rounded hover:bg-white/50 transition-colors"
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                  ${todo.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-gray-300 hover:border-emerald-600'
                  }`}
              >
                {todo.completed && <Check size={12} />}
              </button>
              <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                {todo.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoListWidget;