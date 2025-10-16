import React, { useState, useEffect } from 'react';
import { todoAPI } from '../api';

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getAll();
      setTodos(response.data);
    } catch (err) {
      setError('Failed to load todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    try {
      await todoAPI.create(newTodo);
      setNewTodo({ title: '', description: '', priority: 'medium', due_date: '' });
      loadTodos(); // Refresh the list
    } catch (err) {
      setError('Failed to create todo');
      console.error(err);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await todoAPI.update(id, { completed: !completed });
      loadTodos(); // Refresh the list
    } catch (err) {
      setError('Failed to update todo');
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoAPI.delete(id);
      loadTodos(); // Refresh the list
    } catch (err) {
      setError('Failed to delete todo');
      console.error(err);
    }
  };

  if (loading) return <div>Loading todos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="todos-section">
      <h2>📋 Todo List</h2>
      
      <form onSubmit={handleCreateTodo} className="todo-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Todo title"
            value={newTodo.title}
            onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <textarea
            placeholder="Description (optional)"
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <select
              value={newTodo.priority}
              onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="form-group">
            <input
              type="date"
              value={newTodo.due_date}
              onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
            />
          </div>
        </div>
        <button type="submit" className="add-btn">Add Todo</button>
      </form>

      <div className="todos-list">
        {todos.length === 0 ? (
          <p>No todos yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className={`todo-item priority-${todo.priority} ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-content">
                <h3>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo.id, todo.completed)}
                  />
                  <span className={todo.completed ? 'completed-text' : ''}>{todo.title}</span>
                </h3>
                {todo.description && <p>{todo.description}</p>}
                {todo.due_date && (
                  <p className="due-date">
                    Due: {new Date(todo.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="todo-actions">
                <span className={`priority-badge priority-${todo.priority}`}>
                  {todo.priority}
                </span>
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Todos;