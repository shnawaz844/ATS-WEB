import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();
dotenv.config();
const port = process.env.PORT || 8080;

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Import routes
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
import applicationRoutes from "./routes/applicationRoutes.js"
import recruiterRoutes from "./routes/recruiterRoutes.js"
import fileUploadRoute from './routes/fileUploadRoute.js'
import Auth from './routes/Auth.js'
import applicationTypesRoutes from "./routes/applicationTypeRoutes.js";
import interviewerappRoutes from "./routes/interviewerappRoutes.js";
import applicationlistRoutes from './routes/applicationlistRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
// import resultRoutes from './routes/resultRoutes.js';

// Use routes
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);
app.use("/interviews", interviewRoutes);
app.use("/application", applicationRoutes);
app.use("/recruiter", recruiterRoutes);
app.use("/auth", Auth);
app.use("/application-types", applicationTypesRoutes);
app.use("/", fileUploadRoute);
app.use("/interviewer-app", interviewerappRoutes);
app.use("/applicationscheduledlist", applicationlistRoutes);
app.use("/interviewerfeedback", feedbackRoutes);
// app.use("/interview-result", resultRoutes)



// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello, wowo" });
});

app.get("*", (req, res) => {
  res.redirect("/");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
