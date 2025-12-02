
import React, { useState, useEffect } from 'react'

function App(): React.JSX.Element {

  const [duration, setDuration] = useState<number>(0)
  const [task, setTask] = useState<string>('')
  const [isFocusing, setIsFocusing] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    console.log('Task:', task)
    console.log('Duration:', duration)
    setIsFocusing(true)
    window.electron.ipcRenderer.send('start-focus-mode', duration, task)
    setTimeLeft(duration * 60)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isFocusing && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0 && isFocusing) {
      console.log('Time Runs Out')
      setIsFocusing(false)
      window.electron.ipcRenderer.send('end-focus-mode')
      setTimeLeft(0)

      //ALSO NEED TO EXPAND WINDOW AGAIN HERE!
    }
    //cleanup function here basically ensure only 1 timer at once
    return () => clearInterval(interval)
  }, [isFocusing, timeLeft])

  useEffect(() => {
    window.electron.ipcRenderer.on('lock-screen-trigger', () => {
      setIsLocked(true)
      setIsFocusing(false)
    })
    return () => {
      //possible cleanup might be needed, not sure if this needs to be done here.
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }
  const handleExit = (): void => {
    setIsFocusing(false)
    setTimeLeft(0)
    window.electron.ipcRenderer.send('end-focus-mode')
  }

  if (isLocked) {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: 'black',
          color: 'red',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}
      >
        <h1 style={{ fontSize: '5rem' }}>LOCKED</h1>
        <p>POKE HAS BEEN NOTIFIED.</p>
        <p>Explain yourself to the Judge to unlock.</p>
      </div>
    )
  }

  return (
    <>
      <h1>Manual Overlord</h1>

      {isFocusing ? (
        <div>
          <h2>Time Remaining: {formatTime(timeLeft)}</h2>
          <p>Focusing on: {task}</p>
          <button onClick={handleExit}>Stop and Exit</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Task:
            <input type="text" value={task} onChange={(e) => setTask(e.target.value)} />
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
      )}
    </>
  )
}

export default App
