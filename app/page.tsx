"use client"

import { useState, useEffect, useRef } from "react"

interface ChannelsList {
  name : string,
  url : string
}

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
)

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="4" x2="10" y2="20"/><line x1="14" y1="4" x2="14" y2="20"/></svg>
)

const MaximizeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
)

const VolumeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
)

export default function Home() {
  const [channels, setChannels] = useState<ChannelsList[]>([])
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [videoLoading, setVideoLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(50)
  
  // Custom Player State
  const [isPlaying, setIsPlaying] = useState(true) // Autoplay defaults
  const [progress, setProgress] = useState(0)
  const [isHoveringVideo, setIsHoveringVideo] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChannels()
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 50)
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
        if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [observerTarget, channels, searchQuery]); 

  // Reset visible count on search
  useEffect(() => {
    setVisibleCount(50)
  }, [searchQuery])

  const getChannels = async () => {
    setLoading(true)
    try {
      // const res = await fetch('http://localhost:3000/api/channels')
      const res = await fetch('https://m3u-dun.vercel.app/api/channels')
      const list = await res.json()
      setChannels(list)
    }
    catch(error) {
      console.log(error)
    }
    finally { setLoading(false); }
  }

  const handlePlay = (url: string) => {
    setVideoLoading(true)
    setCurrentVideo(url)
    setIsPlaying(true)
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return
    if (!document.fullscreenElement) {
        videoContainerRef.current.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
        const p = (videoRef.current.currentTime / videoRef.current.duration) * 100
        setProgress(isNaN(p) ? 0 : p)
    }
  }

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const displayedChannels = filteredChannels.slice(0, visibleCount)

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#ededed] overflow-hidden font-mono tracking-tight selection:bg-orange-500/30">
      {/* Header Bar */}
      <div className="h-14 border-b border-neutral-800 flex items-center px-4 bg-[#050505] z-10 shrink-0">
        <div className="flex items-center gap-2 mr-6">
          <div className="w-3 h-3 bg-orange-500"></div>
          <span className="font-bold text-lg text-neutral-200 hidden sm:block">M3U_PLAYER</span>
          <span className="font-bold text-lg text-neutral-200 sm:hidden">M3U</span>
        </div>
        
        <div className="flex-1 max-w-xl mx-auto relative group">
          <input 
            type="text" 
            placeholder="SEARCH CHANNEL..." 
            className="w-full bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 focus:border-orange-500 text-xs px-4 py-2 text-neutral-300 placeholder:text-neutral-600 focus:outline-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-600 uppercase tracking-widest pointer-events-none">
            CMD+K
          </div>
        </div>

        <div className="w-auto sm:w-32 flex justify-end pl-2">
            <div className="text-[10px] text-neutral-600 font-mono text-right whitespace-nowrap">
                {loading ? "FETCHING..." : <span className="hidden sm:inline">{filteredChannels.length} CHANNELS</span>}
                {!loading && <span className="sm:hidden">{filteredChannels.length}</span>}
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        
        {/* Sidebar Channel List */}
        <div className="order-2 md:order-1 w-full md:w-80 border-r-0 md:border-r border-t md:border-t-0 border-neutral-800 flex flex-col bg-[#080808] shrink-0 h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-2">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent animate-spin"></div>
                        <span className="text-xs text-neutral-500">LOADING DATABASE...</span>
                    </div>
                ) : filteredChannels.length === 0 ? (
                    <div className="p-8 text-center text-neutral-600 text-xs">NO CHANNELS FOUND</div>
                ) : (
                    <>
                      {displayedChannels.map((c, index) => (
                      <div 
                          key={index} 
                          onClick={() => handlePlay(c.url)}
                          className={`
                          group flex items-center px-4 py-3 cursor-pointer border-b border-neutral-900/50 
                          hover:bg-white/5 transition-all duration-200 relative
                          ${currentVideo === c.url ? 'bg-white/5' : ''}
                          `}
                      >
                          {currentVideo === c.url && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                          )}
                          <span className={`text-xs truncate transition-colors ${currentVideo === c.url ? 'text-orange-500' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                          {c.name}
                          </span>
                      </div>
                      ))}
                      {/* Infinite Scroll Trigger */}
                      {displayedChannels.length < filteredChannels.length && (
                        <div ref={observerTarget} className="h-10 flex items-center justify-center opacity-50">
                          <div className="w-3 h-3 border-2 border-neutral-700 border-t-orange-500 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </>
                )}
            </div>
            
            {/* Footer Credit */}
            <div className="p-4 border-t border-neutral-800 bg-[#050505] text-[10px] text-neutral-600 flex justify-between items-center">
                <span>v1.0.0</span>
                <a href="https://x.com/bikash1376" target="_blank" className="hover:text-orange-500 transition-colors">
                    Built by Bikash
                </a>
            </div>
        </div>

        {/* Main Video Area */}
        <div className="order-1 md:order-2 flex-1 flex flex-col bg-black relative md:h-full">
            <div className="w-full h-full flex flex-col items-center justify-start md:justify-center p-0 md:p-10">
                {currentVideo ? (
                    <div className="relative w-full flex flex-col items-center justify-center group/video">
                         <div 
                            ref={videoContainerRef}
                            className="relative w-full aspect-video md:max-w-6xl bg-neutral-900 md:border border-neutral-800 md:shadow-2xl overflow-hidden group"
                            onMouseEnter={() => setIsHoveringVideo(true)}
                            onMouseLeave={() => setIsHoveringVideo(false)}
                        >
                            {/* Buffering Overlay */}
                            {videoLoading && (
                                <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center bg-black/80 z-20 backdrop-blur-sm pointer-events-none">
                                    <div className="w-8 h-8 border-b-2 border-l-2 border-orange-500 animate-spin"></div>
                                    <div className="text-orange-500 text-xs tracking-widest animate-pulse">BUFFERING STREAM</div>
                                </div>
                            )}

                            {/* Center Play Button Overlay */}
                            {!videoLoading && !isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-orange-500/90 flex items-center justify-center text-black backdrop-blur-sm shadow-xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                                         <PlayIcon />
                                    </div>
                                </div>
                            )}

                            <video 
                                ref={videoRef}
                                src={currentVideo} 
                                className="w-full h-full object-contain bg-black cursor-pointer"
                                autoPlay
                                playsInline
                                onClick={togglePlay}
                                onLoadStart={() => setVideoLoading(true)}
                                onWaiting={() => setVideoLoading(true)}
                                onCanPlay={() => setVideoLoading(false)}
                                onPlaying={() => { setVideoLoading(false); setIsPlaying(true); }}
                                onPause={() => setIsPlaying(false)}
                                onTimeUpdate={handleTimeUpdate}
                            />

                            {/* Custom Controls Bar */}
                            <div className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/90 to-transparent flex items-end px-4 pb-4 transition-opacity duration-300 ${!isPlaying || isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="w-full flex flex-col gap-2">
                                     {/* Progress Bar */}
                                     {/* For live streams progress might not be relevant but helpful for VOD/Timeshift if supported */}
                                    <div className="w-full h-1 bg-neutral-700/50 cursor-pointer overflow-hidden group/progress">
                                        <div className="h-full bg-orange-500 relative" style={{ width: `${progress}%` }}>
                                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-white">
                                        <div className="flex items-center gap-4">
                                            <button onClick={togglePlay} className="hover:text-orange-500 transition-colors">
                                                {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                            </button>
                                            <button className="hover:text-orange-500 transition-colors">
                                                <VolumeIcon />
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold tracking-widest text-neutral-300">LIVE</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                             <button onClick={toggleFullscreen} className="hover:text-orange-500 transition-colors">
                                                <MaximizeIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Title Bar under video */}
                        <div className="w-full max-w-6xl mt-4 hidden md:flex items-center justify-between px-4 md:px-0">
                            <h2 className="text-neutral-500 text-xs tracking-widest uppercase">Now Playing</h2>
                            <div className="h-[1px] flex-1 bg-neutral-900 mx-4"></div>
                            <span className="text-orange-500 text-xs font-bold">{channels.find(c => c.url === currentVideo)?.name}</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-neutral-700 mt-10 md:mt-0 p-10 opacity-50 hover:opacity-100 transition-opacity duration-500">
                        <div className="w-24 h-24 border border-neutral-800 flex items-center justify-center mb-6 text-neutral-800 bg-neutral-900/40 rounded-full">
                           <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[24px] border-l-neutral-800 border-b-[12px] border-b-transparent ml-2"></div>
                        </div>
                        <p className="text-xs tracking-[0.3em] uppercase text-center font-bold text-neutral-600">No Signal</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  )
}