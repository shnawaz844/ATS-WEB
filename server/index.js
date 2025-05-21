import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import cookieParser from "cookie-parser";
import cors from 'cors';


const app = express();
dotenv.config();
const port = process.env.PORT || 8080;

// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use( cors() );
app.use(cookieParser());

// Import routes
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
import applicationRoutes from "./routes/applicationRoutes.js"
import recruiterRoutes from "./routes/recruiterRoutes.js"
import hiringmanagerRoutes from "./routes/hiringmanagerRoutes.js"
import fileUploadRoute from './routes/fileUploadRoute.js'
import Auth from './routes/Auth.js'
import applicationTypesRoutes from "./routes/applicationTypeRoutes.js";
import interviewerappRoutes from "./routes/interviewerappRoutes.js";
import companyRoutes from "./routes/companyRoutes.js"
import applicationlistRoutes from './routes/applicationlistRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js';

// Use routes
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);
app.use("/interviews", interviewRoutes);
app.use("/application", applicationRoutes);
app.use("/recruiter", recruiterRoutes);
app.use( "/hiringmanager", hiringmanagerRoutes );
app.use("/auth", Auth);
app.use("/application-types", applicationTypesRoutes);
app.use("/", fileUploadRoute);
app.use("/interviewer-app", interviewerappRoutes);
app.use("/companies", companyRoutes),
app.use("/applicationscheduledlist", applicationlistRoutes);
app.use("/interviewerfeedback", feedbackRoutes);
// app.use("/interview-result", resultRoutes)

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
