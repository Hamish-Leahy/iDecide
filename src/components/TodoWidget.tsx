import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, Plus } from 'lucide-react';
import { useTodoStore, Todo } from '../store/todoStore';
import TodoModal from './TodoModal';

const TodoItem = ({ todo }: { todo: Todo }) => {
  const { toggleTodo, deleteTodo } = useTodoStore();
  
  return (
    <div className="flex items-center gap-4 py-3 group">
      <button 
        onClick={() => toggleTodo(todo.id)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors
          ${todo.completed ? 'border-gray-400 text-gray-400 bg-gray-50' : 'border-current hover:bg-gray-50'}`}
        aria-checked={todo.completed}
        role="checkbox"
      >
        {todo.completed && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1">
        <span className={todo.completed ? 'text-gray-400 line-through' : ''}>
          {todo.label}
        </span>
        {todo.dueDate && (
          <div className="text-xs text-gray-500 mt-1">
            {format(new Date(todo.dueDate), 'MMM d, yyyy')}
          </div>
        )}
      </div>
      <button
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

const TodoWidget = () => {
  const { todos, addTodo } = useTodoStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTodo = (task: string) => {
    addTodo({
      label: task,
      completed: false,
      priority: 'medium',
      dueDate: null,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">To-Do List</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-[#2D5959] hover:bg-[#2D5959] hover:text-white transition-colors"
          aria-label="Add new task"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}

      <TodoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTodo}
      />
    </div>
  );
};

export default TodoWidget;