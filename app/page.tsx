"use client"

import { useState } from "react"

interface ChannelsList {
  name : string,
  url : string
}


export default function Home() {

  const [channels, setChannels] = useState<ChannelsList[]>([])
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getChannels = async () => {
    setLoading(true)
    try {
    const res = await fetch('https://m3u-dun.vercel.app/api/channels')
    const list = await res.json()
    setChannels(list)
    }
    catch(error) {
      console.log(error)
    }

    finally { setLoading(false); }
    
  }
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="lg:w-5/6 p-4 flex flex-col items-center">
    
    <button onClick={getChannels} disabled={loading} className={`text-center px-6 py-2 rounded-xl mt-10 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 cursor-pointer"}`} >
      {loading ? "Loading..." : "Get channels"}
    </button>

        {currentVideo && (
          <video src={currentVideo} controls className="mt-4 w-full max-w-5xl" />
        )}
      </div>
      <div className="lg:w-2/6 p-4 bg-gray-900 overflow-y-auto">
        {channels.map((c, index) => {
          return (
            <div key={index} className="flex justify-between items-center bg-neutral-800 p-2 mb-2 rounded">
              <span className="text-gray-300 truncate mr-2">{c.name}</span>
              {/* <span className="text-blue-400 truncate mr-2">{c.url}</span> */}
              <button onClick={() => setCurrentVideo(c.url)} className="bg-blue-500 px-2 py-1 rounded text-white text-sm">Play</button>
            </div>
          );
        })}
      </div>
    </div>
  )
}