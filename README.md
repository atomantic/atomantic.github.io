# atomantic.github.io

Adam Eivy's portfolio of music videos and short films, live at https://adameivy.com.

It is a static site with no build step: `index.html` (work), `statement.html` (artist
statement and bio), `assets/site.css`, `assets/site.js` and the catalog in `data/videos.json`.
The home page opens on the work: a player with the selected project's details and a strip
of every project, all in the first screen, then an index of everything released.

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
- `type` is `music-video` or `short-film`. Each type is numbered by release (oldest is No. 01)
  and gets its own group in the index; short films show "in production" until the first one
  is added.
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

## Deploy

GitHub Pages serves the `public` branch. The `Deploy to GitHub Pages` workflow copies `dev`
onto `public` on every push to `dev`, so merging a pull request into `dev` publishes it. You can
also run the workflow by hand from the Actions tab.

## Classic portfolio

The previous Reveal.js portfolio is kept as a static page at `classic.html`, which still loads
its sections from `slides/`. The Grunt build that generated it has been removed.
