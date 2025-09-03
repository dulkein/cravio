// server.js - Simple backend for Cravio
const express = require("express");
const cors = require("cors");

// Create express app
const app = express();
const PORT = 3000;

// Your OpenAI API key (⚠️ best practice: load from environment variable)
const OPENAI_API_KEY = "OPEN_AI_API";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "Server is running!" });
});

// Root route
app.get("/", (req, res) => {
    res.send("Cravio server is running!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Cravio server running at http://localhost:${PORT}`);
    console.log(`📱 Put your HTML file in the 'public' folder and visit the URL above`);
});


// API endpoint to get meal suggestions
app.post("/api/meal-suggestion", async (req, res) => {
    try {
        const { mood, ingredients } = req.body;

        if (!mood || !ingredients) {
            return res.status(400).json({
                error: "Please provide both mood and ingredients",
            });
        }

        // Use built-in fetch in Node.js v22
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4.1-mini", // ✅ correct model name
                messages: [
                    {
                        role: "system",
                        content:
                            "You are Cravio, a friendly AI chef that suggests meals based on people’s emotions and available ingredients. Always provide 2–3 meal options with a detailed recipe for the top recommendation. Be warm and encouraging in your tone.",
                    },
                    {
                        role: "user",
                        content: `I'm feeling ${mood} and I have these ingredients available: ${ingredients}. 

Please suggest 2-3 meal options that would be perfect for my current mood and use the ingredients I have. Then provide a detailed, easy-to-follow recipe for your top recommendation.

Format your response like this:
🍽️ PERFECT MEALS FOR YOU:
[List 2-3 meal suggestions with brief descriptions]

👨‍🍳 FEATURED RECIPE: [Name of top recommendation]
[Detailed step-by-step recipe]

💭 WHY THIS MEAL?
[Brief explanation of why this meal matches their mood]`,
                    },
                ],
                max_tokens: 800,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "OpenAI API error");
        }

        const data = await response.json();
        const suggestion = data.choices[0].message.content;

        res.json({ suggestion });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: "Sorry, something went wrong. Please try again.",
        });
    }
});


