const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const qrCode = require("qrcode-terminal");
const axios = require("axios");

require("dotenv").config();

const client = new Client({
  puppeteer: {
    executablePath: process.env.CHROME_EXE,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth({
    dataPath: "sessionData",
  }),
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  qrCode.generate(qr, { small: true }, (qrCode) => {
    console.log("QR RECEIVED\n", qrCode);
  });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (msg) => {
  console.log(msg.body);
  const tikTokRegex = /https?:\/\/(?:www\.)?vm\.tiktok\.com\/[^\s]+/gi;
  const matches = msg.body.match(tikTokRegex);
  if (matches) {
    for (const match of matches) {
      try {
        let videoProcessData = await processVideo(match);
        console.log(videoProcessData);
        let videoDownloadMedia = await downloadVideo(
          videoProcessData.url,
          videoProcessData.filename
        );
        await msg.reply(videoDownloadMedia);
      } catch (error) {
        console.log(error);
      }
    }
  }
});

async function processVideo(url) {
  const response = await axios.post(
    process.env.COBALT_API,
    { url: url },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Api-Key ${process.env.COBALT_API_KEY}`,
      },
    }
  );

  const result = {
    status: response.data.status,
    url: response.data.url,
    filename: response.data.filename,
  };
  return result;
}

async function downloadVideo(url, filename) {
  return await MessageMedia.fromUrl(url, {
    unsafeMime: true,
    filename: filename,
  });
}

client.initialize();
