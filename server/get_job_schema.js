import Job from './models/Job.js';

async function test() {
  try {
    const job = await Job.findOne({});
    console.log("Job schema keys:", Object.keys(job));
    console.log("Job:", job);
  } catch (err) {
    console.error(err);
  }
}

test();
