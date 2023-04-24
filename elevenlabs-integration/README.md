# VF-ElevenLabs API Integration

This Node.js application uses the Eleven Labs API to synthesize text to speech. It takes in text and voice settings as input and returns the synthesized audio in a data URI format you can use in an Audio step in your Assistant.

Loom video: https://www.loom.com/share/a9a0abf118594ba590386024c905596f

## Prerequisites

- Node.js installed on your machine

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/voiceflow-gallagan/VF-ElevenLabs.git
   ```

2. Change to the project directory:

   ```
   cd VF-ElevenLabs
   ```

3. Install the required dependencies:

   ```
   npm install
   ```

4. Replace `your_api_key_here` in the `.env.template` file with your Eleven Labs API key.

   ```
   ELEVENLABS_API_KEY=your_api_key_here
   PORT=3000
   ```

5. Rename the `.env.template` file to `.env`.


## Running the App

Run the following command in the project directory:

```
npm start
```

The server will start listening on the specified port (default is 3000). You can now make a POST request to the `/synthesize` endpoint with the text and voice settings as input.

## API Endpoint

**POST** `/synthesize`

**Request Body:**

- text(required): The text to synthesize.
- voice (optional): The voice to use for synthesis. Default is '21m00Tcm4TlvDq8ikWAM'.
- voice_settings (optional): An object containing additional voice settings.
  - stability (default: 0)
  - similarity_boost (default: 0)

**Response:**

Returns an object containing the synthesized audio in a data URI format.

```json
{
  "audioDataURI": "data:audio/mpeg;base64,..."
}
```

## Example Request

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "voice": "21m00Tcm4TlvDq8ikWAM", "voice_settings": {"stability": 0, "similarity_boost": 0}}' \
  http://localhost:3000/synthesize
```

## Example Response

```json
{
  "audioDataURI": "data:audio/mpeg;base64,//uQZAAAAAAAAAAAAAAAAAAAAA"
}
```
