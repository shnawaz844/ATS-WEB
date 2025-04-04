import { Routes, Route, Outlet } from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { Home } from './Pages/Employer/Home';
import { Navbar } from './components/Navbar';
import { PostJob } from './components/PostJob/PostJob';
import { AllJobs } from './Pages/Employer/AllJobs';
import { Login } from './components/Login/Login';
import { Register } from './components/Login/Register';
import RecruiterDashboard from './Pages/Recruiter/RecruiterDashboard';
import { CoordinatorDashboard } from './Pages/Coordinator/CoordinatorDashboard';
import { JobDetails } from './components/Home/JobDetails';
import { Applications } from './components/Applications';
import { ShortlistedDetails } from './components/ShortlistedDetails';
import { ApplicationForm } from './Pages/Candidate/ApplicationForm';
import { AssignRecruiter } from './Pages/Coordinator/AssignRecruiter';
import { Footer } from './components/Footer';
import AllPostedJobs from './components/AllPostedJobs';
import { LoginContext } from './components/ContextProvider/Context';
import MyJobs from './Pages/Candidate/MyJobs';
import UserListing from './Pages/User/UserListing';
import InterviewListing from './Pages/InterviewRounds/InterviewListing';
import ApplicationListing from "./Pages/Application/ApplicationListing";
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile/Profile';
import ScheduledInterview from './Pages/ScheduledInterview/ScheduledInterview';
import HiringManagerDashboard from './components/HiringManager/HiringManagerDashboard';
import ManagerApplicationList from './components/HiringManager/ManagerApplicationList';
import AssignedInterviews from './components/HiringManager/AssignedInterviews';
import CandidateApplication from './Pages/Application/CandidateApplication';
import ApplicationJobDetail from './Pages/Application/ApplicationJobDetail';
import CandidateDetailsPage from './Pages/Recruiter/CandidateDetailsPage';
import ShortlistedApplications from './Pages/Application/ShortlistedApplication/ShortlistedApplications';
import { useAuth } from './hooks/useAuth';
import CompanyListing from './Pages/company/CompanyListing';
import AllInterviews from './Pages/Employer/AllInterviews';
import { useEffect } from 'react';

// Layout component to ensure Navbar and Footer appear on all pages
const Layout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
    useAuth();

  return (
    <div className="App">
      <Routes>
        <Route element={<Layout />}>
          {/* Home */}
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Home />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* Job management */}
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/all-jobs" element={<AllJobs />} />
          <Route path="/all-interviews" element={<AllInterviews />} />
          <Route path="/all-posted-jobs" element={<AllPostedJobs />} />
          <Route path="/current-job/:id" element={<JobDetails />} />
          <Route path="/job-detail/:id" element={<ApplicationJobDetail />} />

          {/* Applications */}
          <Route path="/application-form/:id" element={<ApplicationForm />} />
          <Route path="/shortlist" element={<Applications />} />
          <Route path="/shortlist/details/:candidate_id/:job_id" element={<ShortlistedDetails />} />
          <Route path="/all-applications" element={<CandidateApplication />} />
          <Route path="/shortlisted-applications" element={<ShortlistedApplications />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/application-types" element={<ApplicationListing />} />

          {/* User Management */}
          <Route path="/all-users" element={<UserListing />} />
          <Route path="/all-companies" element={<CompanyListing />} />

          {/* Role-specific Dashboards */}
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/coordinator/review" element={<CoordinatorDashboard />} />
          <Route path="/hiring_manager" element={<HiringManagerDashboard />} />

          {/* Interviews */}
          <Route path="/interview-rounds" element={<InterviewListing />} />
          <Route path="/scheduled-interview" element={<ScheduledInterview />} />
          <Route path="/assigned-interviews" element={<AssignedInterviews />} />
          <Route path="/application-list" element={<ManagerApplicationList />} />

          {/* Candidate */}
          <Route path="/candidate-details/:candidateId/:jobId" element={<CandidateDetailsPage />} />
          <Route path="/assign-recruiter/:id" element={<AssignRecruiter />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;