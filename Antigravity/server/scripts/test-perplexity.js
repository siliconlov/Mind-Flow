
const dotenv = require('dotenv');
dotenv.config();

const candidates = [
    "llama-3.1-sonar-small-128k-online",
    "llama-3.1-8b-instruct",
    "sonar-pro"
];

async function main() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    console.log("Testing with key:", apiKey ? apiKey.substring(0, 5) + "..." : "NONE");

    for (const model of candidates) {
        console.log(`Testing ${model}...`);

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
                        { role: "user", content: "Hello" }
                    ]
                })
            });

            if (response.ok) {
                console.log(`✅ SUCCESS: ${model}`);
                const data = await response.json();
                console.log(data.choices[0].message.content);
                return;
            } else {
                console.log(`❌ Failed ${model}: ${response.status}`);
            }
        } catch (e) {
            console.log(`❌ Error ${model}: ${e.message}`);
        }
    }
}

main();
