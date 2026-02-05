"use client";
import { Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';

import './App.css';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './context/ThemeContext'; // Fixed: removed trailing comma
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { Home } from './Pages/Employer/Home';
import { Navbar } from './components/Navbar';
import { PostJob } from './components/PostJob/PostJob';
import AllJobs from './Pages/Employer/AllJobs';
import { Login } from './components/Login/Login';
import { Register } from './components/Login/Register';
import ResetPassword from './components/Login/ResetPassword';
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
import ImportCandidateApplication from './Pages/Application/tabs/ImportCandidateApplication';
import ScrollToTop from './components/ScrollToTop';

import About from './Pages/General/About';
import Contact from './Pages/General/Contact';
import PrivacyPolicy from './Pages/General/PrivacyPolicy';
import TermsOfService from './Pages/General/TermsOfService';
import Blog from './Pages/General/Blog';
import Documentation from './Pages/General/Documentation';
import Support from './Pages/General/Support';
import Guides from './Pages/General/Guides';
import Jobs from './Pages/General/Jobs';

// Layout component to ensure Navbar and Footer appear on all pages
const Layout = () => {
  const { theme } = useTheme(); // Moved inside the Layout component

  return (
    <>
      <Navbar />
      <main className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
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
  const { theme } = useTheme();

  // Pages that should be accessible without being treated as a company slug
  const ignoredSlugs = ['about', 'contact', 'privacy', 'terms', 'blog', 'documentation', 'support', 'guides', 'jobs', 'login', 'signup', 'reset-password', 'all-users', 'all-companies', 'profile', '404'];


  const slug = location.pathname.split('/')[1];
  const companyUserNameFromStorage = localStorage.getItem('companyUserName');
  const companyIdFromStorage = localStorage.getItem('companyId');
  const user = localStorage.getItem('user');

  // Clear company details from localStorage when slug is not available
  // Clear company details from localStorage when slug is not available
  useLayoutEffect(() => {
    // If we are on a general page (no slug or ignored slug), do not enforce company checks strictly?
    // Actually, if we are on /about, slug is 'about'. We should skip clearing logic if it conflicts?
    // Current logic: if (!slug) ...
    // If we are at /, slug is undefined.

    if (!slug || ignoredSlugs.includes(slug)) {
      // If it is an ignored slug, we might still want to clear company data if we navigated AWAY from a company?
      // But if we are just viewing a public page, maybe we keep the session?
      // Let's stick to existing behavior but respect ignored slugs.
      // Actually, existing behavior clears if !slug.
      if (!slug) {
        if (user) {
          navigate(`/${companyIdFromStorage}`);
          return;
        }
        localStorage.removeItem("companyUserName");
        localStorage.removeItem("companyId");
        console.log("Cleared companyUserName from localStorage");
      }
    }
  }, [slug]);


  useEffect(() => {
    if (ignoredSlugs.includes(slug)) {
      return;
    }

    // If user is not logged in (companyUserName is not in localStorage)
    if (!companyUserNameFromStorage) {
      console.log('User not logged in. Redirecting to login...');
      // Only redirect if it's not a known public route? But we handled ignoredSlugs above.
      // So if slug is "some-company", and we are not logged in, we go to /some-company (login).
      navigate(`/${slug}`);
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

    // If we already have the companyId and Name matching, do we need to fetch again?
    // Existing logic fetches.
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
    <div className={`App ${theme === 'dark' ? 'bg-black' : 'bg-white'} transition-colors duration-300`}
    >
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          {/* Home */}
          <Route path="/" element={<Banner />} />

          {/* General Pages - Global */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/support" element={<Support />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/jobs" element={<Jobs />} />

          {/* General Pages - Company Context */}
          <Route path="/:companyUserName/about" element={<About />} />
          <Route path="/:companyUserName/contact" element={<Contact />} />
          <Route path="/:companyUserName/privacy" element={<PrivacyPolicy />} />
          <Route path="/:companyUserName/terms" element={<TermsOfService />} />
          <Route path="/:companyUserName/blog" element={<Blog />} />
          <Route path="/:companyUserName/documentation" element={<Documentation />} />
          <Route path="/:companyUserName/support" element={<Support />} />
          <Route path="/:companyUserName/guides" element={<Guides />} />
          <Route path="/:companyUserName/jobs" element={<Jobs />} />

          <Route path="/:companyUserName" element={<Home />} />

          {/* Authentication */}
          <Route path="/:companyUserName/login" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="/:companyUserName/import-application" element={<ImportApplication />} />
          <Route path="/:companyUserName/import-candidate-application" element={<ImportCandidateApplication />} />
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