import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export const generateJobDescription = async (req, res) => {
    try {
        const { jobTitle, companyUserName } = req.body;
        const capitalizedCompany = companyUserName ? companyUserName.charAt(0).toUpperCase() + companyUserName.slice(1) : "[Company Name]";

        if (!jobTitle) {
            return res.status(400).json({ success: false, message: "Job title is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ success: false, message: "Gemini API key not configured" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the model version we found available via fetch_models.js
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Write a professional and engaging job description for the role of "${jobTitle}" using the following specific format and emojis. Use HTML tags (<h3>, <p>, <ul>, <li>, <strong>) for detailed formatting.

        Format Structure:
        
        <h3>🚀 About the Company</h3>
        <p>Write a brief, exciting placeholder description about a forward-thinking company.</p>
        <br></br>
        <h3>👨💻 Role Overview</h3>
        <p>Write a compelling summary of the role.</p>
        <br></br>
        <h3>🛠️ Key Responsibilities</h3>
        <ul>
            <li>[Responsibility 1]</li>
            <li>[Responsibility 2]</li>
            <li>[Responsibility 3]</li>
            <li>...</li>
        </ul>
        <br></br>
        
        <h3>🎯 Required Skills & Qualifications</h3>
        <ul>
            <li>[Skill 1]</li>
            <li>[Skill 2]</li>
            <li>[Skill 3]</li>
            <li>...</li>
        </ul>
        <br></br>
        <h3>🌟 What We Offer</h3>
        <ul>
            <li>Competitive salary package 💰</li>
            <li>Friendly and supportive work culture 🤝</li>
            <li>Career growth and learning opportunities 📈</li>
            <li>Flexible working environment (Hybrid / On-site)</li>
        </ul>

        Ensure the tone is professional yet energetic. 
        IMPORTANT: Whenever you mention the company name "${capitalizedCompany}" in any section (especially in "About the Company"), you must wrap it in <strong style="background-color: yellow; padding: 2px 4px; border-radius: 4px;">...</strong> to highlight it.
        Do not wrap the output in markdown code blocks.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ success: true, description: text });
    } catch (error) {
        console.error("Error generating job description:", error);
        res.status(500).json({ success: false, message: "Failed to generate description", error: error.message });
    }
};
