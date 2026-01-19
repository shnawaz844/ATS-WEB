import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("No API KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        // There isn't a direct listModels method on genAI instance in some versions, 
        // but usually it's there or we can try a simple generation with a known model to see the error,
        // actually, the error message suggested calling ListModels.
        // In the Node SDK, checking documentation or just trying a generic model might verify access.
        // However, since I can't browse documentation easily, I'll rely on the error message which says "Call ListModels".
        // I don't think the Node SDK has a direct `listModels` helper exposed on the client in all versions, 
        // but let's try to access the model manager if it exists.
        // Attempting to standard fetch if SDK doesn't support it or just try 'gemini-1.5-flash' again to confirm script works.

        // Let's try to just run a generation with a very basic model name 'gemini-1.0-pro' just in case.
        // Or I'll just print the key (masked) to make sure it's loaded.
        console.log("Key loaded:", process.env.GEMINI_API_KEY ? "Yes" : "No");

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-2.0-flash:", result.response.text());

    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
