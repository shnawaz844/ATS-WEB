import Job from '../../models/Job.js';
import Application from '../../models/Application.js';
import ApplicationStatus from '../../models/ApplicationStatus.js';
import User from '../../models/User.js';

export const getDashboardStats = async (req, res) => {
    try {
        const hiringManagerId = req.user._id;
        const companyId = req.headers['company_id'];

        if (!companyId) {
            return res.status(400).json({ message: 'company_id is required' });
        }

        // 1. Get all jobs for this hiring manager
        const jobs = await Job.find({
            hiringManagerId: hiringManagerId,
            company_id: companyId
        });

        const jobIds = jobs.map(job => job._id); // Assuming jobID in Application matches _id of Job. 
        // Wait, Application model says jobID: { type: String, ref: 'Job' }. 
        // Let's assume it matches _id. If not, I'll need to check how they are linked.
        // In groupedByJob.js: const jobIds = filteredJobs.map(job => job._id); 
        // and Application.find({ jobID: { $in: jobIds } }); 
        // So it uses _id.

        // 2. Get All Applications for these jobs
        const applications = await Application.find({
            jobID: { $in: jobIds },
            company_id: companyId
        }).sort({ createdAt: -1 });

        // 3. Get Candidate Details (Names)
        const candidateIds = applications.map(app => app.candidateID);
        const candidates = await User.find({ _id: { $in: candidateIds } }, 'userName');
        const candidateMap = {};
        candidates.forEach(user => {
            candidateMap[user._id.toString()] = user.userName;
        });

        // 3. Get Application Statuses to map IDs to Names
        const statusDocs = await ApplicationStatus.find({ company_id: companyId });
        const statusMap = {};
        statusDocs.forEach(status => {
            statusMap[status._id.toString()] = status.applicationStatus;
        });

        // 4. Calculate Stats
        const totalApplications = applications.length;

        // Define what constitutes "Active"
        // Based on common ATS flows: NOT Rejected, NOT Hired (Offered might be active or end state depending on view)
        // For now, let's include everything except 'Rejected' as active? 
        // Or specific statuses like: 'Interview', 'Screening', 'Shortlisted', 'test', 'Phone Screen' etc.
        // The prompt implementation plan said: ['Interview', 'Screening', 'Shortlisted']
        // I will map the status names and then filter.

        let activeCount = 0;
        let offeredCount = 0;
        let totalExperience = 0;
        let expCount = 0;

        const processedApps = applications.map(app => {
            const statusName = statusMap[app.applicationStatusId] || 'Unknown';
            const job = jobs.find(j => j._id.toString() === app.jobID.toString());

            // Clean experience string to number
            // Example: "5 years" -> 5
            const expString = app.experience || "0";
            const expMatch = expString.match(/(\d+)/);
            const expValue = expMatch ? parseInt(expMatch[0]) : 0;

            if (expValue > 0) {
                totalExperience += expValue;
                expCount++;
            }

            if (statusName === 'Offered') {
                offeredCount++;
            }

            // Check if active
            if (['Interview', 'Screening', 'Shortlisted'].includes(statusName)) {
                activeCount++;
            }

            return {
                id: app._id,
                jobTitle: job ? job.title : 'Unknown Job',
                jobField: job ? job.title : 'Unknown', // Job model doesn't have field, using title or we could add it if needed.
                applicantName: candidateMap[app.candidateID] || app.contactInfo || 'Unknown Candidate',
                // Application model has: contactInfo, emailInfo. 
                // Usually name is in contactInfo or linked User. 
                // Let's use contactInfo as placeholder for name.
                email: app.emailInfo,
                status: statusName,
                experience: app.experience,
                appliedDate: app.createdAt,
                stage: statusName // Stage and status might be same for now
            };
        });

        const avgExperience = totalApplications > 0 && expCount > 0
            ? (totalExperience / expCount).toFixed(1)
            : 0;

        const offerRate = totalApplications > 0
            ? ((offeredCount / totalApplications) * 100).toFixed(1)
            : 0;

        // 5. Recent Applications (Top 5)
        const recentApplications = processedApps.slice(0, 5);

        // 6. Status Counts for Donut Chart
        const statusCounts = {};
        processedApps.forEach(app => {
            statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
        });

        // 7. Monthly Applications for Bar Chart
        const monthlyApplications = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthName = months[d.getMonth()];
            monthlyApplications[monthName] = 0;
        }

        processedApps.forEach(app => {
            const appDate = new Date(app.appliedDate);
            const monthName = months[appDate.getMonth()];
            if (monthlyApplications.hasOwnProperty(monthName)) {
                monthlyApplications[monthName]++;
            }
        });

        // Convert to array
        const monthlyData = Object.entries(monthlyApplications).map(([month, count]) => ({
            month,
            count
        }));

        res.status(200).json({
            stats: [
                { title: 'Total Applications', value: totalApplications, change: '+0%', trend: 'up' },
                { title: 'Active Applications', value: activeCount, change: '+0%', trend: 'up' },
                { title: 'Offer Rate', value: `${offerRate}%`, change: '+0%', trend: 'up' },
                { title: 'Avg. Experience', value: `${avgExperience} years`, change: '+0%', trend: 'up' },
            ],
            recentApplications,
            statusCounts,
            monthlyApplications: monthlyData
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
