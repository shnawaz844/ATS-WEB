import { generateDescriptionStream } from "../utils/aiHelper.js";

export const generateJobDescription = async (req, res) => {
    try {
        const { jobTitle, companyUserName, compensation, experience, compensationPeriod } = req.body;
        const company_id = req.headers["company_id"]?.trim();

        if (!jobTitle) {
            return res.status(400).json({ success: false, message: "Job title is required" });
        }

        // Use the streaming-enabled function from aiHelper
        const stream = await generateDescriptionStream(
            jobTitle,
            companyUserName || "",
            compensation || "",
            experience || "",
            compensationPeriod || ""
        );

        // Set appropriate headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        let isFirstChunk = true;
        for await (const chunk of stream) {
            let chunkText = chunk.text();

            // Post-processing to strip markdown code block artifacts if AI ignores prompt instructions
            if (isFirstChunk) {
                chunkText = chunkText.replace(/^[\s\n]*```(?:html)?[\s\n]*/i, '');
                isFirstChunk = false;
            }
            // Also sanitize the end if it contains the closing marks
            chunkText = chunkText.replace(/```[\s\n]*$/g, '');

            res.write(chunkText);
        }
        res.end();
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
