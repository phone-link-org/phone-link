//import { useState } from 'react'

import Navbar from './components/Navbar';
import ContentBox from './components/ContentBox';

function App() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-primary-light dark:bg-primary-dark text-white dark:text-foreground-light rounded-lg shadow-md p-6 text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">테스트 배너</h1>
          <p className="text-base">Fuck you B9</p>
        </div>
      </main>
      <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto px-4">
        <ContentBox text="박스 1"></ContentBox>
        <ContentBox text="박스 2"></ContentBox>
      </div>
    </>
  )
}

export default App