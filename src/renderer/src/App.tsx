import React, { useState, useEffect } from 'react'
import Versions from './components/Versions'

function App(): React.JSX.Element {
  const [duration, setDuration] = useState<number>(0)
  const [task, setTask] = useState<string>('')
  const [isFocusing, setIsFocusing] = useState<boolean>(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (duration <= 0 || !task) return

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
      console.log('Session Expired')
      setIsFocusing(false)
      window.electron.ipcRenderer.send('end-focus-mode')
      setTimeLeft(0)
    }
    return () => clearInterval(interval)
  }, [isFocusing, timeLeft])

  useEffect(() => {
    window.electron.ipcRenderer.on('lock-screen-trigger', () => {
      setIsLocked(true)
      setIsFocusing(false)
    })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('lock-screen-trigger')
    }
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.on('unlock-screen-trigger', () => {
      setIsLocked(false)
      setIsFocusing(false)
      setTimeLeft(0)
      setTask('')
      setDuration(0)
      window.electron.ipcRenderer.send('end-focus-mode')
    })
    return () => {
      window.electron.ipcRenderer.removeAllListeners('unlock-screen-trigger')
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
          backgroundColor: '#0B0B0B',
          color: '#D93A3A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0
        }}
      >
        <div
          style={{
            border: '2px solid #D93A3A',
            padding: '4rem',
            textAlign: 'center',
            maxWidth: '800px'
          }}
        >
          <h1
            style={{
              fontSize: '4rem',
              borderBottom: 'none',
              marginBottom: '1rem',
              letterSpacing: '10px'
            }}
          >
            LOCKED
          </h1>
          <p
            style={{
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '1.2rem',
              marginBottom: '2rem'
            }}
          >
            VIOLATION DETECTED // SYSTEM OVERRIDE ACTIVE
          </p>
          <p style={{ color: '#EDEDED', fontFamily: 'monospace' }}>
            AUTHORITY NOTIFIED. AWAITING JUDGEMENT.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <h1>MANUAL_OVERLORD_V1</h1>

      {isFocusing ? (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <div className="timer-display">{formatTime(timeLeft)}</div>
          <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '12px', marginBottom: '0.5rem' }}>CURRENT DIRECTIVE</h2>
            <p style={{ fontSize: '18px', letterSpacing: '1px' }}>{task.toUpperCase()}</p>
          </div>
          <button onClick={handleExit} style={{ borderColor: '#D93A3A', color: '#D93A3A' }}>
            ABORT SESSION
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            DIRECTIVE (Task)
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="ENTER OBJECTIVE..."
              spellCheck={false}
            />
          </label>

          <label>
            DURATION (MINUTES)
            <input
              type="number"
              value={duration === 0 ? '' : duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="00"
            />
          </label>

          <button type="submit" style={{ marginTop: '2rem' }}>
            INITIATE PROTOCOL
          </button>
        </form>
      )}
      <Versions />
    </>
  )
}

export default App
