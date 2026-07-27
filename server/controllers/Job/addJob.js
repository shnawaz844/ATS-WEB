import Job from '../../models/Job.js';
import uniqid from 'uniqid';
import { generateSimpleTitleCode, generateTitleCode } from '../utils.js';

const addJob = async (req, res) => {
  try {
    const {
      title, locationType, type, scheduleType, shiftStart, shiftEnd, hireType,
      country, state, city, description, compensation, experienceRequired,
      requiredResources, status, recruiterId, hiringManagerId, applicationForm,
      interviewMode, interviewDuration, interviewType, applicants, company_id,
      skillsRequired,
    } = req.body;

    let interview_id = null;

    if (interviewMode === 'AI') {
      console.log('🔥 Calling AI generate-questions API...');
      const aiResponse = await fetch(`${process.env.ASTRANYX_AI}/api/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPosition: title, jobDescription: description, duration: interviewDuration,
          type: interviewType?.roundName || '', company_id,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`AI API failed: ${errorText}`);
      }

      const aiData = await aiResponse.json();
      interview_id = aiData.interview_id;
      if (!interview_id) throw new Error('Interview generation failed');
    }

    const existingJobs = await Job.find({ company_id });
    let titleCode;
    try {
      titleCode = generateTitleCode(title, existingJobs);
    } catch {
      titleCode = generateSimpleTitleCode(title);
    }

    // Normalize arrays for DB
    const normalizedSkills = Array.isArray(skillsRequired)
      ? skillsRequired
      : (skillsRequired ? [skillsRequired] : []);
    const normalizedExp = Array.isArray(experienceRequired)
      ? experienceRequired
      : (experienceRequired ? [experienceRequired] : []);

    const jobData = {
      jobID: uniqid(), titleCode, title, locationType, type, scheduleType,
      shiftStart, shiftEnd, hireType, country, state, city, description,
      compensation,
      experienceRequired: normalizedExp,
      requiredResources, status, recruiterId,
      hiringManagerId, applicationForm: applicationForm || {}, applicants: applicants || [],
      company_id, interviewMode,
      skillsRequired: normalizedSkills,
    };

    if (interviewMode === 'AI') {
      jobData.interview_id = interview_id;
      jobData.interviewType = interviewType;
    }

    const job = await Job.create(jobData);
    console.log(`✅ Job created with title code: ${titleCode}`);

    res.status(201).json({ success: true, message: 'Job created successfully', job, titleCode });
  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addJob };
