import { writeFile } from "fs/promises";

import data from "./YourLibrary.json" assert { type: "json" };

const { tracks, albums, artists } = data;

// console.log(data);

// await writeFile("spotify.json", JSON.stringify(artists.map((a) => a.name)));

await writeFile(
  "spotify_likes.json",
  JSON.stringify(
    tracks.map((t) => ({
      title: t.track,
      albums: [t.album],
      artists: [t.artist],
    }))
  )
);
