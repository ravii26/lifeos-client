import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { DumpPage } from "@/features/capture/pages/DumpPage";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { SessionLoader } from "@/features/auth/SessionLoader";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { AreasPage } from "@/features/areas/pages/AreasPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { GoalsPage } from "@/features/goals/pages/GoalsPage";
import { HabitsPage } from "@/features/habits/pages/HabitsPage";
import { TopicsPage } from "@/features/knowledge/pages/TopicsPage";
import { TopicDetailPage } from "@/features/knowledge/pages/TopicDetailPage";
import { NoteEditorPage } from "@/features/knowledge/pages/NoteEditorPage";
import { VaultPage } from "@/features/vault/pages/VaultPage";
import { ReviewsPage } from "@/features/reviews/pages/ReviewsPage";
import { ReviewDetailPage } from "@/features/reviews/pages/ReviewDetailPage";
import { CalendarPage } from "@/features/calendar/pages/CalendarPage";
import { IdentityPage } from "@/features/identity/pages/IdentityPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { ImmersiveMode } from "@/features/focus/pages/ImmersiveMode";
import { TasksPage } from "@/features/tasks/pages/TasksPage";

function App() {
  return (
    <BrowserRouter>
      <SessionLoader>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — gated, then framed by the app shell */}
          <Route element={<ProtectedRoute />}>
            {/* Full-screen, outside the shell */}
            <Route path="/focus" element={<ImmersiveMode />} />
            <Route element={<AppShell />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/areas" element={<AreasPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/review" element={<ReviewsPage />} />
              <Route path="/review/:reviewId" element={<ReviewDetailPage />} />
              <Route path="/learn" element={<TopicsPage />} />
              <Route path="/learn/:topicId" element={<TopicDetailPage />} />
              <Route path="/learn/:topicId/notes/:noteId" element={<NoteEditorPage />} />
              <Route path="/vault" element={<VaultPage />} />
              <Route path="/dump" element={<DumpPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/identity" element={<IdentityPage />} />
            </Route>
          </Route>

          {/* Unknown path → home (redirects to /login if logged out) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionLoader>
    </BrowserRouter>
  );
}

export default App;
