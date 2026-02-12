import { generateDescriptionText } from "../utils/aiHelper.js";

export const generateJobDescription = async (req, res) => {
    try {
        const { jobTitle, companyUserName, compensation, experience } = req.body;
        const company_id = req.headers["company_id"]?.trim();

        if (!jobTitle) {
            return res.status(400).json({ success: false, message: "Job title is required" });
        }

        // Use the retry-enabled function from aiHelper
        const description = await generateDescriptionText(
            jobTitle,
            companyUserName || "[Company Name]",
            compensation || "",
            experience || ""
        );

        // Send the complete description
        res.status(200).json({
            success: true,
            description: description
        });
    } catch (error) {
        console.error("Error generating job description:", error);

        // Check if it's a rate limit error
        const isRateLimitError =
            error.message?.includes('429') ||
            error.message?.includes('Too Many Requests') ||
            error.message?.includes('Resource exhausted');

        if (isRateLimitError) {
            return res.status(429).json({
                success: false,
                message: "Rate limit exceeded. Please try again in a few moments.",
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to generate description",
            error: error.message
        });
    }
};
