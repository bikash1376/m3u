export async function GET() {
  const res = await fetch("https://iptv-org.github.io/iptv/index.m3u");
  const text = await res.text();

  const lines = text.split("\n");
  const channels = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const name = lines[i].split(",")[1];
      const url = lines[i + 1];
      channels.push({ name, url });
    }
  }

//   console.log(channels);


    return new Response(JSON.stringify(channels))
}