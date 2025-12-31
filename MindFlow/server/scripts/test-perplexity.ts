
import dotenv from 'dotenv';
dotenv.config();

const candidates = [
    "llama-3.1-sonar-small-128k-chat",
    "llama-3.1-sonar-large-128k-online",
    "llama-3.1-sonar-large-128k-chat",
    "sonar-reasoning"
];

async function main() {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    console.log("Testing with key:", apiKey?.substring(0, 10) + "...");

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
                const err = await response.text();
                // console.log(err);
            }
        } catch (e: any) {
            console.log(`❌ Error ${model}: ${e.message}`);
        }
    }
}

main();
