import {
  Message,
  MessageTypes,
  MessageMedia,
  Client,
  LocalAuth,
} from "whatsapp-web.js";

const qrCode = require("qrcode-terminal");
import axios from "axios";

import config from "./config";

const client = new Client({
  puppeteer: {
    executablePath: config.chromeExe,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth({
    dataPath: "sessionData",
  }),
});

client.on("qr", (qrData: string) => {
  qrCode.generate(qrData, { small: true }, (qrCode: string) => {
    console.log("QR RECEIVED\n", qrCode);
  });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message_create", async (msg: Message) => {
  if (msg.type != MessageTypes.TEXT) return;

  const tikTokRegex: RegExp = /https?:\/\/(?:www\.)?vm\.tiktok\.com\/[^\s]+/gi;
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

type VideoProcessData = {
  status: string;
  url: string;
  filename: string;
};

async function processVideo(url: string): Promise<VideoProcessData> {
  const response = await axios.post(
    config.cobaltApi,
    { url: url },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Api-Key ${config.cobaltApiKey}`,
      },
    }
  );

  return {
    status: response.data.status,
    url: response.data.url,
    filename: response.data.filename,
  };
}

async function downloadVideo(url: string, filename: string) {
  return await MessageMedia.fromUrl(url, {
    unsafeMime: true,
    filename: filename,
  });
}

client.initialize();
