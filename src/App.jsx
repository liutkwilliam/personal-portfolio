import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom'; // "react-router-dom": "^6.22.1"
import './App.css'
import Default from './layouts/Default';
import Home from './pages/Home';
import Page from './layouts/Page';
import About from './pages/About';
import PortfolioPage from './pages/PortfolioPage';
import Portfolio from './layouts/Portfolio';
import PortfolioEntry from './pages/PortfolioEntry';
import NotFoundPage from './pages/NotFoundPage';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminLogin from './pages/Admin/AdminLogin';
import RequireAdminAuth from './components/RequireAdminAuth';
import SideProjects from './pages/SideProjects';

function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* default layout */}
        <Route path="/" element={<Default />}>
          <Route index element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>
        {/* page layout */}
        <Route path="/" element={<Page />}>
          {/* <Route path="/blog" element={<PortfolioPage type="posts" />} /> */}
          <Route path="/portfolio" element={<PortfolioPage type="portfolio" />} />
          <Route path="/developer" element={<PortfolioPage type="developer" />} />
          {/* <Route path="/gallery" element={<Navigate to="/photography" replace />} /> */}
          <Route path="sideprojects" element={<SideProjects />} />
        </Route>
        {/* portfolio layout */}
        <Route element={<Portfolio />}>
          {/* <Route path="/blog/:id" element={<PortfolioEntry type="posts" />} /> */}
          <Route path="/portfolio/:id" element={<PortfolioEntry type="portfolio" />} />
          <Route path="/developer/:id" element={<PortfolioEntry type="developer" />} />
        </Route>
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<RequireAdminAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
