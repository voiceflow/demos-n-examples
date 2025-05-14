# Voiceflow demos-n-examples | Repositories Overview

In this document, you will find a collection of various projects and demos implemented under the Voiceflow team. Each project link is associated with a specific commit.

## Repositories

- **Tico Nano UDP Audio server**
    - A demo server for an integration with Voiceflow and M5Stack Echo Nano and Core2 devices that enables real-time voice interactions with Voiceflow Dialog Manager. It receives raw PCM audio over UDP, transcribes speech using Whisper (with support for both local and Groq cloud-based transcription), processes the text through Voiceflow's Dialog Manager, and returns TTS audio responses. The demo server can be deployed either with a local Whisper ASR service or using Groq's cloud-based transcription API for improved performance.
    - [Repository Link](https://github.com/voiceflow-gallagan/tico-nano-udp-audio-server)

- **Voiceflow KB Query MCP Server**
    - A Node.js server that provides access to the Voiceflow Knowledge Base Query API using the Model Context Protocol (MCP).
    - [Repository Link](https://github.com/voiceflow-gallagan/Voiceflow-KB-MCP)


- **Voice Call Timer**
    - A Node.js service that monitors Voiceflow voice calls and automatically ends them based on custom time limits. Perfect for implementing usage limits based on user subscription tiers or managing call durations within your Voiceflow assistant.
    - [Repository Link](https://github.com/voiceflow-gallagan/voice-call-timer)


- **Voiceflow MCP Client**
    - A Node.js client for the Model Context Protocol (MCP) that integrates with remote MCP servers to provide tools for your Voiceflow Agent.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-mcp-server-client)

- **Answers | User Feedback with transcripts**
    - A feedback collection and visualization system demo for Voiceflow conversations. This application allows you to gather, store, and display user feedback from your Voiceflow widget interactions, providing valuable insights into user satisfaction and conversation quality.
    - [Repository Link](https://github.com/voiceflow-gallagan/answers-user-feedback)

- **Voiceflow Perplexity Reasoning Extension**
    - Integrate Perplexity AI's reasoning capabilities into your Voiceflow widget for step-by-step reasoning and professional responses.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-perplexity-reasoning-extension)

- **Call Recorder and PII Redactor**
    - A real-time call recording and transcription system built with Voiceflow Twilio voice integration, Next.js, and Bun. This application automatically records incoming calls, transcribes and redacts personally identifiable information (PII), and provides a dashboard to manage and review call recordings and transcripts.
    - [Repository Link](https://github.com/voiceflow-gallagan/poc-twilio-call-recorder)

- **Voice Agent Tester**
    - A web application for testing Voiceflow voice agents through automated test scenarios. This application allows you to create test cases with specific personas and goals, then execute them by making outbound calls to your voice agent.
    - [Repository Link](https://github.com/voiceflow-gallagan/poc-voice-tester)

- **Top Questions Analyzer**
    - A tool to analyze and cluster the most frequently asked questions from your Voiceflow assistant's transcripts. It uses Natural to extract questions and GPT-4o to intelligently group similar questions and provide a top questions report.
    - [Repository Link](https://github.com/voiceflow-gallagan/top-questions)

- **Voiceflow Form Extension Demo**
    - This repository demonstrates a custom implementation of the Voiceflow Chat Widget with form-based extensions. The demo showcases a Renault 5 test drive booking experience.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-form-extension-demo)

- **Voiceflow Voice Outbound Demo**
    - This service enables outbound voice calls using Twilio and Voiceflow Voice feature, with advanced call handling features including answering machine detection, call status tracking, and seamless integration with Voiceflow's conversational AI.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-voice-outbound)

- **Voiceflow Phoenix Integration**
    - This example shows how to use [@arizeai/openinference](https://github.com/Arize-ai/openinference/tree/main) to instrument a Voiceflow agent.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-phoenix-integration)

- **Voiceflow Transcripts CSV Exporter**
    - This project is a parser/csv exporter for Voiceflow agent transcripts, designed to fetch and process transcripts data using the Voiceflow Transcripts API.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-transcripts-csv-export)

- **Spacy PII redac service**
    - A Flask-based API service that uses SpaCy's Named Entity Recognition (NER) to identify and redact Personally Identifiable Information (PII) from text.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-spacy-pii-redac)

- **PDF Content Reader | Chat Widget Extension**
    - Chat widget extension to allow extracting text from PDFs and sending the content back to the Voiceflow agent.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-pdf-content-reader-extension)

- **Shopify Demo | Chat Widget Extensions**
    - Extensions used in the Shopify demos | Developer Lab & Making Bots
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-shopify-demo-extensions)

- **Sitemaps KB Auto Uploader**
    - This project is a sitemap processor that updates a knowledge base using the Voiceflow API. It provides both API endpoints and a scheduled cron job for processing sitemaps. When available, it will use last update info from the sitemaps to check if the doc need to be updated and if there are new documents to add to the knowledge base.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-sitemap-kb-auto-updater)

- **Seat Selector Extension demo**
    - Extension demo from the JetBlue Developer Lab
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-seatselector-extension-demo)

- **Voiceflow with VAPI Custom LLM**
    - Use your Voiceflow agent as a VAPI custom llm
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-vapi)

