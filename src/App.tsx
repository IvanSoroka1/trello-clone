import { useState } from 'react'
import './App.css'
import * as React from 'react'



function App() {
  const [ username, setUsername ] = useState('');
  const [ password, setPassword ] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login Attempt', username, password)
  };


  return (
    <div className="flex flex-col justify-center min-h-screen items-center">
      <div className="text-6xl text-bold mb-16">
        Task Managing App
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col">
        Username
        <input
          value={username}
          className="border rounded bg-white"
          onChange={(e) => { setUsername(e.target.value) }}
        >
        </input>

        <p 
        className="mt-6"
        > Password </p>
        <input className="border rounded bg-white"
        value={password}
        onChange={(e) => { setPassword(e.target.value) }} 
        >
        </input>

        <div className="flex mt-6 gap-2">
          <button className="border rounded">Login</button>
          <button className="border rounded">
            Register
          </button>
        </div>
      </form>
    </div>
  )
}

export default App
