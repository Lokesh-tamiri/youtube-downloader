"use client";
import { useState, ChangeEvent } from "react";
import axios from "axios";

interface ApiResponse {
  message?: string;
  file?: string;
  error?: string;
}

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadLink, setDownloadLink] = useState<string>("");

  const handleDownload = async () => {
    if (!url.trim()) {
      alert("Please enter a YouTube URL");
      return;
    }

    setIsDownloading(true);
    setDownloadLink(""); // Reset previous download link

    try {
      const response = await axios.post<ApiResponse>("/api/download", { url });

      if (response.data.file) {
        setDownloadLink(response.data.file);
      } else {
        alert(response.data.error || "Failed to download the video.");
      }
    } catch (error) {
      console.error("Error downloading video:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">YouTube Video Downloader</h1>
      <input
        type="text"
        className="w-96 p-2 border border-gray-300 rounded text-black"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
      />
      <button
        onClick={handleDownload}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 rounded disabled:bg-gray-500"
        disabled={isDownloading}
      >
        {isDownloading ? "Downloading..." : "Download Highest Quality"}
      </button>
      {downloadLink && (
        <a
          href={downloadLink}
          className="text-green-400 mt-4 underline"
          download
        >
          ✅ Click here to download your video
        </a>
      )}
    </div>
  );
}