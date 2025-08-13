import React, { createContext, useContext, useMemo, useState } from 'react';

const TodosContext = createContext(null);

export const TodosProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);

  const addTodo = (title) => {
    const trimmed = String(title || '').trim();
    if (!trimmed) return;
    const today = new Date().toLocaleDateString();
    setTodos(prev => ([
      ...prev,
      {
        id: Date.now(),
        title: trimmed,
        date: today,
        tasks: [],
      },
    ]));
  };

  const deleteTodo = (todoId) => {
    setTodos(prev => prev.filter(t => t.id !== todoId));
  };

  const addTask = (todoId, text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;
    setTodos(prev => prev.map(t => {
      if (t.id === todoId) {
        return {
          ...t,
          tasks: [...t.tasks, { id: Date.now(), text: trimmed, completed: false }],
        };
      }
      return t;
    }));
  };

  const toggleTask = (todoId, taskId) => {
    setTodos(prev => prev.map(t => {
      if (t.id === todoId) {
        return {
          ...t,
          tasks: t.tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task),
        };
      }
      return t;
    }));
  };

  const value = useMemo(() => ({
    todos,
    addTodo,
    deleteTodo,
    addTask,
    toggleTask,
  }), [todos]);

  return (
    <TodosContext.Provider value={value}>
      {children}
    </TodosContext.Provider>
  );
};

export const useTodos = () => {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error('useTodos must be used within a TodosProvider');
  return ctx;
};


