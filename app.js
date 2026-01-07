const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// ENV (DO NOT HARD-CODE)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin123";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory storage
const orders = {};

// Telegram helper
function notifyTelegram(text) {
  return axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text,
  });
}

// Home
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Tinubu Airtime Zone</title>
<style>
body{font-family:Arial;background:#f4f6f8}
.box{max-width:500px;margin:40px auto;background:#fff;padding:25px;border-radius:8px}
h1{color:#0a7d3b}
select,input,button{width:100%;padding:10px;margin:10px 0}
button{background:#0a7d3b;color:#fff;border:none}
.note{font-size:14px;color:#555}
</style>
</head>
<body>
<div class="box">
<h1>Tinubu Airtime Zone</h1>
<p>Manual VTU processing. Fast & reliable.</p>

<form method="POST" action="/order">
<select name="type" required>
  <option value="">Select Service</option>
  <option value="Airtime">Airtime</option>
  <option value="Data">Data Bundle</option>
</select>

<input name="phone" placeholder="Phone Number" required />

<select name="package" required>
  <option value="">Select Amount / Bundle</option>
  <option value="₦500 Airtime">₦500 Airtime</option>
  <option value="₦1000 Airtime">₦1000 Airtime</option>
  <option value="1GB Data">1GB Data</option>
  <option value="2GB Data">2GB Data</option>
  <option value="5GB Data">5GB Data</option>
</select>

<button>Proceed</button>
</form>

<p class="note">
Payment is manual.<br>
Support: <a href="https://t.me/TyburnUK">Telegram</a>
</p>
</div>
</body>
</html>
`);
});

// Create order
app.post("/order", async (req, res) => {
  const { type, phone, package: pack } = req.body;
  const id = crypto.randomUUID().slice(0, 8).toUpperCase();

  orders[id] = {
    type,
    phone,
    pack,
    status: "pending",
  };

  await notifyTelegram(
`📥 New VTU Order
ID: ${id}
Service: ${type}
Phone: ${phone}
Package: ${pack}

Mark sent:
/admin/${id}/${ADMIN_SECRET}`
  );

  res.redirect(`/wait/${id}`);
});

// Wait page
app.get("/wait/:id", (req, res) => {
  const o = orders[req.params.id];
  if (!o) return res.send("Invalid order");

  if (o.status === "sent") {
    return res.send(`
<h2>✅ Successful</h2>
<p>Your ${o.type} has been delivered.</p>
`);
  }

  res.send(`
<h2>Awaiting Confirmation</h2>
<p>Please transfer to:</p>

<b>Damilola Fadiora</b><br>
<b>Kuda MFB</b><br>
<b>2035470845</b>

<p><b>Order ID:</b> ${req.params.id}</p>
<p>Do not close this page.</p>

<script>
setInterval(()=>{
fetch("/status/${req.params.id}")
.then(r=>r.json())
.then(d=>{
 if(d.status==="sent") location.reload();
});
},4000);
</script>
`);
});

// Status
app.get("/status/:id", (req, res) => {
  const o = orders[req.params.id];
  res.json({ status: o ? o.status : "invalid" });
});

// Admin mark sent
app.get("/admin/:id/:secret", async (req, res) => {
  if (req.params.secret !== ADMIN_SECRET) return res.send("Unauthorized");
  const o = orders[req.params.id];
  if (!o) return res.send("Not found");

  o.status = "sent";
  await notifyTelegram(`✅ Order SENT\nID: ${req.params.id}`);

  res.send("Marked as sent");
});

// Start
app.listen(PORT, () => console.log("Tinubu Airtime Zone running"));
