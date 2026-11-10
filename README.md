# ai-call-agent-twilio

An AI phone receptionist you can run in 5 minutes. Callers talk, the agent
listens, thinks with an LLM, and answers by voice.

## Features
- Voice conversation over a real phone number (Twilio)
- Conversation memory for each call
- Swappable personas in `personas/*.json`
- Live transcripts at `/transcripts`

## Quick start
```bash
git clone https://github.com/vikhyathportal-dev/ai-call-agent-twilio.git
cd ai-call-agent-twilio
npm install
cp .env.example .env   # add your API key
npm start
```
Then expose your server with `ngrok http 3000` and set your Twilio
number's voice webhook to `https://YOUR-NGROK-URL/voice` (HTTP POST).

## How it works
Caller speech → Twilio speech recognition → `/respond` → LLM → reply spoken back.

## Roadmap
- Appointment booking with tool calling
- Streaming audio for lower latency
- Docker support

## License
MIT
