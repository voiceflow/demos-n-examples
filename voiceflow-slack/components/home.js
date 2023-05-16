export const show = async (client, event) => {
  let i = await client.users.info({
    user: event.user,
  });

  let userName = i.user.profile.real_name_normalized;
  let userPix = i.user.profile.image_192;
  let title = i.user.profile.title;

  try {
    // Call views.publish with the built-in client
    await client.views.publish({
      // Use the user ID associated with the event
      user_id: event.user,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        type: 'home',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Hey <@${event.user}>! :wave:\n\n`
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${userName}*\n${title}\n`,
            },
            accessory: {
              type: 'image',
              image_url: `${userPix}`,
              alt_text: 'User Avatar',
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
};
