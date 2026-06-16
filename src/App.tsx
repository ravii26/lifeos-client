import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ComingSoon } from "@/components/ComingSoon";
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
import { VaultPage } from "@/features/vault/pages/VaultPage";
import { ReviewsPage } from "@/features/reviews/pages/ReviewsPage";
import { ReviewDetailPage } from "@/features/reviews/pages/ReviewDetailPage";
import { CalendarPage } from "@/features/calendar/pages/CalendarPage";
import { IdentityPage } from "@/features/identity/pages/IdentityPage";
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
              <Route path="/vault" element={<VaultPage />} />
              <Route path="/dump" element={<ComingSoon />} />
              <Route path="/settings" element={<IdentityPage />} />
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
