# atomantic.github.io

Adam Eivy's portfolio of music videos and short films, live at https://adameivy.com.

It is a static site with no build step: `index.html`, `assets/site.css`, `assets/site.js`
and the catalog in `data/videos.json`.

## Add a video or film

Open `data/videos.json`, copy an entry to the top of `videos`, and fill it in:

```json
{
  "slug": "dream-tape",
  "type": "music-video",
  "title": "Dream Tape",
  "year": 2026,
  "description": "One or two sentences.",
  "youtube": "l4O27yxXgek",
  "featured": true,
  "links": {
    "youtube": "https://youtu.be/l4O27yxXgek",
    "x": "https://x.com/antic/status/...",
    "spotify": "https://open.spotify.com/track/...",
    "appleMusic": "https://music.apple.com/...",
    "suno": "https://suno.com/song/...",
    "other": [{ "label": "Behind the scenes", "url": "https://..." }]
  }
}
```

- Order in the file is the order on the page, so put the newest first.
- `type` is `music-video` or `short-film`. Short films get their own section, which shows a
  "coming soon" panel until the first one is added.
- `youtube` is the video id and drives both the inline player and the thumbnail. For a
  self-hosted file use `video` (an .mp4 URL) plus `poster` instead.
- `featured: true` puts that entry in the hero. Without it, the first entry is used.
- Optional: `artist`, `runtime`, `credits`, `poster`. Supported `links` keys: `youtube`, `x`,
  `spotify`, `appleMusic`, `suno`, `bandcamp`, `soundcloud`, `tiktok`, `instagram`, `vimeo`.
- `channel` at the top of the file sets where every Subscribe and Follow button points.

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000 (the catalog is loaded with `fetch`, so opening the file
directly won't work).

## Classic portfolio

The previous Reveal.js portfolio is at `classic.html`; its sources (`templates/`, `slides/`,
`Gruntfile.js`) are unchanged.
