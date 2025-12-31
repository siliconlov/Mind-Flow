
const dotenv = require('dotenv');
dotenv.config();

const model = "sonar-pro";

async function main() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    console.log("Testing Streaming with key:", apiKey ? apiKey.substring(0, 5) + "..." : "NONE");
    console.log(`Model: ${model}`);

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "user", content: "Write a long poem about coding." }
                ],
                stream: true
            })
        });

        if (!response.ok) {
            console.log(`❌ Failed: ${response.status}`);
            console.log(await response.text());
            return;
        }

        console.log("✅ Connection established. Receiving stream...");

        // Simulating stream reading for Node (since fetch in Node 18+ has .body)
        // If not available, we might need a different approach or just check headers.
        // Node's native fetch response body is a ReadableStream.

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            process.stdout.write(chunk); // Print raw chunks to see SSE format
        }
        console.log("\n✅ Stream finished.");

    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
}

main();
