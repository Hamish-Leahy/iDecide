import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: string) => void;
}

const TodoModal = ({ isOpen, onClose, onSubmit }: TodoModalProps) => {
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    onSubmit(task);
    setTask('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">Add New Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
              Task Description
            </label>
            <input
              id="task"
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Enter your task..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D5959] focus:border-transparent"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2D5959] text-white rounded-lg hover:bg-opacity-90"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoModal;