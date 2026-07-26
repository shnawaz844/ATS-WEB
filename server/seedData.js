import { MongoClient } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/ats';
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper: Convert MongoDB ObjectId string to a valid UUID format
const objectIdToUuid = (idStr) => {
  if (!idStr) return null;
  const clean = idStr.toString().toLowerCase().replace(/[^0-9a-f]/g, '');
  if (clean.length !== 24) {
    if (clean.length === 32) {
      return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
    }
    return idStr; // Return as-is if not standard ObjectId hex length
  }
  const padded = clean + '00000000';
  return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20)}`;
};

// Seeder main execution
const seed = async () => {
  let mongoClient;
  try {
    console.log('🔌 Connecting to MongoDB...');
    mongoClient = await MongoClient.connect(mongoUrl);
    const db = mongoClient.db();
    console.log('✅ Connected to MongoDB.');

    // 1. Companies
    console.log('\n--- 1. Syncing companies ---');
    const mongoCompanies = await db.collection('companies').find({}).toArray();
    console.log(`Found ${mongoCompanies.length} companies in MongoDB`);
    for (const c of mongoCompanies) {
      const data = {
        id: objectIdToUuid(c._id),
        CompanyUserName: c.CompanyUserName,
        name: c.name,
        email: c.email,
        address: c.address || '',
        phone: c.phone || null,
        website: c.website || null,
        image: c.image || null,
        aiFeaturesEnabled: !!c.aiFeaturesEnabled,
        onlyAiFeaturesEnabled: !!c.onlyAiFeaturesEnabled,
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('companies').upsert(data);
      if (error) console.error(`Error upserting company ${c.name}:`, error.message);
    }
    console.log('✅ Companies sync complete.');

    // 2. Users
    console.log('\n--- 2. Syncing users ---');
    const mongoUsers = await db.collection('users').find({}).toArray();
    console.log(`Found ${mongoUsers.length} users in MongoDB`);
    for (const u of mongoUsers) {
      const data = {
        id: objectIdToUuid(u._id),
        userName: u.userName,
        email: u.email,
        password: u.password,
        gender: u.gender || '',
        address: u.address || null,
        role: u.role || 'candidate',
        head: !!u.head,
        company_id: objectIdToUuid(u.company_id),
        resetPasswordToken: u.resetPasswordToken || null,
        resetPasswordExpires: u.resetPasswordExpires ? new Date(u.resetPasswordExpires).toISOString() : null,
        applications: Array.isArray(u.applications) ? u.applications.map(app => ({
          ...app,
          jobID: objectIdToUuid(app.jobID),
          candidateID: objectIdToUuid(app.candidateID)
        })) : [],
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('users').upsert(data);
      if (error) console.error(`Error upserting user ${u.userName}:`, error.message);
    }
    console.log('✅ Users sync complete.');

    // 3. Interviews (Rounds)
    console.log('\n--- 3. Syncing interviews ---');
    const mongoInterviews = await db.collection('interviews').find({}).toArray();
    console.log(`Found ${mongoInterviews.length} interviews in MongoDB`);
    for (const i of mongoInterviews) {
      const data = {
        id: objectIdToUuid(i._id),
        roundName: i.roundName,
        roundNumber: i.roundNumber ? i.roundNumber.toString() : '1',
        company_id: objectIdToUuid(i.company_id),
        createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: i.updatedAt ? new Date(i.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('interviews').upsert(data);
      if (error) console.error(`Error upserting interview round ${i.roundName}:`, error.message);
    }
    console.log('✅ Interviews sync complete.');

    // 4. Application Statuses
    console.log('\n--- 4. Syncing application_statuses ---');
    const mongoAppStatuses = await db.collection('application-statuses').find({}).toArray();
    console.log(`Found ${mongoAppStatuses.length} application-statuses in MongoDB`);
    for (const s of mongoAppStatuses) {
      const data = {
        id: objectIdToUuid(s._id),
        applicationStep: s.applicationStep ? s.applicationStep.toString() : '0',
        applicationStatus: s.applicationStatus,
        company_id: objectIdToUuid(s.company_id),
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('application_statuses').upsert(data);
      if (error) console.error(`Error upserting status ${s.applicationStatus}:`, error.message);
    }
    console.log('✅ Application statuses sync complete.');

    // 5. Job Statuses
    console.log('\n--- 5. Syncing job_statuses ---');
    const mongoJobStatuses = await db.collection('job-statuses').find({}).toArray();
    console.log(`Found ${mongoJobStatuses.length} job-statuses in MongoDB`);
    for (const s of mongoJobStatuses) {
      const data = {
        id: objectIdToUuid(s._id),
        jobStep: s.jobStep ? s.jobStep.toString() : '0',
        jobStatus: s.jobStatus,
        company_id: objectIdToUuid(s.company_id),
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('job_statuses').upsert(data);
      if (error) console.error(`Error upserting job status ${s.jobStatus}:`, error.message);
    }
    console.log('✅ Job statuses sync complete.');

    // 6. Jobs
    console.log('\n--- 6. Syncing jobs ---');
    const mongoJobs = await db.collection('jobs').find({}).toArray();
    console.log(`Found ${mongoJobs.length} jobs in MongoDB`);
    for (const j of mongoJobs) {
      const data = {
        id: objectIdToUuid(j._id),
        jobID: j.jobID || uniqid(),
        titleCode: j.titleCode,
        title: j.title,
        locationType: j.locationType || 'On-Site',
        type: j.type || 'Full-Time',
        scheduleType: j.scheduleType || 'Flexible',
        shiftStart: j.shiftStart || null,
        shiftEnd: j.shiftEnd || null,
        hireType: j.hireType || 'New',
        country: j.country || 'India',
        state: j.state || null,
        city: j.city || null,
        description: j.description || '',
        compensation: j.compensation || '0',
        experienceRequired: j.experienceRequired || '0',
        requiredResources: parseInt(j.requiredResources) || 1,
        status: objectIdToUuid(j.status),
        recruiterId: objectIdToUuid(j.recruiterId),
        hiringManagerId: objectIdToUuid(j.hiringManagerId),
        applicationForm: j.applicationForm || {},
        applicants: Array.isArray(j.applicants) ? j.applicants.map(app => ({
          ...app,
          applicant: objectIdToUuid(app.applicant)
        })) : [],
        company_id: objectIdToUuid(j.company_id),
        interview_id: j.interview_id || null,
        interviewMode: j.interviewMode || null,
        interviewType: j.interviewType || null,
        createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: j.updatedAt ? new Date(j.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('jobs').upsert(data);
      if (error) console.error(`Error upserting job ${j.title}:`, error.message);
    }
    console.log('✅ Jobs sync complete.');

    // 7. Applications
    console.log('\n--- 7. Syncing applications ---');
    const mongoApplications = await db.collection('applications').find({}).toArray();
    console.log(`Found ${mongoApplications.length} applications in MongoDB`);
    for (const app of mongoApplications) {
      const data = {
        id: objectIdToUuid(app._id),
        jobID: objectIdToUuid(app.jobID),
        candidateID: objectIdToUuid(app.candidateID),
        applicationStatusId: objectIdToUuid(app.applicationStatusId),
        jobStatusId: objectIdToUuid(app.jobStatusId),
        resume: app.resume || '',
        contactInfo: app.contactInfo || '',
        emailInfo: app.emailInfo || '',
        experience: app.experience || '',
        interview_id: app.interview_id || null,
        questions: app.questions || [],
        answers: app.answers || [],
        company_id: objectIdToUuid(app.company_id),
        createdAt: app.createdAt ? new Date(app.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: app.updatedAt ? new Date(app.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('applications').upsert(data);
      if (error) console.error(`Error upserting application ${app._id}:`, error.message);
    }
    console.log('✅ Applications sync complete.');

    // 8. Interview Schedules
    console.log('\n--- 8. Syncing interview_schedules ---');
    const mongoSchedules = await db.collection('interviewschedules').find({}).toArray();
    console.log(`Found ${mongoSchedules.length} schedules in MongoDB`);
    for (const s of mongoSchedules) {
      const data = {
        id: objectIdToUuid(s._id),
        applicationID: objectIdToUuid(s.applicationID),
        interviewerID: objectIdToUuid(s.interviewerID),
        date: s.date || '',
        scheduledTime: s.scheduledTime || '',
        interviewerType: s.interviewerType || '',
        meetingLink: s.meetingLink || null,
        status: s.status || null,
        interviewProgressStatus: s.interviewProgressStatus || 'Upcoming',
        roundID: objectIdToUuid(s.roundID),
        reasonRescheduled: s.reasonRescheduled || null,
        company_id: objectIdToUuid(s.company_id),
        createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('interview_schedules').upsert(data);
      if (error) console.error(`Error upserting schedule ${s._id}:`, error.message);
    }
    console.log('✅ Interview schedules sync complete.');

    // 9. Feedbacks
    console.log('\n--- 9. Syncing feedbacks ---');
    const mongoFeedbacks = await db.collection('feedbacks').find({}).toArray();
    console.log(`Found ${mongoFeedbacks.length} feedbacks in MongoDB`);
    for (const f of mongoFeedbacks) {
      const data = {
        id: objectIdToUuid(f._id),
        interviewId: objectIdToUuid(f.interviewId),
        feedbackTitle: f.feedbackTitle || '',
        feedback: f.feedback || '',
        applicationID: objectIdToUuid(f.applicationID),
        attachment: f.attachment || null,
        starRating: parseInt(f.starRating) || null,
        createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: f.updatedAt ? new Date(f.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('feedbacks').upsert(data);
      if (error) console.error(`Error upserting feedback ${f._id}:`, error.message);
    }
    console.log('✅ Feedbacks sync complete.');

    // 10. Hiring Managers (feedback map)
    console.log('\n--- 10. Syncing hiring_managers ---');
    const mongoHMs = await db.collection('hiringmanagers').find({}).toArray();
    console.log(`Found ${mongoHMs.length} hiringmanagers in MongoDB`);
    for (const hm of mongoHMs) {
      const data = {
        id: objectIdToUuid(hm._id),
        jobID: objectIdToUuid(hm.jobID),
        hiringmanagerID: objectIdToUuid(hm.hiringmanagerID),
        feedbackForm: hm.feedbackForm || [],
      };
      const { error } = await supabase.from('hiring_managers').upsert(data);
      if (error) console.error(`Error upserting HM record ${hm._id}:`, error.message);
    }
    console.log('✅ Hiring managers sync complete.');

    // 11. Recruiters (feedback map)
    console.log('\n--- 11. Syncing recruiters ---');
    const mongoRecruiters = await db.collection('recruiters').find({}).toArray();
    console.log(`Found ${mongoRecruiters.length} recruiters in MongoDB`);
    for (const r of mongoRecruiters) {
      const data = {
        id: objectIdToUuid(r._id),
        jobID: objectIdToUuid(r.jobID),
        recruiterID: objectIdToUuid(r.recruiterID),
        feedbackForm: r.feedbackForm || [],
      };
      const { error } = await supabase.from('recruiters').upsert(data);
      if (error) console.error(`Error upserting recruiter record ${r._id}:`, error.message);
    }
    console.log('✅ Recruiters sync complete.');

    // 12. Interviewer Apps
    console.log('\n--- 12. Syncing interviewer_apps ---');
    const mongoInterviewerApps = await db.collection('interviewerapps').find({}).toArray();
    console.log(`Found ${mongoInterviewerApps.length} interviewerapps in MongoDB`);
    for (const ia of mongoInterviewerApps) {
      const data = {
        id: objectIdToUuid(ia._id),
        applicationID: objectIdToUuid(ia.applicationID),
        interviewerID: objectIdToUuid(ia.interviewerID),
        date: ia.date ? new Date(ia.date).toISOString() : new Date().toISOString(),
        scheduledTime: ia.scheduledTime || '',
        interviewerType: ia.interviewerType || '',
        meetingLink: ia.meetingLink || '',
      };
      const { error } = await supabase.from('interviewer_apps').upsert(data);
      if (error) console.error(`Error upserting interviewerapp ${ia._id}:`, error.message);
    }
    console.log('✅ Interviewer apps sync complete.');

    // 13. Import Files (files collection)
    console.log('\n--- 13. Syncing import_files ---');
    const mongoFiles = await db.collection('files').find({}).toArray();
    console.log(`Found ${mongoFiles.length} files in MongoDB`);
    for (const f of mongoFiles) {
      const data = {
        id: objectIdToUuid(f._id),
        filename: f.filename,
        mimetype: f.mimetype,
        size: parseInt(f.size) || 0,
        uploadDate: f.uploadDate ? new Date(f.uploadDate).toISOString() : new Date().toISOString(),
        file: f.file || '',
        userId: objectIdToUuid(f.userId),
        companyId: objectIdToUuid(f.companyId),
        userName: f.userName || 'Unknown User',
        fileType: f.fileType || 'other',
        fileCategory: f.fileCategory || 'other',
        isActive: f.isActive !== undefined ? !!f.isActive : true,
        tags: f.tags || [],
        description: f.description || null,
        createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: f.updatedAt ? new Date(f.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('import_files').upsert(data);
      if (error) console.error(`Error upserting import file ${f.filename}:`, error.message);
    }
    console.log('✅ Import files sync complete.');

    // 14. Candidate Files
    console.log('\n--- 14. Syncing candidate_files ---');
    const mongoCandidateFiles = await db.collection('candidate-files').find({}).toArray();
    console.log(`Found ${mongoCandidateFiles.length} candidate-files in MongoDB`);
    for (const cf of mongoCandidateFiles) {
      const data = {
        id: objectIdToUuid(cf._id),
        fileName: cf.fileName,
        originalName: cf.originalName || cf.fileName,
        mimetype: cf.mimetype || null,
        size: parseInt(cf.size) || null,
        fileUrl: cf.fileUrl || '',
        userId: objectIdToUuid(cf.userId),
        companyId: objectIdToUuid(cf.companyId),
        userName: cf.userName || 'Unknown User',
        uploadDate: cf.uploadDate ? new Date(cf.uploadDate).toISOString() : new Date().toISOString(),
        totalCandidates: parseInt(cf.totalCandidates) || 0,
        processedCandidates: parseInt(cf.processedCandidates) || 0,
        failedCandidates: parseInt(cf.failedCandidates) || 0,
        status: cf.status || 'processing',
        processingErrors: cf.processingErrors || [],
        createdAt: cf.createdAt ? new Date(cf.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: cf.updatedAt ? new Date(cf.updatedAt).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('candidate_files').upsert(data);
      if (error) console.error(`Error upserting candidate file ${cf.fileName}:`, error.message);
    }
    console.log('✅ Candidate files sync complete.');

    console.log('\n🌟 Seeding process finished successfully! 🌟');
  } catch (err) {
    console.error('❌ Seeding process failed:', err);
  } finally {
    if (mongoClient) await mongoClient.close();
  }
};

seed();
