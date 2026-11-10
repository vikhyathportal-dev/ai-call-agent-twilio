require('dotenv').config();
const express = require('express');
const { twiml } = require('twilio');
const persona = require('./personas/receptionist.json');

const app = express();
app.use(express.urlencoded({ extended: false }));

const calls = new Map(); // CallSid -> conversation history

async function askAI(history) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5-5',
      max_tokens: 150,
      system: persona.prompt,
      messages: history
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || 'Sorry, could you repeat that?';
}

function listen(response, text) {
  const gather = response.gather({
    input: 'speech',
    action: '/respond',
    speechTimeout: 'auto'
  });
  gather.say(text);
  response.redirect('/respond');
}

app.post('/voice', (req, res) => {
  calls.set(req.body.CallSid, []);
  const response = new twiml.VoiceResponse();
  listen(response, persona.greeting);
  res.type('text/xml').send(response.toString());
});

app.post('/respond', async (req, res) => {
  const response = new twiml.VoiceResponse();
  const speech = req.body.SpeechResult;
  const history = calls.get(req.body.CallSid) || [];

  if (!speech) {
    listen(response, "Sorry, I didn't catch that. Could you say it again?");
  } else {
    history.push({ role: 'user', content: speech });
    const reply = await askAI(history);
    history.push({ role: 'assistant', content: reply });
    calls.set(req.body.CallSid, history);
    console.log(`Caller: ${speech}\nAgent: ${reply}`);

    if (/goodbye|bye/i.test(speech)) {
      response.say(reply);
      response.hangup();
    } else {
      listen(response, reply);
    }
  }
  res.type('text/xml').send(response.toString());
});

// Simple transcript viewer
app.get('/transcripts', (req, res) => {
  res.json(Object.fromEntries(calls));
});

app.listen(process.env.PORT || 3000, () =>
  console.log('AI call agent running')
);
