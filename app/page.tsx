'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Reorder, useDragControls } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Separate active and completed tasks
  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  // Add new task
  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        isCompleted: false,
        sortOrder: tasks.length,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };

  // Complete/uncomplete task
  const toggleComplete = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  // Delete task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Update task title
  const updateTaskTitle = (id: string, newTitle: string) => {
    if (newTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, title: newTitle } : task
      ));
    } else {
      deleteTask(id);
    }
    setEditingId(null);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, taskId?: string) => {
    if (e.key === 'Enter') {
      if (taskId) {
        setEditingId(null);
      } else {
        addTask();
      }
    } else if (e.key === 'Backspace' && taskId) {
      const target = e.target as HTMLInputElement;
      if (target.value === '') {
        deleteTask(taskId);
        setEditingId(null);
      }
    }
  };

  // Handle reordering
  const handleReorder = (newOrder: Task[]) => {
    const updatedTasks = newOrder.map((task, index) => ({
      ...task,
      sortOrder: index,
    }));
    setTasks([...updatedTasks, ...completedTasks]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-2">
            Today
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {activeTasks.length} {activeTasks.length === 1 ? 'task' : 'tasks'} remaining
          </p>
        </div>

        {/* New Task Input */}
        <div className="mb-6">
          <input
            ref={inputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
            placeholder="Add a new task..."
            className="w-full text-2xl md:text-3xl font-medium bg-transparent border-none outline-none placeholder-slate-400 dark:placeholder-slate-600 text-slate-900 dark:text-white pb-4"
          />
          <div className="h-0.5 bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-700"></div>
        </div>

        {/* Active Tasks */}
        <Reorder.Group
          axis="y"
          values={activeTasks}
          onReorder={handleReorder}
          className="space-y-3 mb-8"
        >
          {activeTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isEditing={editingId === task.id}
              onEdit={(id) => setEditingId(id)}
              onUpdate={updateTaskTitle}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onKeyDown={handleKeyDown}
            />
          ))}
        </Reorder.Group>

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-500 mb-4 uppercase tracking-wide text-sm">
              Completed ({completedTasks.length})
            </h2>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="group relative p-4 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 opacity-50 transition-all duration-200 hover:opacity-70"
                  onClick={() => toggleComplete(task.id)}
                >
                  <div className="flex items-center gap-3 cursor-pointer">
                    <span className="text-lg md:text-xl text-slate-600 dark:text-slate-400 line-through">
                      {task.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hint Text */}
        <div className="mt-12 text-center text-sm text-slate-400 dark:text-slate-600">
          <p>Press Enter to add • Click to edit • Cmd+Click to complete</p>
        </div>
      </div>
    </div>
  );
}

// Task Item Component
function TaskItem({
  task,
  isEditing,
  onEdit,
  onUpdate,
  onToggle,
  onDelete,
  onKeyDown,
}: {
  task: Task;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>, taskId: string) => void;
}) {
  const [editValue, setEditValue] = useState(task.title);
  const editInputRef = useRef<HTMLInputElement>(null);
  const controls = useDragControls();

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      onToggle(task.id);
    } else if (!isEditing) {
      onEdit(task.id);
    }
  };

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      className="group relative"
      whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
    >
      <div
        className="relative p-6 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
        onClick={handleClick}
        onPointerDown={(e) => controls.start(e)}
      >
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => onUpdate(task.id, editValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onUpdate(task.id, editValue);
              } else {
                onKeyDown(e, task.id);
              }
            }}
            className="w-full text-xl md:text-2xl font-medium bg-transparent border-none outline-none text-white placeholder-white/70"
          />
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xl md:text-2xl font-medium text-white pr-8">
              {task.title}
            </span>
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/30"
        >
          ×
        </button>
      </div>
    </Reorder.Item>
  );
}
