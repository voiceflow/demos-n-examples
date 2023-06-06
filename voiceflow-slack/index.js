/* eslint-disable no-await-in-loop */
import slack_pkg from '@slack/bolt'
const { App } = slack_pkg
import { createSession, cleanEmail, stripEmojis, stripBackSlashs, cleanText, CHIP_ACTION_REGEX, ANY_WORD_REGEX } from './components/utils.js'
import * as Home from './components/home.js'
import axios from 'axios'
import { Text } from 'slate'
import escapeHtml from 'escape-html'

const versionID = process.env.VOICEFLOW_VERSION_ID || 'production'
const projectID = process.env.VOICEFLOW_PROJECT_ID || null
let session = `${versionID}.${createSession()}`
const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY
const VOICEFLOW_RUNTIME_ENDPOINT = process.env.VOICEFLOW_RUNTIME_ENDPOINT || 'general-runtime.voiceflow.com'
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET

let noreply
let isError = false;
let errorMessage = '';

// Create the Slack app
const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
})

// Slack app_mention event
app.event('app_mention', async ({ event, client, say }) => {
  try {

    let i = await client.users.info({
      user: event.user,
    })

    let userName = i.user.profile.real_name_normalized

    await say(`Hi ${userName}`)
    let utterance = event.text.split('>')[1]
    utterance = stripEmojis(utterance)
    utterance = cleanEmail(utterance)
    if (utterance === 'hi' || utterance === 'hi there') {
      await interact(event.user, say, client, {
        type: 'launch',
      })
    } else {
      await interact(event.user, say, client, {
        type: 'text',
        payload: utterance,
      })
    }
  } catch (error) {
    console.error(error)
  }
})

// Listen for users opening your App Home
app.event('app_home_opened', async ({ event, client }) => {
  Home.show(client, event)
})

app.action(CHIP_ACTION_REGEX, async ({ action, say, ack, client }) => {
  ack()
  if (action.type !== 'button') return
  // get the user id from the action id
  let userID = action.action_id.split(':')[2]
  let path = action.action_id.split(':')[1]
  await client.users.info({
    user: userID,
  })

  if (path.includes('path-')) {
    await interact(userID, say, client, {
      type: path,
      payload: {
        label: action.value,
      },
    })
  } else {
    await interact(userID, say, client, {
      type: 'intent',
      payload: {
        query: action.value,
        label: action.value,
        intent: {
          name: path,
        },
        entities: [],
      },
    })
  }
})

app.message(ANY_WORD_REGEX, async ({ message, say, client }) => {
  // Ignoring some message types
  if (
    message.subtype === 'message_changed' ||
    message.subtype === 'message_deleted' ||
    message.subtype === 'message_replied'
  )
    return

  // Cleaning user's utterance from Slack
  let utterance = stripEmojis(message.text)
  // Formating Slack email format from <mailto:name@email.com|name@email.com> to name@email.com
  utterance = cleanEmail(utterance)

  console.log('Utterance:', utterance)

  if (utterance === 'hi' || utterance === 'hi there') {
    await interact(message.user, say, client, {
      type: 'launch',
    })
  } else {
    await interact(message.user, say, client, {
      type: 'text',
      payload: utterance,
    })
  }
})
  ; (async () => {
    // Start the app
    await app.start()
    console.log(`⚡️ Bolt app is running!`)
  })()

