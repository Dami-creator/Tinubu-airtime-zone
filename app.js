const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Your bank info
const BANK_NAME = "Kuda MFB";
const ACCOUNT_NAME = "Damilola Fadiora";
const ACCOUNT_NUMBER = "2035470845";

// Telegram info
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_CONTACT = "t.me/TyburnUK";

// Store recent recharge requests in memory
let recentRequests = [];

// Homepage - recharge form with animations
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Tinubu Airtime Zone</title>
        <style>
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }

          body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #e0f7fa 0%, #80deea 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            animation: fadeIn 1s ease-in-out;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
            text-align: center;
            animation: fadeIn 1s ease-in-out;
          }
          h1 { color: #00796b; font-size: 28px; margin-bottom: 20px; }
          input, button { width: 100%; padding: 12px; margin: 10px 0; border-radius: 6px; border: 1px solid #ccc; font-size: 16px; transition: all 0.3s ease; }
          input:focus { border-color: #4caf50; box-shadow: 0 0 10px rgba(76,175,80,0.3); }
          button { background-color: #4caf50; color: white; border: none; cursor: pointer; }
          button:hover { background-color: #388e3c; transform: scale(1.03); }

          .recent-requests {
            margin-top: 30px;
            text-align: left;
          }
          .request {
            background-color: #f1f1f1;
            padding: 10px 15px;
            border-radius: 6px;
            margin-bottom: 10px;
            animation: fadeIn 0.8s ease-in-out;
          }
          .request span { font-weight: bold; color: #00796b; }
          a.contact { color: #00796b; text-decoration: none; }
          a.contact:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Tinubu Airtime Zone</h1>
          <p>Enter your phone number and amount to get your airtime. You will see bank details to deposit.</p>
          <form method="POST" action="/deposit">
            <input type="text" name="phone" placeholder="Phone Number" required pattern="\\d{10,15}">
            <input type="number" name="amount" placeholder="Amount in NGN" required min="50">
            <button type="submit">Get Bank Details</button>
          </form>

          <div class="recent-requests">
            <h3>Recent Recharge Requests:</h3>
            ${recentRequests.map(r => `
              <div class="request">
                <span>Phone:</span> ${r.phone} | <span>Amount:</span> ₦${r.amount}
              </div>
            `).join("") || "<p>No requests yet.</p>"}
          </div>

          <p>Notify us after deposit via <a class="contact" href="${TELEGRAM_CONTACT}" target="_blank">${TELEGRAM_CONTACT}</a> to receive your airtime manually.</p>
        </div>
      </body>
    </html>
  `);
});

// Deposit route - save request & send Telegram notification
app.post("/deposit", async (req, res) => {
  const { phone, amount } = req.body;

  // Save request in memory
  recentRequests.unshift({ phone, amount });
  if (recentRequests.length > 10) recentRequests.pop(); // Keep last 10 requests

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
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px);}
            to { opacity: 1; transform: translateY(0);}
          }
          body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            animation: fadeIn 1s ease-in-out;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            max-width: 450px;
            width: 100%;
            text-align: center;
            animation: fadeIn 1s ease-in-out;
          }
          ul { text-align: left; padding-left: 20px; }
          li { margin-bottom: 8px; font-size: 16px; }
          a { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #4caf50; color: white; text-decoration: none; border-radius: 6px; transition: all 0.3s ease; }
          a:hover { background-color: #388e3c; transform: scale(1.05);}
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
          <p>After sending, notify us via Telegram: <a href="${TELEGRAM_CONTACT}" target="_blank">${TELEGRAM_CONTACT}</a> to receive your airtime manually.</p>
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