- **Goose Guide Bot**
    - A Voiceflow-powered AI chat agent to help hackers get answers to their questions quickly and accurately! Open sourced as of Hack the North 2024 on Wednesday, August 21st, 2024.
    - [Repository Link](https://github.com/hackthenorth/goose-guide-bot)

- **Voiceflow Chat Widget Domain Checker**
    - Use a Cloudflare worker and a Javascript Step in your agent to filter allowed domains for your Chat Widget.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-chat-domain-checker)

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
    - A Minecraft integration for Voiceflow!
    Built based off the Python example from Voiceflow's Python API Example.
    We connect to the Minecraft server's RCON interface to send commands to the server, and monitor the server's log file to get player messages.
    - [Repository Link](https://github.com/SuperZooper3/Voiceflow-MineFlow)

- **Chat Widget Extensions**
    - This repository contains a demonstration of various chat widget extensions for Voiceflow. The extensions include functionality for video playback, timers, forms, maps, file uploads, date selection, confetti effects, and feedback collection.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-extensions-demo)

- **KB File Downloader**
    - This Node.js application allows you to download documents from Voiceflow's API by specifying a document ID. It automatically detects the document's file type and saves it with the appropriate extension.
    - [Repository Link](https://github.com/voiceflow-gallagan/download-kb-file)

- **Analytics Proxy**
    - This repository contains a Node.js application that acts as a proxy between a Chat Widget and the Voiceflow Dialog Manager (DM) API. The primary purpose of this proxy is to intercept requests sent from the Chat Widget to the Voiceflow DM API's `/interact` endpoint, allowing for the collection, parsing, and analysis of response traces for analytics purposes.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-analytics-proxy)

- **Crawler | KB Uploader**
    - A modified version of the GPT Crawler (https://github.com/BuilderIO/gpt-crawler) to fetch content from a website, convert it in markdown and upload everything to your Voiceflow agent knowledge base as text.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-crawler-uploader)

- **Voiceflow Date Parser API**
    - API to parse human date like 'tomorrow at 10:00' to ISO 8601 formatted date.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-date-parser)

- **Voiceflow Twilio SMS Integration**
    - This project is a Voiceflow Twilio SMS Integration using Docker and Docker Compose. It allows you to interact with the Voiceflow general runtime API via SMS using Twilio.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-twilio-sms-integration)

- **Voiceflow Twilio SMS Integration | Dev Labs Real Estate DEMO**
    - This project is a Voiceflow Twilio SMS Integration to listen for webhook from Twilio and/or send direct SMS to a phone number.
    It allows you to interact with the Voiceflow general runtime API via SMS using Twilio.
    You can run it using Docker and Docker Compose or locally using Bun.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-twilio-sms-realestate)

