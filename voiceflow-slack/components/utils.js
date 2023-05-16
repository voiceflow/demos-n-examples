const emojiRegex = /:[^:\s]*(?:::[^:\s]*)*:/g
export const stripEmojis = (text) => text.replace(emojiRegex, '').trim()

const backslashRegex = /\\n|\\r/g
export function stripBackSlashs(text) {
  text = text.replace(/&quot;/g, '"')
  text = text.replace(backslashRegex, '\n')
  return text
}

const cleanRegex = /\t/g
export const cleanText = (text) => text.replace(cleanRegex, '').trim()

export const CHIP_ACTION_REGEX = new RegExp(/chip:(.+):(.+)/i)
export const ANY_WORD_REGEX = new RegExp(/(.+)/i)

export function cleanEmail(text) {
  let email = text.match(/([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
  let result = text
  if (email) {
    email = email[0]
    result = text.split('<')[0]
    result = result + email + text.split('>')[1]
  }
  return result
}

export function createSession() {
  // Random Number Generator
  var randomNo = Math.floor(Math.random() * 1000 + 1);
  // get Timestamp
  var timestamp = Date.now();
  // get Day
  var date = new Date();
  var weekday = new Array(7);
  weekday[0] = 'Sunday';
  weekday[1] = 'Monday';
  weekday[2] = 'Tuesday';
  weekday[3] = 'Wednesday';
  weekday[4] = 'Thursday';
  weekday[5] = 'Friday';
  weekday[6] = 'Saturday';
  var day = weekday[date.getDay()];
  // Join random number+day+timestamp
  var session_id = randomNo + day + timestamp;
  return session_id;
}
