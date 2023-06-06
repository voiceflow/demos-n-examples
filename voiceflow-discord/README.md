# Voiceflow Discord

### Use Voiceflow Dialog Manager API to run a Discord Bot

# Prerequisite

- [Replit](https://www.replit.com/) account
- [Discord App](https://discord.com/developers/applications)
- [Voiceflow](https://www.voiceflow.com/) **Chat Assistant** project

# Setup

![discord-logo.jpg](images/discord-logo.jpg)

### Create your Discord App

Go to to [https://discord.com/developers/applications](https://discord.com/developers/applications) to create your Discord app

![CleanShot 2023-05-25 at 13.12.22.png](images/CleanShot_2023-05-25_at_13.12.22.png)

Name your application and click “**Create**”

![CleanShot 2023-05-25 at 13.12.46.png](images/CleanShot_2023-05-25_at_13.12.46.png)

From the General Information tab, copy the **APPLICATION ID** and **save it for later**

![CleanShot 2023-05-25 at 13.20.54.png](images/CleanShot_2023-05-25_at_13.20.54.png)

On the Bot tab, generate a Token by clicking on **Reset Token** button

![CleanShot 2023-05-25 at 13.21.58.png](images/CleanShot_2023-05-25_at_13.21.58.png)

Copy the newly created token and **save it for later**

![CleanShot 2023-05-25 at 13.23.44.png](images/CleanShot_2023-05-25_at_13.23.44.png)

Scroll down and toggle **PRESENCE INTENT**, **SERVER MEMBERS INTENT** and **MESSAGE CONTENT INTENT**. Do not forget to save your changes.

![CleanShot 2023-05-25 at 13.24.20.png](images/CleanShot_2023-05-25_at_13.24.20.png)

Now, on the OAuth2 tab, select bot for the **SCOPES** and give the **BOT PERMISSIONS** you need.

Once it’s done, click the **Copy** button at the bottom of the page.

![CleanShot 2023-05-25 at 13.28.23.png](images/CleanShot_2023-05-25_at_13.28.23.png)



Open this link in a new tab and add the bot to **your Discord server**

![CleanShot 2023-05-25 at 13.30.13.png](images/CleanShot_2023-05-25_at_13.30.13.png)

![CleanShot 2023-05-25 at 13.33.26.png](images/CleanShot_2023-05-25_at_13.33.26.png)

![CleanShot 2023-05-25 at 13.34.21.png](images/CleanShot_2023-05-25_at_13.34.21.png)

On your Discord server you should now see the bot in the Users tab and a new message

![CleanShot 2023-05-25 at 13.34.53.png](images/CleanShot_2023-05-25_at_13.34.53.png)

![CleanShot 2023-05-25 at 13.45.32.png](images/CleanShot_2023-05-25_at_13.45.32.png)

If you haven’t activated the Developer Mode already, do it by going to the settings: **APP SETTINGS** > **Advanced**

![CleanShot 2023-05-25 at 13.39.25.png](images/CleanShot_2023-05-25_at_13.39.25.png)

**Right click** on your server icon in the left sidebar, click on **Copy Server ID** and **save it for later**.

![CleanShot 2023-05-25 at 13.41.28.png](images/CleanShot_2023-05-25_at_13.41.28.png)

> You should now have:
an <mark>app key</mark>
a <mark>bot token</mark>
a <mark>server id</mark>
>

![200x200.png](images/200x200.png)

### Get your project Dialog API key

Go to **Voiceflow Creator** and open the Chat Assistant project you want to use.
Click on **Integration** from the left sidebar (or press the 6 key)


![voiceflow-integration.png](images/voiceflow-integration.png)

Select the **Dialog API** integration, click **Copy API Key** to copy your Voiceflow Dialog API Key and **save it for later**


![voiceflow-copy.png](images/voiceflow-copy.png)

![logotype.webp](images/logotype.webp)

[Fork on Replit](https://replit.com/@niko-voiceflow/voiceflow-discord?v=1)

### Setup the Replit secrets

Set new Secrets with the following info


**DISCORD_TOKEN**
Discord bot token

**APP_ID**
Discord App ID

**SERVER_ID**
Discord server ID

**VOICEFLOW_API_URL**
Voiceflow Dialog API endpoint (default to general runtime)

**VOICEFLOW_API_KEY**
Voiceflow project API key (from the Integration section)

**VOICEFLOW_VERSION_ID**
Voiceflow project version ID (only for transcripts, default to 'production')

**VOICEFLOW_PROJECT_ID**
Voiceflow project ID (only for transcripts, default to null)

On the **Secrets tab**, you can click the **Edit as JSON** button and paste the following JSON (do not forget to update the keys values):

![CleanShot 2023-05-25 at 14.32.30.png](images/CleanShot_2023-05-25_at_14.32.30.png)

```
{
  "DISCORD_TOKEN": "XXX",
  "APP_ID": "XXX",
  "SERVER_ID": "XXX",
  "VOICEFLOW_API_URL": "https://general-runtime.voiceflow.com",
  "VOICEFLOW_API_KEY": "VF.DM.XXX",
  "VOICEFLOW_VERSION_ID": "XXX",
  "VOICEFLOW_PROJECT_ID": "XXX"
}

```

### Run your app on Replit

Once forked and updated with the Secrets, run your app and check the Console


![CleanShot 2023-05-25 at 14.21.43.png](images/CleanShot_2023-05-25_at_14.21.43.png)

![CleanShot 2023-05-25 at 14.21.16.png](images/CleanShot_2023-05-25_at_14.21.16.png)

## Video

If you are a bit curious and want to dive in the code, we’ve made a video to go over the Node JS app and the different ways to interact with the Discord bot.

[https://www.loom.com/share/58af327708104dfaaec6ffb11d62b271](https://www.loom.com/share/58af327708104dfaaec6ffb11d62b271)
