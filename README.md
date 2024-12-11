![Rinzu Logo](./resources/RinzuBannerDark.png#gh-dark-mode-only)
![Rinzu Logo](./resources/RinzuBannerWhite.png#gh-light-mode-only)

# Rinzu (リンク)

Rinzu is a easy-to-use WhatsApp bot designed to monitor chats for TikTok links. When it detects a TikTok URL, it automatically downloads the associated video and sends it back to the chat.

Possible Thanks to:

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [cobalt.tools](https://github.com/imputnet/cobalt)

## Deployment

### docker-compose:

```yml
services:
  cobalt-api: # application used for tiktok video downloading
    image: ghcr.io/imputnet/cobalt:10

    init: true
    read_only: true
    restart: unless-stopped
    container_name: cobalt-api
    volumes:
      - ./docker/keys.json:/keys.json:ro # storage for api authentication keys

    ports:
      - "9000:9000"
    networks:
      - rinzu

    environment:
      API_URL: "http://cobalt-api:9000"
      API_KEY_URL: "file:///keys.json"
      API_AUTH_REQUIRED: 1

  rinzu: # application used for listening to whatsapp messages
    image: dustdevdm/rinzu:latest
    container_name: rinzu
    env_file:
      - ./docker/.env
    networks:
      - rinzu
    volumes:
      - ./docker/sessionData:/app/sessionData # used to keep the whatsapp login stored

networks:
  rinzu:
```

### [keys.json](https://github.com/imputnet/cobalt/blob/main/docs/run-an-instance.md#api-key-file-format)

```json
{
  "<insert your uuid here>": {
    "limit": "unlimited"
  }
}
```

### .env

```
CHROME_EXE="/usr/bin/google-chrome-stable"
COBALT_API="http://cobalt-api:9000"
COBALT_API_KEY="<insert your uuid here>"
```
