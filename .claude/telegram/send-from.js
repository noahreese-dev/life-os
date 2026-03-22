/**
 * Send email from any Gmail account using App Password
 *
 * Usage:
 *   node send-from.js --from teknological@gmail.com --to recipient@email.com --subject "Subject" --body "Body text"
 *   node send-from.js --from teknological@gmail.com --to recipient@email.com --subject "Subject" --body-file /path/to/body.txt
 *
 * Setup:
 *   1. Enable 2FA on the Gmail account
 *   2. Generate App Password: Google Account → Security → App Passwords
 *   3. Add to .env: TEKNOLOGICAL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 *
 * This is a standalone sender — no gws CLI needed, no OAuth.
 * Works for any Gmail account with an App Password.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load .env from this directory
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim();
  });
}

// App passwords for each account
const ACCOUNTS = {
  'teknological@gmail.com': {
    pass: process.env.TEKNOLOGICAL_APP_PASSWORD,
    name: 'Noah Reese'
  }
  // Add more accounts here as needed:
  // 'outreach@imhamilton.ca': { pass: process.env.IMHAMILTON_APP_PASSWORD, name: 'Noah — Intelligence Masters' }
};

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--from': flags.from = args[++i]; break;
      case '--to': flags.to = args[++i]; break;
      case '--subject': flags.subject = args[++i]; break;
      case '--body': flags.body = args[++i]; break;
      case '--body-file': flags.bodyFile = args[++i]; break;
    }
  }
  return flags;
}

async function main() {
  const flags = parseArgs();

  if (!flags.from || !flags.to || !flags.subject || (!flags.body && !flags.bodyFile)) {
    console.error('Usage: node send-from.js --from EMAIL --to EMAIL --subject "Subject" --body "Body"');
    console.error('   or: node send-from.js --from EMAIL --to EMAIL --subject "Subject" --body-file path.txt');
    process.exit(1);
  }

  const account = ACCOUNTS[flags.from];
  if (!account) {
    console.error(`Unknown account: ${flags.from}`);
    console.error(`Available: ${Object.keys(ACCOUNTS).join(', ')}`);
    process.exit(1);
  }

  if (!account.pass) {
    console.error(`No app password set for ${flags.from}`);
    console.error(`Add ${flags.from.split('@')[0].toUpperCase()}_APP_PASSWORD=xxxx to .env`);
    process.exit(1);
  }

  const body = flags.bodyFile
    ? fs.readFileSync(flags.bodyFile, 'utf-8')
    : flags.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: flags.from,
      pass: account.pass
    }
  });

  const info = await transporter.sendMail({
    from: `"${account.name}" <${flags.from}>`,
    to: flags.to,
    subject: flags.subject,
    text: body
  });

  console.log(`Sent: ${info.messageId}`);
}

main().catch(err => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
