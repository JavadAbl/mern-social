const formData = require("form-data");
const Mailgun = require("mailgun.js");

const sendEmail = (to, subject, html) => {
  const mailgun = new Mailgun(formData);
  const mg = mailgun.client({
    username: process.env.MAILGUN_API_ID,
    key: process.env.MAILGUN_API_KEY,
  });
  return mg.messages.create(
    "sandbox6fab633150e8496c84fc1a5b62e23996.mailgun.org",
    {
      from: "Excited User <mailgun@sandbox-123.mailgun.org>",
      to: [to],
      subject,
      // text: "Testing some Mailgun awesomeness!",
      html,
    }
  );
};

module.exports = sendEmail;