- **Voiceflow Proxy API**
    - Proxy API to update variables on client side and use them in the Assistant without leaking your VF API Key. Using Bun and fastify.
    - [Repository Link](https://github.com/voiceflow-gallagan/vf-proxy-api)

- **Presidio API | PII Anonymizer**
    - This repository contains a service that exposes an endpoint for anonymizing Personally Identifiable Information (PII). It uses the [Microsoft Presidio](https://github.com/microsoft/presidio/tree/main) project for the anonymization process. The application is built on [Bun](https://bun.sh), a JavaScript runtime that helps to create performant applications.
    - [Repository Link](https://github.com/voiceflow-gallagan/presidio-api)

- **Spotlight Demo | Electron App**
    - This repository contains a sample code for an Electron app that uses Voiceflow Dialog API to interact with your Voiceflow Assistant and return a markdown formated response with some animation.
    - [Repository Link](https://github.com/voiceflow-gallagan/vfassistant-electron)

- **Upload Zendesk Articles to VF Knowledge base**
    - This repository contains a sample code for an integration to fetch, clean and upload Zendesk articles to VF KB.
    - [Repository Link](https://github.com/voiceflow-gallagan/kb-vf-zendesk)

- **Text to Image using Voiceflow API Step and Hugging Face**
    - This repository contains a Node.js application with the endpoint /text2image leveraging Hugging Face's textToImage function of their inference API.
    - [Repository Link](https://github.com/voiceflow-gallagan/hugginface-inference)

- **ASR Demo Whisper**
    - A demo application for Automatic Speech Recognition (ASR) using Whisper model.
    - [Repository Link](https://github.com/voiceflow-gallagan/asr-demo-whisper)

- **Elevenlabs Integration**
    - How to use Elevenlabs voices in your Voiceflow Agent.
    - [Repository Link](https://github.com/voiceflow-gallagan/elevenlabs-integration)

- **Example Integration WhatsApp**
    - An example of integration with WhatsApp, supporting Buttons, Images and Audio Messages.
    - [Repository Link](https://github.com/voiceflow/example-integration-whatsapp)

- **Example Integration MS Teams**
    - An example of integration with MS Teams.
    - [Repository Link](https://github.com/voiceflow-gallagan/api-integration-msteams)

- **Langchain Local Knowledgebase**
    - A local knowledge base setup based on LangChain.
    - [Repository Link](https://github.com/voiceflow-gallagan/langchain-local-knowledgebase)

- **NER Manager**
    - A tool for Named Entity Recognition (NER).
    - [Repository Link](https://github.com/voiceflow-gallagan/ner-manager)

- **Replicate LLM Models API**
    - An API setup to use Language Learning Models (LLM) available on Replicate in your Voiceflow Agent.
    - [Repository Link](https://github.com/voiceflow-gallagan/replicate-llm-models-api)

- **Voiceflow Discord**
    - Voiceflow demo integration with Discord.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-discord)

- **Voiceflow Live Answer Discord**
    - Voiceflow demo integration with Discord and the live answer feature.
    - [Repository Link](https://github.com/voiceflow-gallagan/discord-live-answer-example)

- **Voiceflow Slack**
    - Voiceflow demo integration with Slack.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-slack)

- **Voiceflow Twilio IVR**
    - A Voiceflow Interactive Voice Response (IVR) system based on the Twilio service supporting Voice, SMS and call actions.
    - [Repository Link](https://github.com/voiceflow-gallagan/voiceflow-twilio-ivr)

- **Voiceflow Telegram**
    - Voiceflow demo integration with Telegram.
    - [Repository Link](https://github.com/zslamkov/voiceflow_telegram)

- **Webpage Chat Demo**
    - A demo for chat functionality on a webpage.
    - [Repository Link](https://github.com/voiceflow-gallagan/webpage-chat-demo)


![](https://api.swetrix.com/log/noscript?pid=CmgAraxzLROa)

<a href="https://trackgit.com">
<img src="https://us-central1-trackgit-analytics.cloudfunctions.net/token/ping/ljx5x2q1gqj3c168ceml" alt="trackgit-views" />
</a>
