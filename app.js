const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Your Kuda account info
const BANK_NAME = "Kuda";
const ACCOUNT_NAME = "Queen Anita";
const ACCOUNT_NUMBER = "2035470845";

// Telegram info
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Homepage - recharge form
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Tinubu Airtime Zone</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            max-width: 450px;
            width: 100%;
            text-align: center;
          }
          h1 { color: #00796b; font-size: 28px; margin-bottom: 15px; }
          input, button { width: 100%; padding: 12px; margin: 10px 0; border-radius: 6px; border: 1px solid #ccc; font-size: 16px; }
          button { background-color: #4caf50; color: white; border: none; cursor: pointer; }
          button:hover { background-color: #388e3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Tinubu Airtime Zone</h1>
          <p>Enter your phone number and the amount to get your airtime. You will see our bank details to deposit.</p>
          <form method="POST" action="/deposit">
            <input type="text" name="phone" placeholder="Phone Number" required pattern="\\d{10,15}">
            <input type="number" name="amount" placeholder="Amount in NGN" required min="50">
            <button type="submit">Get Bank Details</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Deposit instructions page with Telegram notification
app.post("/deposit", async (req, res) => {
  const { phone, amount } = req.body;

  // Telegram notification
  try {
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: `💰 New recharge request!\nPhone: ${phone}\nAmount: ₦${amount}`
      });
    }
  } catch (err) {
    console.error("Telegram notification failed:", err.message);
  }

  // Show deposit instructions
  res.send(`
    <html>
      <head>
        <title>Tinubu Airtime Zone - Deposit</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            max-width: 450px;
            width: 100%;
            text-align: center;
          }
          ul { text-align: left; padding-left: 20px; }
          li { margin-bottom: 8px; font-size: 16px; }
          a { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 6px; }
          a:hover { background-color: #388e3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Tinubu Airtime Zone</h1>
          <p>Please deposit <b>₦${amount}</b> to the account below:</p>
          <ul>
            <li><b>Bank:</b> ${BANK_NAME}</li>
            <li><b>Account Name:</b> ${ACCOUNT_NAME}</li>
            <li><b>Account Number:</b> ${ACCOUNT_NUMBER}</li>
          </ul>
          <p>After sending, notify us via WhatsApp or Telegram to receive your airtime manually.</p>
          <p><b>Phone Number:</b> ${phone}</p>
          <a href="/">Go Back</a>
        </div>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Tinubu Airtime Zone running on port ${PORT}`);
});
