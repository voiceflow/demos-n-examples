# Replicate LLM Model API | Voiceflow

A simple server built on Node.js using the Express framework that provides an interface to generate text using the [Replicate](https://replicate.com/) library.
The service receives text prompts and returns the generated text based on the given prompt and the selected LLM model.


## Node.js
If you are running this on Node.js 16, either:

run the application with NODE_OPTIONS='--experimental-fetch' node ..., or
install node-fetch and follow the instructions <a href="https://github.com/node-fetch/node-fetch#providing-global-access" target="_blank" rel="noopener noreferrer">here</a>

If you are running this on Node.js 18 or 19, you do not need to do anything.


## Setup

To install and set up the repository, follow these steps:

Clone the repository:

```bash
git clone https://github.com/user/repo.git
cd repo
```

Install dependencies:

```bash
npm install
```

Create a .env file (or rename the .env.example) in the root directory with your REPLICATE_TOKEN:
REPLICATE_TOKEN=your_replicate_token

Replace **your_replicate_token** with your own token.

(Optional) If you need to use a specific port number, add the PORT variable to your .env file:
PORT=your_preferred_port

Replace **PORT** value with your desired port number.


## Usage

Once you have the repository installed and environment variables set up, you can start the server using the command:

```bash
npm start
```

It will start the server at http://localhost:PORT, where PORT is the value from your .env file or the default value 3210.


## Endpoint

### `/api`

This endpoint allows a **POST** request with the **prompt**, the **model** name and the **settings** for this model.
You can find more information about the settings from the models documentation below.

**Request**:

| Parameter          | Type    | Description                                       | Default                    |
| ------------------ | ------- | ------------------------------------------------- | -------------------------- |
| prompt             | String  | Required. The text prompt for generation.        |                            |
| model              | String  | Model identifier, available in \`models.json\`.    | "dolly-v2-12b"             |
| max_tokens         | Integer | Maximum number of tokens to generate.            | 100                        |
| max_length         | Integer | Maximum length of the generated text.            | 100                        |
| top_p              | Float   | Top-p sampling value.                             | 1                          |
| top_k              | Integer | Top-k sampling value.                             |                            |
| decoding           | String  | Decoding strategy, either "top_p" or "top_k".    | "top_p"                    |
| temperature        | Float   | Softmax temperature.                              | 0.75                       |
| repetition_penalty | Float   | Penalty for repetitive tokens.                   | 1.2                         |

**Response**:

A JSON object containing the following fields:

| Field     | Type    | Description                  |
| --------- | ------- | ---------------------------- |
| success   | Boolean | Whether the request succeeded |
| response  | String  | The generated text output     |
| processingTimeSec  | Float  | The processing time in seconds     |
| error     | String  | Error message (if any)        |

**EXAMPLE REQUEST**
```json
{
  "prompt":"Who was Dolly the sheep?",
  "model":"dolly-v2-12b",
  "max_tokens": 500,
  "top_p":1,
  "temperature": 0.75,
  "repetition_penalty": 1.2,
  "decoding":"top_p"
}
```

**EXAMPLE RERSPONSE**
```json
{
  "success": true,
  "response": "Dolly could have been any sheep, but she especially became famous because she was the first successfully cloned mammal\n\n",
  "processingTimeSec": 0.5,
}
```

## Available models

Here is a list of the models you can use with this API.
Of course, you can update the `model.json` file as you want to add/remove models.

| Model Name | Creator |
| --- | --- |
| `dolly-v2-12b` | Databricks |
| `stablelm-tuned-alpha-7b` | Stability AI |
| `flan-t5-xl` | Google |
| `llama-7b` | Meta AI |
| `oasst-sft-1-pythia-12b` | Open-Assistant |
| `gpt-j-6b` | EleutherAI |

https://replicate.com/replicate/dolly-v2-12b

https://replicate.com/stability-ai/stablelm-tuned-alpha-7b

https://replicate.com/replicate/flan-t5-xl

https://replicate.com/replicate/llama-7b

https://replicate.com/replicate/oasst-sft-1-pythia-12b

https://replicate.com/replicate/gpt-j-6b


The `split` setting for each model can be set to true or false. It's used to join the response array into a string for model that returns an array of strings.


## Using ngrok

To allow access to the app externally using the port set in the `.env` file, you can use ngrok. Follow the steps below:

1. Install ngrok: https://ngrok.com/download
2. Run `ngrok http <port>` in your terminal (replace `<port>` with the port set in your `.env` file)
3. Copy the ngrok URL generated by the command and use it in your Voiceflow Assistant API step.

This can be handy if you want to quickly test this in an API step within your Voiceflow Assistant.
