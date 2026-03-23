import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme';
import WebsiteLayout from './layouts/WebsiteLayout';
import AppLayout from './layouts/AppLayout';
import FreelancerLayout from './layouts/FreelancerLayout';
import HomePage from './pages/public/HomePage';
import FreelancerDirectoryPage from './pages/public/FreelancerDirectoryPage';
import FreelancerProfilePage from './pages/public/FreelancerProfilePage';
import CoverArchivePage from './pages/public/CoverArchivePage';
import CoverDetailPage from './pages/public/CoverDetailPage';
import TalentDatabasePage from './pages/internal/TalentDatabasePage';
import ReviewQueuePage from './pages/internal/ReviewQueuePage';
import FoldersPage from './pages/internal/FoldersPage';
import FolderDetailPage from './pages/internal/FolderDetailPage';
import ProfileEditorPage from './pages/freelancer/ProfileEditorPage';
import PortfolioPage from './pages/freelancer/PortfolioPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public website */}
            <Route element={<WebsiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/freelancers" element={<FreelancerDirectoryPage />} />
              <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />
              <Route path="/covers" element={<CoverArchivePage />} />
              <Route path="/covers/:id" element={<CoverDetailPage />} />
            </Route>

            {/* Internal application */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<TalentDatabasePage />} />
              <Route path="talent" element={<TalentDatabasePage />} />
              <Route path="covers" element={<CoverArchivePage />} />
              <Route path="review" element={<ReviewQueuePage />} />
              <Route path="folders" element={<FoldersPage />} />
              <Route path="folders/:folderId" element={<FolderDetailPage />} />
            </Route>

            {/* Freelancer portal */}
            <Route path="/portal" element={<FreelancerLayout />}>
              <Route index element={<ProfileEditorPage />} />
              <Route path="profile" element={<ProfileEditorPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
