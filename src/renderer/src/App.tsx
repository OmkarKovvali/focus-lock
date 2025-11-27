import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import React, { useState } from 'react'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const[duration,setDuration] = useState<number>(0);
  const[task,setTask] = useState<string>('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Task:",task);
    console.log("Duration:",duration);
  };

  return (
    <>
    <h1>Manual Overlord</h1>
    <form onSubmit={handleSubmit}>
      <label>
        Task:
        <input
          type="text"
          value = {task}
          onChange = {(e) => setTask(e.target.value)}
        />
      </label>

      <label>
      Duration (minutes):
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      />
    </label>

    <button type="submit">Start Focus Session</button>
    </form>
    </>
  )
}

export default App
