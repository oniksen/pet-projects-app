import { Route, Routes } from 'react-router-dom'
import { Layout } from './Layout'
import { RequireAdmin } from './guards/RequireAdmin'
import { ProjectsPage } from '../features/projects/ProjectsPage'
import { ProjectDetailsPage } from '../features/projects/ProjectDetailsPage'
import { NotesPage } from '../features/notes/NotesPage'
import { AboutPage } from '../features/about/AboutPage'
import { LoginPage } from '../features/auth/LoginPage'
import { NotFoundPage } from '../features/misc/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<ProjectsPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="notes"
          element={
            <RequireAdmin>
              <NotesPage />
            </RequireAdmin>
          }
        />
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
