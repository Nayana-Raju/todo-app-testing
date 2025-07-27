import React, { useState } from 'react';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: todo.title,
    description: todo.description
  });

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = () => {
    if (!editData.title.trim()) {
      return;
    }
    onUpdate(todo.id, editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      title: todo.title,
      description: todo.description
    });
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      onDelete(todo.id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`} data-testid={`todo-${todo.id}`}>
      {!isEditing ? (
        <>
          <div className="todo-header">
            <h3 className={`todo-title ${todo.completed ? 'completed' : ''}`}>
              {todo.title}
            </h3>
            <div className="todo-actions">
              <button
                className={`complete-btn ${todo.completed ? 'completed' : ''}`}
                onClick={handleToggleComplete}
                id={`complete-${todo.id}`}
              >
                {todo.completed ? 'Undo' : 'Complete'}
              </button>
              <button
                className="edit-btn"
                onClick={() => setIsEditing(true)}
                id={`edit-${todo.id}`}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={handleDelete}
                id={`delete-${todo.id}`}
              >
                Delete
              </button>
            </div>
          </div>
          
          {todo.description && (
            <div className="todo-description">{todo.description}</div>
          )}
          
          <div className="todo-meta">
            Created: {formatDate(todo.createdAt)}
            {todo.completed && ' • Completed'}
          </div>
        </>
      ) : (
        <div className="edit-form">
          <input
            type="text"
            name="title"
            value={editData.title}
            onChange={handleEditChange}
            placeholder="Todo title"
            id={`edit-title-${todo.id}`}
          />
          <textarea
            name="description"
            value={editData.description}
            onChange={handleEditChange}
            placeholder="Todo description"
            id={`edit-description-${todo.id}`}
          />
          <div className="edit-actions">
            <button 
              className="save-btn" 
              onClick={handleSaveEdit}
              id={`save-${todo.id}`}
            >
              Save
            </button>
            <button 
              className="cancel-btn" 
              onClick={handleCancelEdit}
              id={`cancel-${todo.id}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;