import React, { useState } from 'react';
import Login from './components/Login';
import TodoList from './components/TodoList';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Removed useEffect that was auto-authenticating via localStorage

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo Application</h1>
        {isAuthenticated && (
          <div className="user-info">
            <span>Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="logout-btn" id="logout-btn">
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="App-main">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <TodoList />
        )}
      </main>
    </div>
  );
}

export default App;
