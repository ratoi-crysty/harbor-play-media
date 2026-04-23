import { Navigate, Route, Routes } from 'react-router-dom';
import { DirAAlbumPage } from '../components/pages/DirAAlbumPage';
import { DirAHomePage } from '../components/pages/DirAHomePage';
import { DirALayout } from '../components/pages/DirALayout';
import { DirAWatchPage } from '../components/pages/DirAWatchPage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dir-a" replace />} />
      <Route path="/dir-a" element={<DirALayout />}>
        <Route index element={<DirAHomePage />} />
        <Route path="watch/:videoId" element={<DirAWatchPage />} />
        <Route path="album/:playlistId" element={<DirAAlbumPage />} />
      </Route>
    </Routes>
  );
}

export default App;
