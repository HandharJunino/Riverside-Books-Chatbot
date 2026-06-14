import readline from "readline";
import { FAQMatcher } from "./matcher.js";
import faqs from "./faqs.json" with { type: "json" };

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log(
    'This is the Riverside Books Chatbot! Ask me a question, am ready to help :) (type "quit" or "exit" to leave).\n',
  );

  const matcher = new FAQMatcher(faqs);
  await matcher.initialize();

  while (true) {
    const userQuestion = await askQuestion("\n You: ");

    const normalized = userQuestion.trim().toLowerCase();
    if (normalized === "quit" || normalized === "exit") {
      console.log(
        "\n Thanks for visiting Riverside Books, hope I helped you! Goodbye :)\n",
      );
      rl.close();
      break;
    }

    if (normalized === "") {
      console.log(" Please do ask me something, I am here to help!\n");
      continue;
    }

    const result = await matcher.findBestMatch(userQuestion);

    if (result.isMatch && result.faq) {
      const percent = Math.round(result.similarity * 100);
      console.log(`\n Bot: ${result.faq.answer}`);
      console.log(`   ( confidence: ${percent}%)\n`);
    } else {
      const percent = Math.round(result.similarity * 100);
      console.log(`\n Bot: Sorry, I haven't got the answer to that.`);
      console.log(
        `   Please do reach out to a member of staff or check our website for further information.`,
      );
      console.log(
        `   ( best match confidence: ${percent}% - below threshold)\n`,
      );
    }
  }
}

main().catch(console.error);
