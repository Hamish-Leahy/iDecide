import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Edit, Check, X, Calendar } from 'lucide-react';
import { Card } from '../common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
}

interface TaskListWidgetProps {
  className?: string;
}

export function TaskListWidget({ className = '' }: TaskListWidgetProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    dueDate: '', 
    priority: 'medium' as const 
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadTasks = async () => {
      if (!user) return;
      
      // First try localStorage for immediate display
      const savedTasks = localStorage.getItem(`tasks_${user.id}`);
      if (savedTasks) {
        try {
          const parsedTasks = JSON.parse(savedTasks);
          // Convert string dates back to Date objects
          const processedTasks = parsedTasks.map((task: any) => ({
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined
          }));
          setTasks(processedTasks);
        } catch (e) {
          console.error('Failed to parse saved tasks', e);
        }
      }
      
      // Then try to load from database
      try {
        const { data, error } = await supabase
          .from('user_tasks')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedTasks = data.map(task => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            dueDate: task.due_date ? new Date(task.due_date) : undefined,
            priority: task.priority || 'medium'
          }));
          
          setTasks(formattedTasks);
          // Update localStorage with latest from DB
          localStorage.setItem(`tasks_${user.id}`, JSON.stringify(formattedTasks));
        }
      } catch (err) {
        console.error('Error loading tasks from database:', err);
      }
    };
    
    loadTasks();
  }, [user]);
  
  // Save tasks to localStorage and database whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      if (!user || tasks.length === 0) return;
      
      // Always update localStorage for immediate feedback
      localStorage.setItem(`tasks_${user.id}`, JSON.stringify(tasks));
      
      // Then update the database
      try {
        // First delete all existing tasks
        await supabase
          .from('user_tasks')
          .delete()
          .eq('user_id', user.id);
          
        // Then insert the current tasks
        const tasksToInsert = tasks.map(task => ({
          user_id: user.id,
          title: task.title,
          completed: task.completed,
          due_date: task.dueDate?.toISOString(),
          priority: task.priority
        }));
        
        const { error } = await supabase
          .from('user_tasks')
          .insert(tasksToInsert);
          
        if (error) throw error;
      } catch (err) {
        console.error('Error saving tasks to database:', err);
      }
    };
    
    if (user && tasks.length > 0) {
      saveTasks();
    }
  }, [tasks, user]);
  
  const handleAddTask = () => {
    if (newTask.title.trim()) {
      if (editingId) {
        setTasks(tasks.map(task => 
          task.id === editingId 
            ? { 
                ...task, 
                title: newTask.title, 
                dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
                priority: newTask.priority
              } 
            : task
        ));
        setEditingId(null);
      } else {
        const task: Task = {
          id: Date.now().toString(),
          title: newTask.title,
          completed: false,
          dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
          priority: newTask.priority
        };
        setTasks([...tasks, task]);
      }
      setNewTask({ title: '', dueDate: '', priority: 'medium' });
      setShowAddForm(false);
    }
  };
  
  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  const editTask = (task: Task) => {
    setNewTask({ 
      title: task.title, 
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      priority: task.priority
    });
    setEditingId(task.id);
    setShowAddForm(true);
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const cancelEdit = () => {
    setNewTask({ title: '', dueDate: '', priority: 'medium' });
    setEditingId(null);
    setShowAddForm(false);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const isOverdue = (date?: Date) => {
    if (!date) return false;
    return date < new Date();
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return '';
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Card className={`${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckSquare size={18} className="text-[#1E1B4B]" />
            Tasks
          </h3>
          {!showAddForm && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="p-1 rounded-full hover:bg-[#E5EDEB] text-[#1E1B4B]"
              title="Add task"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        
        {showAddForm && (
          <div className="mb-4 p-3 bg-[#E5EDEB] rounded-lg">
            <div className="space-y-3">
              <input 
                type="text" 
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                placeholder="Task title"
                autoFocus
              />
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-[#1E1B4B] focus:border-[#1E1B4B] pl-8"
                    />
                    <Calendar size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full p-2 text-sm border rounded focus:ring-1 focus:ring-[#1E1B4B] focus:border-[#1E1B4B]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="px-3 py-1 text-xs bg-[#1E1B4B] text-white rounded hover:bg-[#2D2A6A]"
                >
                  {editingId ? 'Update' : 'Add'} Task
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
          {tasks.length > 0 ? (
            tasks.map(task => (
              <div 
                key={task.id}
                className={`flex items-start justify-between p-2 rounded-lg group ${
                  task.completed ? 'bg-[#F5F8F7]' : 'hover:bg-[#F5F8F7]'
                }`}
              >
                <div className="flex items-start gap-2 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 border rounded ${
                      task.completed 
                        ? 'bg-[#1E1B4B] border-[#1E1B4B] text-white flex items-center justify-center' 
                        : 'border-gray-300 hover:border-[#1E1B4B]'
                    }`}
                  >
                    {task.completed && <Check size={12} />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.dueDate && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isOverdue(task.dueDate) && !task.completed
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => editTask(task)}
                    className="p-1 text-gray-400 hover:text-[#1E1B4B]"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              <p>No tasks yet</p>
              {!showAddForm && (
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 text-[#1E1B4B] hover:text-[#2D2A6A]"
                >
                  Add your first task
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}