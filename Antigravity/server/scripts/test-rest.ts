
import dotenv from 'dotenv';
dotenv.config();

const candidates = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.5-pro-001",
    "gemini-1.0-pro",
    "gemini-pro"
];

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;

    const models = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash"];
    for (const model of models) {
        console.log(`Testing ${model} (v1beta)...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello" }] }]
                })
            });

            if (response.ok) {
                console.log(`✅ SUCCESS: ${model}`);
                return;
            } else {
                console.log(`❌ Failed ${model}: ${response.status}`);
            }
        } catch (e: any) {
            console.log(`❌ Error ${model}: ${e.message}`);
        }
    }
    console.log("All candidates failed.");
}

main();
