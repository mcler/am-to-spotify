# Apple Music &#x2194; Spotify

## Features
- Import from both services to in-browser library
- Export imported library to both services
- Persistent library in browser

### Apple Music
- Using official library [`MusicKit`](https://developer.apple.com/musickit/)
- You will need developer account and JWT key that can be created using script:
```bash
npm run create-token <path to key> "<key id>" "team id"
yarn run create-token <path to key> "<key id>" "team id"
```

### Spotify
- Using [`spotify-web-api-js`](https://github.com/JMPerez/spotify-web-api-js). Check out [docs](https://doxdox.org/jmperez/spotify-web-api-js).
