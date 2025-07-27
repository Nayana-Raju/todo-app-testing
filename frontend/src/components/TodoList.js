import React, { useState, useEffect } from 'react';
import './TodoList.css';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      autoLogin();
    } else {
      fetchTodos();
    }
  }, []);

  const autoLogin = async () => {
    setIsAuthenticating(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'testuser', password: 'testpass' })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      const token = data.token || data.accessToken || data.access_token || data.authToken || data.jwt;
      if (!token) throw new Error('No token received from server');

      localStorage.setItem('token', token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      fetchTodos();
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    let headers = getAuthHeaders();
    if (!headers) {
      await autoLogin();
      headers = getAuthHeaders();
      if (!headers) return null;
    }

    try {
      const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        await autoLogin();
        headers = getAuthHeaders();
        if (!headers) return null;
        return await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
      }
      return response;
    } catch (err) {
      setError('Network error. Please check your connection.');
      return null;
    }
  };

  const fetchTodos = async () => {
    setIsLoading(true);
    setError('');
    const response = await makeAuthenticatedRequest('http://localhost:5000/api/todos');
    if (!response) return setIsLoading(false);
    try {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch todos');
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return setError('Title cannot be empty');
    setIsLoading(true);
    const response = await makeAuthenticatedRequest('http://localhost:5000/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title: newTodo.trim(), description: newDescription.trim(), completed: false })
    });
    if (!response) return setIsLoading(false);
    try {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add todo');
      setTodos([...todos, data]);
      setNewTodo('');
      setNewDescription('');
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const startEdit = (todo) => {
    setEditId(todo.id);
    setEditText(todo.title);
    setEditDescription(todo.description || '');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
    setEditDescription('');
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return setError('Title cannot be empty');
    setIsLoading(true);
    const response = await makeAuthenticatedRequest(`http://localhost:5000/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title: editText.trim(), description: editDescription.trim() })
    });
    if (!response) return setIsLoading(false);
    try {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update todo');
      setTodos(todos.map(t => t.id === id ? data : t));
      cancelEdit();
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const response = await makeAuthenticatedRequest(`http://localhost:5000/api/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !todo.completed })
    });
    if (!response) return;
    try {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update todo');
      setTodos(todos.map(t => t.id === id ? data : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmDelete = (todo) => {
    setTodoToDelete(todo);
    setShowDeleteModal(true);
  };

  const deleteConfirmed = async () => {
    const id = todoToDelete?.id;
    if (!id) return;
    const response = await makeAuthenticatedRequest(`http://localhost:5000/api/todos/${id}`, {
      method: 'DELETE'
    });
    if (!response) return;
    try {
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete todo');
      }
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
    }
    setShowDeleteModal(false);
    setTodoToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setTodoToDelete(null);
  };

  const refreshAuth = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    await autoLogin();
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  if (isAuthenticating) return <div className="todo-list-container"><div className="loading">Authenticating...</div></div>;

  return (
    <div className="todo-list-container">
      <div className="todo-header">
        <h2>My Todos</h2>
        <div className="todo-stats">
          <span>Active: {todos.filter(t => !t.completed).length}</span>
          <span>Completed: {todos.filter(t => t.completed).length}</span>
          <button onClick={refreshAuth} className="refresh-auth-btn">🔄</button>
          <button onClick={refreshAuth} className="view-list-btn">View List</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={addTodo} className="add-todo-form">
        <div className="form-group">
          <label htmlFor="todo-title" className="form-label">Title:</label>
          <input
            id="todo-title"
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter todo title..."
            className="todo-input"
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="todo-description" className="form-label">Description:</label>
          <input
            id="todo-description"
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Enter todo description..."
            className="todo-input"
            disabled={isLoading}
          />
        </div>
        
        <button type="submit" className="add-btn" disabled={isLoading || !newTodo.trim()}>
          {isLoading ? 'Adding...' : 'Add'}
        </button>
      </form>

      <div className="filter-buttons">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>Active</button>
        <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>Completed</button>
      </div>

      <div className="todos-list">
        {filteredTodos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="todo-checkbox"
            />
            {editId === todo.id ? (
              <div className="todo-edit-fields">
                <div className="edit-form-group">
                  <label className="edit-label">Title:</label>
                  <input 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)} 
                    className="edit-input" 
                  />
                </div>
                <div className="edit-form-group">
                  <label className="edit-label">Description:</label>
                  <input 
                    value={editDescription} 
                    onChange={(e) => setEditDescription(e.target.value)} 
                    className="edit-input" 
                  />
                </div>
              </div>
            ) : (
              <div className="todo-details" onDoubleClick={() => startEdit(todo)}>
                <div className="todo-field">
                  <span className="field-label">Title:</span>
                  <span className="field-value">{todo.title}</span>
                </div>
                {todo.description && (
                  <div className="todo-field">
                    <span className="field-label">Description:</span>
                    <span className="field-value">{todo.description}</span>
                  </div>
                )}
                {todo.createdAt && (
                  <div className="todo-field">
                    <span className="field-label">Created:</span>
                    <span className="field-value">{new Date(todo.createdAt).toLocaleString()}</span>
                  </div>
                )}
                {todo.updatedAt && (
                  <div className="todo-field">
                    <span className="field-label">Updated:</span>
                    <span className="field-value">{new Date(todo.updatedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
            <div className="todo-actions">
              {editId === todo.id ? (
                <>
                  <button onClick={() => saveEdit(todo.id)} className="save-btn">Save</button>
                  <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEdit(todo)} className="edit-btn">Edit</button>
                  <button onClick={() => confirmDelete(todo)} className="delete-btn">×</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Delete <strong>{todoToDelete?.title}</strong>?</p>
            <div className="modal-actions">
              <button onClick={deleteConfirmed} className="confirm-btn">Yes, Delete</button>
              <button onClick={cancelDelete} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;