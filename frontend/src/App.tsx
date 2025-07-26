import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import OfferPage from './pages/OfferPage';
import NotFound from './pages/NotFound';
import MainPage from './pages/MainPage';
import CommunityPage from './pages/CommunityPage';

function App() {
  return (
    <div className='App'>
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />}/>
        <Route path="/offer" element={<OfferPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App