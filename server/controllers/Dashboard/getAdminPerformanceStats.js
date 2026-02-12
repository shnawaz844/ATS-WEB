import User from "../../models/User.js";
import Job from "../../models/Job.js";
import Application from "../../models/Application.js";
import InterviewSchedule from "../../models/Applicationlist.js";
import mongoose from "mongoose";

export const getAdminPerformanceStats = async (req, res) => {
    try {
        const { company_id } = req.headers;

        if (!company_id) {
            return res.status(400).json({ message: "company_id is required" });
        }

        // 1. Fetch all users for this company
        const users = await User.find({ company_id }).select("userName role email");

        // Separate users by role
        const hiringManagers = users.filter(u => u.role === "hiring_manager");
        const recruiters = users.filter(u => u.role === "recruiter_manager");
        const interviewers = users.filter(u => u.role === "interviewer");

        // 2. Aggregate data for Hiring Managers and Recruiters
        const jobs = await Job.find({ company_id }).select("hiringManagerId recruiterId status title");
        const jobIds = jobs.map(j => j._id.toString());
        const applications = await Application.find({ company_id, jobID: { $in: jobIds } }).select("jobID");

        const appCounts = {};
        applications.forEach(app => {
            const jid = app.jobID.toString();
            appCounts[jid] = (appCounts[jid] || 0) + 1;
        });

        // Helper to calculate efficiency (1-10)
        const calculateEfficiency = (jobsCount, appsCount) => {
            if (jobsCount === 0 && appsCount === 0) return 2;
            let score = (jobsCount * 1.5) + (appsCount * 0.2) + 2;
            return Math.min(10, Math.max(1, Math.round(score)));
        };

        // Hiring Manager Performance
        const hmPerformance = hiringManagers.map(hm => {
            const hmJobs = jobs.filter(j => j.hiringManagerId === hm._id.toString() || j.hiringManagerId === hm.userName);
            const totalApps = hmJobs.reduce((acc, job) => acc + (appCounts[job._id.toString()] || 0), 0);
            return {
                id: hm._id,
                name: hm.userName,
                email: hm.email,
                jobsCount: hmJobs.length,
                applicationsCount: totalApps,
                efficiency: calculateEfficiency(hmJobs.length, totalApps)
            };
        });

        // Recruiter Performance
        const recruiterPerformance = recruiters.map(r => {
            const rJobs = jobs.filter(j => j.recruiterId === r._id.toString() || j.recruiterId === r.userName);
            const totalApps = rJobs.reduce((acc, job) => acc + (appCounts[job._id.toString()] || 0), 0);
            return {
                id: r._id,
                name: r.userName,
                email: r.email,
                jobsCount: rJobs.length,
                applicationsCount: totalApps,
                efficiency: calculateEfficiency(rJobs.length, totalApps)
            };
        });

        // 3. Interviewer Performance
        const interviews = await InterviewSchedule.find({ company_id }).select("interviewerID");
        const interviewCounts = {};
        interviews.forEach(i => {
            if (i.interviewerID) {
                const iid = i.interviewerID.toString();
                interviewCounts[iid] = (interviewCounts[iid] || 0) + 1;
            }
        });

        const interviewerPerformance = interviewers.map(i => {
            const iCount = interviewCounts[i._id.toString()] || 0;
            const iScore = iCount === 0 ? 2 : Math.min(10, Math.round(3 + (iCount * 1.2)));
            return {
                id: i._id,
                name: i.userName,
                email: i.email,
                interviewsCount: iCount,
                efficiency: iScore
            };
        });

        res.status(200).json({
            hiringManagers: hmPerformance,
            recruiters: recruiterPerformance,
            interviewers: interviewerPerformance
        });

    } catch (error) {
        console.error("Error fetching admin performance stats:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