// Interact with Voiceflow | Dialog Manager API
async function interact(userID, say, client, request) {
  clearTimeout(noreply);
  let i = await client.users.info({
    user: userID,
  })
  let userName = i.user.profile.real_name_normalized
  let userPix = i.user.profile.image_48

  // call the Voiceflow API with the user's name & request, get back a response
  try {
    const response = await axios({
      method: 'POST',
      url: `https://${VOICEFLOW_RUNTIME_ENDPOINT}/state/${versionID}/user/${userID}/interact`,
      headers: { Authorization: VOICEFLOW_API_KEY, 'Content-Type': 'application/json', sessionid: session },
      data: {
        request,
        config: {
          tts: false,
          stripSSML: true,
        },
      },
      endpoint: VOICEFLOW_RUNTIME_ENDPOINT,
    })
    if (response.data) {
      for (const trace of response.data) {
        switch (trace.type) {
          case 'text': {
            if (trace.payload.message.includes('"blocks":')) {
              let tmpBlock = trace.payload.message;
              tmpBlock = tmpBlock.replace(/&quot;/g, '\\"');
              await say(JSON.parse(tmpBlock));
            } else {
              const serialize = (node) => {
                if (Text.isText(node)) {
                  let string = node.text;
                  let tags = '';
                  if (node.fontWeight) {
                    tags = '*';
                  }
                  if (node.italic) {
                    tags = tags + '_';
                  }
                  if (node.underline) {
                    // ignoring underline tag as Slack doesn't support it
                    // https://api.slack.com/reference/surfaces/formatting
                  }
                  if (node.strikeThrough) {
                    tags = tags + '~';
                  }
                  return `${tags}${string}${tags.split('').reverse().join('')}`;
                }

                const children = node.children.map((n) => serialize(n)).join('');

                switch (node.type) {
                  case 'link':
                    return `<${escapeHtml(node.url)}|${children}>`;
                  default:
                    return children;
                }
              };

              // Render slate content
              let renderedMessage = trace.payload.slate.content
                .map((slateData) => slateData.children.map((slateChild) => serialize(slateChild)).join(''))
                .join('\n');

              try {
                await say({
                  text: 'Voiceflow Bot',
                  blocks: [
                    {
                      type: 'section',
                      text: {
                        type: 'mrkdwn',
                        text: cleanText(stripBackSlashs(renderedMessage)),
                      },
                    },
                  ],
                });
              } catch (error) {
                // Avoid breaking the Bot by ignoring then content if not supported
                console.log('Not supported yet');
                return false;
              }
            }
            break;
          }
          case 'speak': {
            if (trace.payload.message.includes('"blocks":')) {
              await say(JSON.parse(trace.payload.message));
            } else {
              await say({
                text: 'Voiceflow Bot',
                blocks: [{ type: 'section', text: { type: 'mrkdwn', text: stripBackSlashs(trace.payload.message) } }],
              });
            }
            break;
          }
          case 'visual': {
            if (trace.payload.visualType === 'image') {
              try {
                await say({
                  text: 'Voiceflow Bot',
                  blocks: [
                    {
                      type: 'image',
                      image_url: trace.payload.image,
                      alt_text: 'image',
                    },
                  ],
                });
              } catch (error) {
                // Avoid breaking the Bot by ignoring then content if not supported
                console.log('Not supported yet');
                return false;
              }
            }
            break;
          }
          case 'choice': {
            const buttons = trace.payload.buttons;
            if (buttons.length) {
              let url = null;
              let btId;
              let filteredButtons = buttons
                .filter((buttons) => buttons.name != 'null' && buttons.name != null)
                .map(({ name, request }) => {
                  // Handle URL action
                  if (Object.keys(request.payload).includes('actions')) {
                    console.log(request.payload);
                    if (request.payload?.actions?.length > 0) {
                      if (Object.values(request.payload.actions[0]).includes('open_url')) {
                        url = escapeHtml(request.payload.actions[0].payload.url);
                      }
                    }
                  }
                  if (request.type == 'intent') {
                    let button = {
                      type: 'button',
                      action_id: `chip:${request.payload.intent.name}:${userID}:${Math.random().toString(6)}`,
                      text: {
                        type: 'plain_text',
                        text: name,
                        emoji: true,
                      },
                      value: name,
                      style: 'primary',
                    };
                    if (url) {
                      button.url = url;
                    }
                    return button;
                  } else {
                    let button = {
                      type: 'button',
                      action_id: `chip:${request.type}:${userID}:${Math.random().toString(6)}`,
                      text: {
                        type: 'plain_text',
                        text: name,
                        emoji: true,
                      },
                      value: name,
                      style: 'primary',
                    };
                    if (url) {
                      button.url = url;
                    }
                    return button;
                  }
                });
              await say({
                text: 'Voiceflow Bot',
                blocks: [
                  {
                    type: 'actions',
                    elements: filteredButtons,
                  },
                ],
              });
            }
            break;
          }
          case 'no-reply': {
            noreply = setTimeout(function() {
              interact(userID, say, client, {
                type: 'no-reply',
              });
            }, trace.payload.timeout * 1000);
            break;
          }
          case 'error': {
            isError = true;
            errorMessage = trace.payload || null;
            break;
          }
          case 'end': {
            // an end trace means the the Voiceflow dialog has ended
            clearTimeout(noreply)
            console.log('End Convo')
            await saveTranscript(userName, userPix)
            return false;
          }
        }
      }
    } else {
      try {
        await say({
          text: 'Voiceflow Bot',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: cleanText(stripBackSlashs('Error with DM API. Please try again a bit later')),
              },
            },
          ],
        });
      } catch (error) {
        // Avoid breaking the Bot by ignoring then content if not supported
        console.log('Error sending error');
        return false;
      }
    }
  } catch (error) {
    try {
      await say({
        text: 'Voiceflow Bot',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: cleanText(stripBackSlashs('Error. Please try again a bit later')),
            },
          },
        ],
      });
    } catch (error) {
      // Avoid breaking the Bot by ignoring then content if not supported
      return false;
    }
    return false;
  }
  return true;
}

async function saveTranscript(username, userpix) {
  if (projectID) {
    console.log('SAVE TRANSCRIPT')
    if (!username || username == '' || username == undefined) {
      username = 'Anonymous';
      userpix = 'https://avatars.slack-edge.com/2021-03-20/1879385687829_370801c602af840e43f8_192.png';
    }
    axios({
      method: 'put',
      url: 'https://api.voiceflow.com/v2/transcripts',
      data: {
        browser: 'Slack',
        device: 'desktop',
        os: 'macOS',
        sessionID: session,
        unread: true,
        versionID: versionID,
        projectID: projectID,
        notes: errorMessage == '' ? '' : errorMessage,
        reportTags: isError == true ? ['system.saved'] : [],
        user: {
          name: username,
          image: userpix,
        },
      },
      headers: {
        Authorization: VOICEFLOW_API_KEY,
      },
    })
      .then(function(response) {
        console.log('Saved!');
        isError = false;
        errorMessage = '';
        session = `${process.env.VOICEFLOW_VERSION_ID}.${createSession()}`;
      })
      .catch((err) => console.log(err));
  }
}
