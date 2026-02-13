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

const getPrompt = (jobTitle, capitalizedCompany, experience, compensation) => {
    return `Write a professional and engaging job description for the role of "${jobTitle}" using the following specific format and emojis. Use HTML tags (<h3>, <p>, <ul>, <li>, <strong>) for detailed formatting.

            Format Structure:
            
            <h3>🚀 About the Company</h3>
            <p>Write an exciting description about ${capitalizedCompany || "our company"}.</p>
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
                <li>Flexible working environment</li>
            </ul>

            Ensure the tone is professional yet energetic. 
            ${capitalizedCompany ? `IMPORTANT: Whenever you mention the company name "${capitalizedCompany}" in any section (especially in "About the Company"), you must wrap it in <strong style="background-color: yellow; color: #000000; padding: 2px 4px; border-radius: 4px;">...</strong> to highlight it. The 'color: #000000' is essential for readability in dark mode.` : ""}
            
            CRITICAL: Provide ONLY the raw HTML body. 
            - DO NOT wrap the output in markdown code blocks like \`\`\`html ... \`\`\`.
            - DO NOT include "html" or any language identifiers at the start.
            - Start the output directly with the first <h3> tag.
            Failure to follow this will break the UI formatting.`;
};

export const generateDescriptionStream = async (jobTitle, companyUserName, compensation = "", experience = "") => {
    try {
        if (!jobTitle) throw new Error("Job title is required");
        if (!process.env.GEMINI_API_KEY) throw new Error("Gemini API key not configured");

        const capitalizedCompany = companyUserName
            ? companyUserName.charAt(0).toUpperCase() + companyUserName.slice(1)
            : "";

        return await retryWithBackoff(async () => {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = getPrompt(jobTitle, capitalizedCompany, experience, compensation);
            const result = await model.generateContentStream(prompt);
            return result.stream;
        }, 3, 2000);
    } catch (error) {
        console.error("Error in generateDescriptionStream:", error);
        throw error;
    }
};

export const generateDescriptionText = async (jobTitle, companyUserName, compensation = "", experience = "") => {
    try {
        const stream = await generateDescriptionStream(jobTitle, companyUserName, compensation, experience);
        let fullText = "";
        for await (const chunk of stream) {
            fullText += chunk.text();
        }
        return fullText;
    } catch (error) {
        console.error("Error in generateDescriptionText:", error);
        throw error;
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
