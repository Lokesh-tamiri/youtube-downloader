import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import util from "util";

const execPromise = util.promisify(exec);
// Set your absolute paths for yt-dlp and ffmpeg (adjust as necessary for your environment)
const ytDlpPath = "/opt/homebrew/bin/yt-dlp"; // macOS example
const ffmpegPath = "/opt/homebrew/bin/ffmpeg";  // Ensure ffmpeg is installed

interface DownloadRequest {
  url: string;
}

export async function POST(req: Request) {
  try {
    const { url }: DownloadRequest = await req.json();
    if (!url) {
      console.error("❌ Error: No URL provided");
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    // Ensure the downloads directory exists
    const outputDir = path.resolve(process.cwd(), "public/downloads");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const finalOutput = path.join(outputDir, `final-${Date.now()}.mp4`);

    // Check if the URL is a YouTube Short
    if (url.includes("shorts")) {
      console.log("🚀 Detected YouTube Short - downloading as a combined file...");
      // Download the combined stream for YouTube Shorts
      await execPromise(`${ytDlpPath} -f best -o "${finalOutput}" "${url}"`);
      console.log("✅ YouTube Short downloaded!");
    } else {
      // For standard YouTube videos, download video and audio separately.
      const videoOutput = path.join(outputDir, `video-${Date.now()}.mp4`);
      const audioOutput = path.join(outputDir, `audio-${Date.now()}.m4a`);

      console.log("🚀 Downloading best video (without audio)...");
      await execPromise(`${ytDlpPath} -f "bestvideo" -o "${videoOutput}" "${url}"`);
      console.log("✅ Video downloaded!");

      console.log("🚀 Downloading best audio...");
      await execPromise(`${ytDlpPath} -f "bestaudio" -o "${audioOutput}" "${url}"`);
      console.log("✅ Audio downloaded!");

      console.log("🎬 Merging video and audio...");
      await execPromise(`${ffmpegPath} -i "${videoOutput}" -i "${audioOutput}" -c:v copy -c:a aac "${finalOutput}"`);
      console.log("✅ Merging complete!");

      // Clean up temporary files
      fs.unlinkSync(videoOutput);
      fs.unlinkSync(audioOutput);
    }

    return NextResponse.json({
      message: "Download complete!",
      file: `/downloads/${path.basename(finalOutput)}`
    });
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}