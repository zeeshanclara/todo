'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  sortOrder: number;
}

type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'DELETE_TASK'; task: Task; index: number }
  | { type: 'TOGGLE_COMPLETE'; taskId: string; wasCompleted: boolean }
  | { type: 'UPDATE_TASK'; taskId: string; oldTitle: string; newTitle: string };

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [undoStack, setUndoStack] = useState<Action[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Separate active and completed tasks
  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  // Undo function
  const undo = () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    setUndoStack(newUndoStack);

    switch (lastAction.type) {
      case 'ADD_TASK':
        setTasks(tasks.filter(t => t.id !== lastAction.task.id));
        break;
      case 'DELETE_TASK':
        const updatedTasks = [...tasks];
        updatedTasks.splice(lastAction.index, 0, lastAction.task);
        setTasks(updatedTasks);
        break;
      case 'TOGGLE_COMPLETE':
        setTasks(tasks.map(t =>
          t.id === lastAction.taskId ? { ...t, isCompleted: lastAction.wasCompleted } : t
        ));
        break;
      case 'UPDATE_TASK':
        setTasks(tasks.map(t =>
          t.id === lastAction.taskId ? { ...t, title: lastAction.oldTitle } : t
        ));
        break;
    }
  };

  // Listen for Cmd+Z
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, tasks]);

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
      setUndoStack([...undoStack, { type: 'ADD_TASK', task: newTask }]);
      setNewTaskTitle('');
    }
  };

  // Complete/uncomplete task
  const toggleComplete = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setUndoStack([...undoStack, {
      type: 'TOGGLE_COMPLETE',
      taskId: id,
      wasCompleted: task.isCompleted
    }]);
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  // Delete task
  const deleteTask = (id: string) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    const task = tasks[taskIndex];
    if (!task) return;

    setUndoStack([...undoStack, { type: 'DELETE_TASK', task, index: taskIndex }]);
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Update task title
  const updateTaskTitle = (id: string, newTitle: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (newTitle.trim() && newTitle !== task.title) {
      setUndoStack([...undoStack, {
        type: 'UPDATE_TASK',
        taskId: id,
        oldTitle: task.title,
        newTitle
      }]);
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, title: newTitle } : task
      ));
    } else if (!newTitle.trim()) {
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
        <AnimatePresence>
          <Reorder.Group
            axis="y"
            values={activeTasks}
            onReorder={handleReorder}
            className="space-y-3 mb-8"
          >
            {activeTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                totalTasks={activeTasks.length}
                isEditing={editingId === task.id}
                onEdit={(id) => setEditingId(id)}
                onUpdate={updateTaskTitle}
                onToggle={toggleComplete}
                onDelete={deleteTask}
                onKeyDown={handleKeyDown}
              />
            ))}
          </Reorder.Group>
        </AnimatePresence>

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
          <p>2-finger swipe right to delete • Cmd+Z to undo • Cmd+Click to complete</p>
        </div>
      </div>
    </div>
  );
}

// Task Item Component
function TaskItem({
  task,
  index,
  totalTasks,
  isEditing,
  onEdit,
  onUpdate,
  onToggle,
  onDelete,
  onKeyDown,
}: {
  task: Task;
  index: number;
  totalTasks: number;
  isEditing: boolean;
  onEdit: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>, taskId: string) => void;
}) {
  const [editValue, setEditValue] = useState(task.title);
  const [isDraggingToDelete, setIsDraggingToDelete] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const editInputRef = useRef<HTMLInputElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);
  const controls = useDragControls();
  const swipeAccumulator = useRef(0);
  const swipeTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Handle two-finger trackpad swipe
  useEffect(() => {
    const taskElement = taskRef.current;
    if (!taskElement) return;

    const handleWheel = (e: WheelEvent) => {
      // Detect horizontal swipe (two-finger swipe on trackpad)
      // On macOS, horizontal scrolling has deltaX
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();

        // Accumulate swipe distance
        swipeAccumulator.current -= e.deltaX; // Invert to match natural swipe direction

        // Only process swipe right (positive accumulated value)
        if (swipeAccumulator.current > 0) {
          setSwipeOffset(Math.min(swipeAccumulator.current, 300));
          setIsDraggingToDelete(true);
        }

        // Clear timeout and set new one
        if (swipeTimeout.current) {
          clearTimeout(swipeTimeout.current);
        }

        swipeTimeout.current = setTimeout(() => {
          // Check if swipe threshold was exceeded
          if (swipeAccumulator.current > 150) {
            onDelete(task.id);
          } else {
            // Reset swipe
            setSwipeOffset(0);
            setIsDraggingToDelete(false);
          }
          swipeAccumulator.current = 0;
        }, 100);
      }
    };

    taskElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      taskElement.removeEventListener('wheel', handleWheel);
      if (swipeTimeout.current) {
        clearTimeout(swipeTimeout.current);
      }
    };
  }, [task.id, onDelete]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      onToggle(task.id);
    } else if (!isEditing && !isDraggingToDelete) {
      onEdit(task.id);
    }
  };

  // Calculate color based on position (smooth gradient flow from top to bottom)
  const getTaskColor = () => {
    if (totalTasks === 1) {
      return { backgroundColor: 'hsl(0, 85%, 55%)' };
    }

    const ratio = index / (totalTasks - 1);
    const hue = 0 + (ratio * 45);
    const saturation = 85;
    const lightness = 55;

    return { backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)` };
  };

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      className="group relative"
      whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
      exit={{ x: 500, opacity: 0, transition: { duration: 0.3 } }}
    >
      <motion.div
        ref={taskRef}
        drag="x"
        dragConstraints={{ left: 0, right: 300 }}
        dragElastic={0.1}
        onDragStart={() => setIsDraggingToDelete(true)}
        onDragEnd={(_e, info) => {
          setIsDraggingToDelete(false);
          if (info.offset.x > 150) {
            onDelete(task.id);
          }
        }}
        animate={{ x: swipeOffset }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={getTaskColor()}
        className="relative p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer"
        onClick={handleClick}
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
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                controls.start(e);
              }}
              className="cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-white/70"
              >
                <circle cx="6" cy="4" r="1.5" fill="currentColor" />
                <circle cx="6" cy="10" r="1.5" fill="currentColor" />
                <circle cx="6" cy="16" r="1.5" fill="currentColor" />
                <circle cx="14" cy="4" r="1.5" fill="currentColor" />
                <circle cx="14" cy="10" r="1.5" fill="currentColor" />
                <circle cx="14" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </div>
          </div>
        )}
      </motion.div>
    </Reorder.Item>
  );
}
