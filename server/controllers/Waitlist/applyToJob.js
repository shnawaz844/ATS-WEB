import Waitlist from '../../models/Waitlist.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import Application from '../../models/Application.js';
import ApplicationStatus from '../../models/ApplicationStatus.js';

export const applyToJob = async (req, res) => {
    try {
        const { waitlistId, jobId } = req.body;

        if (!waitlistId || !jobId) {
            return res.status(400).json({ success: false, message: "waitlistId and jobId are required." });
        }

        const waitlistEntry = await Waitlist.findById(waitlistId);
        console.log(waitlistEntry);
        if (!waitlistEntry) {
            return res.status(404).json({ success: false, message: "Waitlist entry not found." });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found." });
        }

        // 1. Find or create User candidate
        let user = await User.findOne({ email: waitlistEntry.email });
        if (!user) {
            user = await User.create({
                userName: waitlistEntry.name,
                email: waitlistEntry.email,
                password: "Password@123", // Default placeholder password
                role: "candidate",
                gender: waitlistEntry.gender || "N/A",
                address: waitlistEntry.currentCity || waitlistEntry.current_city || "N/A",
                company_id: job.company_id
            });
        }

        // 2. Find "Applied" status
        const statuses = await ApplicationStatus.find({ company_id: job.company_id });
        let appliedStatus = statuses.find(s => s.applicationStatus?.toLowerCase() === "applied");

        if (!appliedStatus) {
            appliedStatus = statuses[0];
        }

        if (!appliedStatus) {
            return res.status(500).json({ success: false, message: "Application status not found for this company." });
        }

        // 3. Create Application
        const newApplication = await Application.create({
            jobID: job.id || job._id,
            candidateID: user.id || user._id,
            applicationStatusId: appliedStatus.id || appliedStatus._id,
            jobStatusId: job.status || null,
            resume: waitlistEntry.resumeUrl || waitlistEntry.resume_url,
            contactInfo: waitlistEntry.phone,
            emailInfo: waitlistEntry.email,
            applicant_type: "Applied via Waitlist",
            "candidate-info": `name: ${waitlistEntry.name} |Role: ${waitlistEntry.role} | Department: ${waitlistEntry.department} `,
            city: waitlistEntry.currentCity || waitlistEntry.current_city,
            company_id: job.company_id,
            questions: [],
            answers: []
        });

        // 4. Update Job applicants array
        let currentApplicants = Array.isArray(job.applicants) ? job.applicants : [];
        await Job.findByIdAndUpdate(job.id || job._id, {
            applicants: [...currentApplicants, user.id || user._id]
        });

        // 5. Update Waitlist status
        await Waitlist.update(waitlistId, { status: "Applied" });

        res.status(200).json({
            success: true,
            message: "Successfully applied to job from waitlist",
            application: newApplication
        });

    } catch (error) {
        console.error("Error in applyToJob:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
