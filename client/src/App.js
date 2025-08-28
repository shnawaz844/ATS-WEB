import { Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';

import './App.css';
import { useAuth } from './hooks/useAuth';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { Home } from './Pages/Employer/Home';
import { Navbar } from './components/Navbar';
import { PostJob } from './components/PostJob/PostJob';
import AllJobs from './Pages/Employer/AllJobs';
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
import CompanyListing from './Pages/company/CompanyListing';
import AllInterviews from './Pages/Employer/AllInterviews';
import NotFound from './Pages/NotFound';
import CompanyNotFound from './components/CompanyNotFound';
import { useEffect, useLayoutEffect, useState } from 'react';
import Banner from './components/Home/Banner/Banner'
import Jobstatus from './Pages/Application/JobStatus';
import ImportApplication from './Pages/Application/tabs/ImportApplication';


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
  const location = useLocation();
  const navigate = useNavigate();
  const [companyError, setCompanyError] = useState(false);
  const BASE_URL = process.env.REACT_APP_BASE_URL;


  const slug = location.pathname.split('/')[1];
  const companyUserNameFromStorage = localStorage.getItem('companyUserName');
  const companyIdFromStorage = localStorage.getItem('companyId');
  const user = localStorage.getItem('user');

  // Clear company details from localStorage when slug is not available
  useLayoutEffect(() => {
    if (!slug) {
      if (user) {
        navigate(`/${companyIdFromStorage}`);
        return;
      }
      localStorage.removeItem("companyUserName");
      localStorage.removeItem("companyId");
      console.log("Cleared companyUserName from localStorage");
    }
  }, [slug]);


  useEffect(() => {
    // If user is not logged in (companyUserName is not in localStorage)
    if (!companyUserNameFromStorage) {
      console.log('User not logged in. Redirecting to login...');
      navigate(`/${slug}`); // Redirect to login page with the companyUserName
      return;
    }

    // If slug (companyUserName) from route does not match the one stored in localStorage
    if (companyUserNameFromStorage !== slug) {
      console.log('Company mismatch or invalid company user, redirecting...');
      if (user) {
        navigate('/404');
        return;
      }
      navigate(`/${slug}`);
      return;
    }

    setCompanyError(false);

    // Fetch company details from API using companyUserName
    axios
      .get(`${BASE_URL}/companies/companies/${slug}`)

      .then(res => {
        if (companyIdFromStorage && res.data._id !== companyIdFromStorage) {
          console.error("Company ID mismatch, invalid access.");
          navigate('/404');
        } else {
          localStorage.setItem("companyId", res.data._id);
          localStorage.setItem("companyUserName", slug);
        }
      })
      .catch(err => {
        console.error("Invalid company slug:", err);
        setCompanyError(true);
      });
  }, [slug, companyUserNameFromStorage, companyIdFromStorage, navigate]);


  useAuth();
  if (companyError) {
    return <div>Company not found</div>;
  }
  return (
    <div className="App">
      <Routes>
        <Route element={<Layout />}>
          {/* Home */}
          <Route path="/" element={<Banner />} />
          <Route path="/:companyUserName" element={<Home />} />

          {/* Authentication */}
          <Route path="/:companyUserName/login" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route path="/:companyUserName/signup" element={<Register />} />
          {/* <Route path="/:companyUserName?/signup" element={ <Register /> } /> */}

          {/* Dashboard */}
          <Route path="/:companyUserName/dashboard" element={<Dashboard />} />
          <Route path="/:companyUserName/profile" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />

          {/* Job management */}
          <Route path="/:companyUserName/post-job" element={<PostJob />} />
          <Route path="/:companyUserName/all-jobs" element={<AllJobs />} />
          <Route path="/:companyUserName/all-interviews" element={<AllInterviews />} />
          <Route path="/:companyUserName/import-application" element={ <ImportApplication /> } />
          <Route path="/:companyUserName/current-job/:id" element={<JobDetails />} />

          {/* Dynamic route for companyName */}
          <Route path="/:companyUserName?/all-posted-jobs" element={<AllPostedJobs />} />

          {/* Applications */}
          <Route path="/:companyUserName/job-detail/:id" element={<ApplicationJobDetail />} />

          {/* Applications */}
          <Route path="/:companyUserName/application-form/:id" element={<ApplicationForm />} />
          <Route path="/:companyUserName/shortlist" element={<Applications />} />
          <Route path="/:companyUserName/shortlist/details/:candidate_id/:job_id" element={<ShortlistedDetails />} />
          <Route path="/:companyUserName/all-applications" element={<CandidateApplication />} />
          <Route path="/:companyUserName/shortlisted-applications" element={<ShortlistedApplications />} />
          <Route path="/:companyUserName/my-jobs" element={<MyJobs />} />
          <Route path="/:companyUserName/application-statuses" element={<ApplicationListing />} />
          <Route path="/:companyUserName/Job-statuses" element={<Jobstatus />} />
          {/* User Management */}
          <Route path="/:companyUserName/all-users" element={<UserListing />} />
          <Route path="/all-users" element={<UserListing />} />
          <Route path="/all-companies" element={<CompanyListing />} />

          {/* Interviews */}
          <Route path="/:companyUserName/interview-rounds" element={<InterviewListing />} />
          <Route path="/:companyUserName/scheduled-interview" element={<ScheduledInterview />} />
          <Route path="/:companyUserName/assigned-interviews" element={<AssignedInterviews />} />
          <Route path="/:companyUserName/application-list" element={<ManagerApplicationList />} />

          {/* Candidate */}
          <Route path="/shortlist/details/:candidate_id/:job_id" element={<ShortlistedDetails />} />
          <Route path="/all-applications" element={<CandidateApplication />} />
          <Route path="/shortlisted-applications" element={<ShortlistedApplications />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/application-Statuses" element={<ApplicationListing />} />

          {/* Role-specific Dashboards */}
          <Route path="/:companyUserName/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/:companyUserName/coordinator/review" element={<CoordinatorDashboard />} />
          <Route path="/:companyUserName/hiring_manager" element={<HiringManagerDashboard />} />

          {/* Candidate */}
          <Route path="/:companyUserName/candidate-details/:candidateId/:jobId" element={<CandidateDetailsPage />} />
          <Route path="/:companyUserName/assign-recruiter/:id" element={<AssignRecruiter />} />



          <Route path="*" element={<NotFound />} />
        </Route>
        {/* CompanyNotFound route */}
        <Route path="/404" element={<CompanyNotFound />} />
      </Routes>
    </div>

  );
}

export default App;