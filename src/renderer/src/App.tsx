import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import React, { useState } from 'react'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const[duration,setDuration] = useState<number>(0);
  const[task,setTask] = useState<string>('');
  const [isFocusing,setIsFocusing] = useState<boolean>(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Task:",task);
    console.log("Duration:",duration);
    setIsFocusing(true);
    window.electron.ipcRenderer.send('start-focus-mode',duration,task);
    

  };

  return (
    <>
    <h1>Manual Overlord</h1>
    {isFocusing ? (
      <div>
        <h2>Time Remaining: {duration}:00</h2>
        <p>Focusing on: {task}</p>
      </div>
    ):(
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
      
    )
    )}
    
    
    </>
  )
}

export default App
