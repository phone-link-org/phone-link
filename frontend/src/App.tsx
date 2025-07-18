import './App.css'
import { useState } from 'react'

import ThemeToggleButton from './components/ThemeToggleButton'

function App() {
  const [message, setMessage] = useState('')

  const handleClick = async () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const res = await fetch(`${apiUrl}/api/good`);
    const text = await res.text();
    setMessage(text);
  }

  return (
    <>
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark p-8">
      <ThemeToggleButton />
      <p className="mt-4">
        Tailwind + ThemeContext 다크모드 예제입니다.
      </p>
      <p className='text-4xl text-primary-light dark:text-primary-dark'>PhoneLink</p>
    </div>
      <button
        className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleClick}
      >
        서버에 Good 요청 보내기
      </button>
      {message && (
        <div className="mt-4 text-2xl text-green-600">{message}</div>
      )}
    </>
  )
}

export default App
