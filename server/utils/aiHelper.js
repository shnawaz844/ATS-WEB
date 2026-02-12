import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Generates a professional job description using Gemini AI
 * @param {string} jobTitle - The title of the job
 * @param {string} companyUserName - The name of the company
 * @param {string} compensation - Optional compensation info
 * @param {string} experience - Optional experience info
 * @returns {Promise<string>} The generated job description
 */
/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry wrapper with exponential backoff for rate limit handling
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 2000) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimitError =
                error.message?.includes('429') ||
                error.message?.includes('Too Many Requests') ||
                error.message?.includes('Resource exhausted');

            const isLastAttempt = attempt === maxRetries - 1;

            if (isRateLimitError && !isLastAttempt) {
                // Exponential backoff: 2s, 4s, 8s, etc.
                const delay = baseDelay * Math.pow(2, attempt);
                console.warn(`⚠️ Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
                await sleep(delay);
                continue;
            }

            // If it's not a rate limit error or it's the last attempt, throw the error
            throw error;
        }
    }
};

export const generateDescriptionText = async (jobTitle, companyUserName, compensation = "", experience = "") => {
    try {
        if (!jobTitle) {
            throw new Error("Job title is required");
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Gemini API key not configured");
        }

        const capitalizedCompany = companyUserName
            ? companyUserName.charAt(0).toUpperCase() + companyUserName.slice(1)
            : "[Company Name]";

        // Wrap the AI generation in retry logic
        return await retryWithBackoff(async () => {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `Write a professional and engaging job description for the role of "${jobTitle}" using the following specific format and emojis. Use HTML tags (<h3>, <p>, <ul>, <li>, <strong>) for detailed formatting.

            Format Structure:
            
            <h3>🚀 About the Company</h3>
            <p>Write a brief, exciting placeholder description about a forward-thinking company.</p>
            <br></br>
            <h3>👨💻 Role Overview</h3>
            <p>Write a compelling summary of the role. ${experience ? `The ideal candidate should have approximately <strong>${experience} years</strong> of experience.` : ""}</p>
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
                ${experience ? `<li>Minimum of <strong>${experience} years</strong> of relevant experience.</li>` : ""}
                <li>[Skill 1]</li>
                <li>[Skill 2]</li>
                <li>[Skill 3]</li>
                <li>...</li>
            </ul>
            <br></br>
            <h3>🌟 What We Offer</h3>
            <ul>
                <li>Competitive salary package ${compensation ? `(<strong>${compensation}</strong>)` : ""} 💰</li>
                <li>Friendly and supportive work culture 🤝</li>
                <li>Career growth and learning opportunities 📈</li>
                <li>Flexible working environment (Hybrid / On-site)</li>
            </ul>

            Ensure the tone is professional yet energetic. 
            IMPORTANT: Whenever you mention the company name "${capitalizedCompany}" in any section (especially in "About the Company"), you must wrap it in <strong style="background-color: yellow; padding: 2px 4px; border-radius: 4px;">...</strong> to highlight it.
            Do not wrap the output in markdown code blocks.`;

            const result = await model.generateContentStream(prompt);
            let fullText = "";
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                fullText += chunkText;
            }
            return fullText;
        }, 3, 2000); // 3 retries with 2 second base delay
    } catch (error) {
        console.error("Error in generateDescriptionText:", error);

        // Return a fallback description if AI generation fails completely
        const fallbackDescription = `
            <h3>🚀 About the Company</h3>
            <p>Join our dynamic team and contribute to exciting projects.</p>
            <br></br>
            <h3>👨💻 Role Overview</h3>
            <p>We are looking for a talented ${jobTitle} to join our team. ${experience ? `The ideal candidate should have approximately <strong>${experience} years</strong> of experience.` : ""}</p>
            <br></br>
            <h3>🛠️ Key Responsibilities</h3>
            <ul>
                <li>Collaborate with cross-functional teams</li>
                <li>Deliver high-quality work on time</li>
                <li>Contribute to team success</li>
            </ul>
            <br></br>
            <h3>🎯 Required Skills & Qualifications</h3>
            <ul>
                ${experience ? `<li>Minimum of <strong>${experience} years</strong> of relevant experience.</li>` : ""}
                <li>Strong communication skills</li>
                <li>Team player with problem-solving abilities</li>
            </ul>
            <br></br>
            <h3>🌟 What We Offer</h3>
            <ul>
                <li>Competitive salary package ${compensation ? `(<strong>${compensation}</strong>)` : ""} 💰</li>
                <li>Friendly and supportive work culture 🤝</li>
                <li>Career growth and learning opportunities 📈</li>
                <li>Flexible working environment (Hybrid / On-site)</li>
            </ul>
        `;

        console.warn("⚠️ Using fallback description due to AI generation failure");
        return fallbackDescription;
    }
};

/**
 * Returns a model instance for streaming
 */
export const getGeminiModel = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};
