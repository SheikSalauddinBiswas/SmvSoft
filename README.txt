SMV Item Picker

Folder layout
  index.html      -> the website (replace freely when updating)
  server.js       -> tiny Node server (replace freely when updating)
  data/data.json  -> ALL your saved data (never overwrite this when updating)
  data/data.json.bak -> automatic copy of the previous save

Run
  node server.js          (open http://localhost:3000)
  PORT=8080 node server.js   (custom port)

Update
  Replace only index.html and server.js. Keep the data folder as it is.

No Node hosting? You can upload index.html alone to any static host.
It then falls back to browser storage (data stays in that browser only).

Note: there is no login. Anyone who can open the site can edit the data.
Put it behind a password (nginx basic auth, Cloudflare Access, etc.) if it is public.
