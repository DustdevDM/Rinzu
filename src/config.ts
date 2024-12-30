import fs from "fs";
import path from "path";

interface Config {
  chromeExe: string;
  cobaltApi: string;
  cobaltApiKey: string;
}

const configPath = path.resolve(__dirname, "config.json");
const rawConfig = fs.readFileSync(configPath, "utf-8");
const config: Config = JSON.parse(rawConfig);

export default config;
