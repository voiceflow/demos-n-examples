# Voiceflow demos-n-examples Repositories Overview

In this document, you will find a collection of various projects and demos implemented under the Voiceflow team. Each project link is associated with a specific commit.


## Repositories
- **Voiceflow KB Content Export**
    - A command line tool to export all Voiceflow KB docs content into txt files.
    A ZIP archive is auto generated with the extracted content.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-kb-content-export)
- **Voiceflow GameFlow: LLM powered Unity Game**
    - A Unity game integrating Voiceflow as a custom interface with an LMM powered NPC, that not only can have organic conversatoins, but through agent design can also interract with the game world, by giving or receiving items, changing the game scene, or pulling from a knowledge base of lore.
    - [Repository Link](https://github.com/SuperZooper3/Voiceflow-GameFlow)
- **EduChat | AI app**
    - This is an AI app built in React. It enhances learning outcomes and interactivity by following along with students' reading of articles, asking questions, and engaging in conversation.
    - [Repository Link](https://github.com/SuperZooper3/Voiceflow-EduChat)
- **Tico Me | Audio to KB**
    - A desktop app example to record audio from your computer, use a whisper endpoint to generate transcripts and upload them to your Agent knowledge base.
    - [Repository Link](https://github.com/voiceflow-gallagan/tico-me)
- **LLMLingua2 | Prompt Compression**
    - Learn how to leverage Microsoft's LLMLingua2 for efficient prompt compression, enhancing your Voiceflow agent's performance, tokens usage and reducing latency as we also explore integrating latest OpenAI's GPT-4o model with a fallback to GPT-4 Turbo using Cloudflare Al Gateway.
    - [Repository Link](https://github.com/voiceflow-gallagan/llmlingua-api)
- **Voiceflow MineFlow**
    - Description: A Minecraft integration for Voiceflow!
    Built based off the Python example from Voiceflow's Python API Example.
    We connect to the Minecraft server's RCON interface to send commands to the server, and monitor the server's log file to get player messages.
    - [Repository Link](https://github.com/SuperZooper3/Voiceflow-MineFlow)
- **Chat Widget Extensions**
    - Description: This repository contains a demonstration of various chat widget extensions for Voiceflow. The extensions include functionality for video playback, timers, forms, maps, file uploads, date selection, confetti effects, and feedback collection.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-extensions-demo)
- **KB File Downloader**
    - Description: This Node.js application allows you to download documents from Voiceflow's API by specifying a document ID. It automatically detects the document's file type and saves it with the appropriate extension.
    - [Repository Link](https://github.com/voiceflow-gallagan/download-kb-file)
- **Analytics Proxy**
    - Description: This repository contains a Node.js application that acts as a proxy between a Chat Widget and the Voiceflow Dialog Manager (DM) API. The primary purpose of this proxy is to intercept requests sent from the Chat Widget to the Voiceflow DM API's `/interact` endpoint, allowing for the collection, parsing, and analysis of response traces for analytics purposes.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-analytics-proxy)

- **Crawler | KB Uploader**
    - Description: A modified version of the GPT Crawler (https://github.com/BuilderIO/gpt-crawler) to fetch content from a website, convert it in markdown and upload everything to your Voiceflow agent knowledge base as text.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-crawler-uploader)

- **Voiceflow Date Parser API**
    - Description: API to parse human date like 'tomorrow at 10:00' to ISO 8601 formatted date.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-date-parser)

- **Voiceflow Twilio SMS Integration**
    - Description: This project is a Voiceflow Twilio SMS Integration using Docker and Docker Compose. It allows you to interact with the Voiceflow general runtime API via SMS using Twilio.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-twilio-sms-integration)

- **Voiceflow Proxy API**
    - Description: Proxy API to update variables on client side and use them in the Assistant without leaking your VF API Key. Using Bun and fastify.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-proxy-api)

- **Presidio API | PII Anonymizer**
    - Description: This repository contains a service that exposes an endpoint for anonymizing Personally Identifiable Information (PII). It uses the [Microsoft Presidio](https://github.com/microsoft/presidio/tree/main) project for the anonymization process. The application is built on [Bun](https://bun.sh), a JavaScript runtime that helps to create performant applications.
    - [Repository Link](https://github.com/voiceflow-gallagan/presidio-api)

- **Spotlight Demo | Electron App**
    - Description: This repository contains a sample code for an Electron app that uses Voiceflow Dialog API to interact with your Voiceflow Assistant and return a markdown formated response with some animation.
    - [Repository Link](https://github.com/voiceflow-gallagan/vfassistant-electron)

- **Upload Zendesk Articles to VF Knowledge base**
    - Description: This repository contains a sample code for an integration to fetch, clean and upload Zendesk articles to VF KB.
    - [Repository Link](https://github.com/voiceflow-gallagan/kb-vf-zendesk)

- **Text to Image using Voiceflow API Step and Hugging Face**
    - Description: This repository contains a Node.js application with the endpoint /text2image leveraging Hugging Face's textToImage function of their inference API.
    - [Repository Link](https://github.com/voiceflow-gallagan/hugginface-inference)

- **ASR Demo Whisper**
    - Description: A demo application for Automatic Speech Recognition (ASR) using Whisper model.
    - [Repository Link](https://github.com/voiceflow-gallagan/asr-demo-whisper)

- **Elevenlabs Integration**
    - Description: How to use Elevenlabs voices in your Voiceflow Agent.
    - [Repository Link](https://github.com/voiceflow-gallagan/elevenlabs-integration)

- **Example Integration WhatsApp**
    - Description: An example of integration with WhatsApp, supporting Buttons, Images and Audio Messages.
    - [Repository Link](https://github.com/voiceflow/example-integration-whatsapp)

- **Example Integration MS Teams**
    - Description: An example of integration with MS Teams.
    - [Repository Link](https://github.com/voiceflow-gallagan/api-integration-msteams)

- **Langchain Local Knowledgebase**
    - Description: A local knowledge base setup based on LangChain.
    - [Repository Link](https://github.com/voiceflow-gallagan/langchain-local-knowledgebase)

- **NER Manager**
    - Description: A tool for Named Entity Recognition (NER).
    - [Repository Link](https://github.com/voiceflow-gallagan/ner-manager)

- **Replicate LLM Models API**
    - Description: An API setup to use Language Learning Models (LLM) available on Replicate in your Voiceflow Agent.
    - [Repository Link](https://github.com/voiceflow-gallagan/replicate-llm-models-api)

- **Voiceflow Discord**
    - Description: Voiceflow demo integration with Discord.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-discord)

- **Voiceflow Live Answer Discord**
    - Description: Voiceflow demo integration with Discord and the live answer feature.
    - [Repository Link](https://github.com/voiceflow-gallagan/discord-live-answer-example)

- **Voiceflow Slack**
    - Description: Voiceflow demo integration with Slack.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-slack)

- **Voiceflow Twilio IVR**
    - Description: A Voiceflow Interactive Voice Response (IVR) system based on the Twilio service supporting Voice, SMS and call actions.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-twilio-ivr)

- **Voiceflow Telegram**
    - Description: Voiceflow demo integration with Telegram.
    - [Repository Link](https://github.com/zslamkov/voiceflow_telegram)

- **Webpage Chat Demo**
    - Description: A demo for chat functionality on a webpage.
    - [Repository Link](https://github.com/voiceflow-gallagan/webpage-chat-demo)


<a href="https://trackgit.com">
<img src="https://us-central1-trackgit-analytics.cloudfunctions.net/token/ping/ljx5x2q1gqj3c168ceml" alt="trackgit-views" />
</a>
