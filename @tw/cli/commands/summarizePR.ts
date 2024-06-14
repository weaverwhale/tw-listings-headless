import axios from 'axios';
import { getCurrentBranch } from '../utils/git';
import { getSecretFromManager } from '@tw/utils/module/secrets';
import { runProcess } from '../utils/runProcess';

async function queryChatGPT(messages) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getSecretFromManager('open-ai-key')}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error querying ChatGPT:', error.response ? error.response.data : error.message);
    throw error;
  }
}

export async function runSummarize() {
  try {
    const diffOutput = await gitDiff();

    if (!diffOutput.trim()) {
      console.log('No differences found in the git diff.');
      return;
    }

    const tokens = diffOutput.split(/\s+/); // Split by whitespace
    const maxTokensPerMessage = 500; // Adjust as needed

    const messages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      {
        role: 'user',
        content: 'I am going to give you a git diff and ask you to summarize it:',
      },
    ];
    let currentMessage = '';

    for (const token of tokens) {
      if (currentMessage.length + token.length < maxTokensPerMessage) {
        currentMessage += token + ' ';
      } else {
        messages.push({ role: 'user', content: currentMessage.trim() });
        currentMessage = token + ' ';
      }
    }

    if (currentMessage.trim()) {
      messages.push({ role: 'user', content: currentMessage.trim() });
    }
    messages.push({
      role: 'user',
      content:
        'Please summarize all of that as a description of the git diff in 2 paragraphs or less',
    });

    const response = await queryChatGPT(messages);
    console.log(response);
  } catch (error) {
    // Handle error
  }
}

export async function gitDiff() {
  const diff = (
    await runProcess({
      log: false,
      command: 'git',
      commandArgs: ['diff', 'master...' + (await getCurrentBranch()), '--', ':!*.json'],
    })
  ).stdout.trim();
  return diff;
}
