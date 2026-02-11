import { getGeminiModel } from "../utils/aiHelper.js";

export const generateJobDescription = async (req, res) => {
    try {
        const { jobTitle, companyUserName, compensation, experience } = req.body;
        const company_id = req.headers["company_id"]?.trim();
        const capitalizedCompany = companyUserName ? companyUserName.charAt(0).toUpperCase() + companyUserName.slice(1) : "[Company Name]";
        // getGeminiModel
        if (!jobTitle) {
            return res.status(400).json({ success: false, message: "Job title is required" });
        }

        const model = getGeminiModel();

        const prompt = `Write a professional and engaging job description for the role of "${jobTitle}" using the following specific format and emojis. Use HTML tags (<h3>, <p>, <ul>, <li>, <strong>) for detailed formatting.

        Format Structure:
        
        <h3>🚀 About the Company</h3>
        <p>Write an exciting and professional description about ${capitalizedCompany}, highlighting its mission and impact.</p>
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

        <hr>
        <strong>CRITICAL INSTRUCTIONS:</strong>
        1. <strong>Language:</strong> The entire output MUST be strictly in professional English. Do NOT include any words from other languages (like Russian, Spanish, etc.).
        2. <strong>Experience Requirement:</strong> You MUST strictly use the value "${experience}" for required experience. Do NOT mention any other experience ranges (like "1-3 years" or "preferred experience") in any section.
        3. <strong>Compensation:</strong> If compensation is specified as "${compensation}", use only this value. Do not suggest other salary ranges.
        4. <strong>Consistency:</strong> Ensure that the "Role Overview" and "Required Skills & Qualifications" sections are perfectly consistent with the "${experience}" requirement you were provided.
        5. <strong>Formatting:</strong> Always use the requested HTML tags.

        Ensure the tone is professional yet energetic. 
        IMPORTANT: Whenever you mention the company name "${capitalizedCompany}" in any section (especially in "About the Company"), you must wrap it in <strong style="background-color: yellow; padding: 2px 4px; border-radius: 4px;">...</strong> to highlight it.
        Do not wrap the output in markdown code blocks.`;

        const result = await model.generateContentStream(prompt);

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
        }

        res.end();
    } catch (error) {
        console.error("Error generating job description:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Failed to generate description", error: error.message });
        } else {
            res.end();
        }
    }
};
