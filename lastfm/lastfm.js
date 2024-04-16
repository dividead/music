const http = require("http");
const fs = require("fs/promises");
const querystring = require("querystring");

const USER = process.env.LAST_FM_USER;
const LAST_FM_API_KEY = process.env.LAST_FM_API_KEY;

function makeGetRequest(url, queryParams) {
  return new Promise((resolve, reject) => {
    const queryString = querystring.stringify(queryParams);
    const requestUrl = url + "?" + queryString;

    http
      .get(requestUrl, (response) => {
        let data = "";

        // A chunk of data has been received.
        response.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received.
        response.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

const getlovedtracks = async () => {
  const url = "http://ws.audioscrobbler.com/2.0/";
  const q = {
    method: "user.getlovedtracks",
    user: USER,
    api_key: LAST_FM_API_KEY,
    format: "json",
  };

  for (let page = 1; page <= 6; page++) {
    const resp = await makeGetRequest(url, { ...q, page });
    await fs.writeFile(`lastfm_likes_page_${page}.json`, resp);
  }
};

// getlovedtracks().catch(console.error);

const getTopArtists = async () => {
  const url = "http://ws.audioscrobbler.com/2.0/";
  const q = {
    method: "user.getTopArtists",
    user: USER,
    api_key: LAST_FM_API_KEY,
    format: "json",
  };

  for (let page = 1; page <= 40; page++) {
    const resp = await makeGetRequest(url, { ...q, page });
    await fs.writeFile(`lastfm_artists_page_${page}.json`, resp);
  }
};

// getTopArtists().catch(console.error);

const parseArtists = async () => {
  const artists = new Set();
  for (let page = 1; page <= 40; page++) {
    const file = await fs.readFile(
      `raw/lastfm_artists_page_${page}.json`,
      "utf8"
    );
    const data = JSON.parse(file);
    const list = data.topartists.artist;
    list.forEach((a) => artists.add(a.name));
  }

  fs.writeFile(
    "lastfm.json",
    JSON.stringify(Array.from(artists.values()), null, 2)
  );
};

// parseArtists().catch(console.error);

const parseLikes = async () => {
  const likes = [];
  for (let page = 1; page <= 6; page++) {
    const file = await fs.readFile(
      `raw/lastfm_likes_page_${page}.json`,
      "utf8"
    );
    const data = JSON.parse(file);
    const list = data.lovedtracks.track;

    list.forEach((t) =>
      likes.push({
        title: t.name,
        albums: [],
        artists: [t.artist.name],
      })
    );
  }

  fs.writeFile("lastfm_likes.json", JSON.stringify(likes, null, 2));
};

// parseLikes().catch(console.error);
