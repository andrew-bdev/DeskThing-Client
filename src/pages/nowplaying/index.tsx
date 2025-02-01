import { useRef, useState, useLayoutEffect } from 'react'
import { useMusicStore } from '@src/stores/musicStore'

export default function NowPlaying() {
  const song = useMusicStore((state) => state.song)
  const DEBUG_MODE = false // Enable debug mode for outlines
  const pause = useMusicStore((state) => state.pause)

  const textRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Maintain dynamic font size
  const [fontSize, setFontSize] = useState('16px')

  useLayoutEffect(() => {
    if (!textRef.current || !containerRef.current) return

    const containerWidth = 480 // Fixed width based on constraint
    const containerHeight = containerRef.current.offsetHeight

    // Function to compute scale dynamically
    const computeScale = () => {
      // Set large font size temporarily for accurate measurement
      textRef.current.style.fontSize = '80px'
      const rect = textRef.current.getBoundingClientRect()
      const widthScale = containerWidth / rect.width
      const heightScale = containerHeight / rect.height

      return Math.min(widthScale, heightScale)
    }

    // Initial Scale Adjustment
    const firstScale = computeScale()
    const provisionalFontSize = 79 * firstScale
    textRef.current.style.fontSize = `${provisionalFontSize}px`

    // Final Adjustment
    const finalScale = computeScale()
    const finalFontSize = Math.floor(provisionalFontSize * finalScale)

    // Clamp font size within a range
    setFontSize(`${Math.max(12, Math.min(48, finalFontSize))}px`)
  }, [song])

  return (
    <div
      ref={containerRef}
      className={`w-[800px] h-[480px] bg-black overflow-hidden flex flex-row items-center justify-center ${
        DEBUG_MODE ? 'outline outline-red-500' : ''
      }`}
      style={{
        color: adjustBrightness(song?.color?.rgb)
      }}
    >
      {/* Rotated Album Artwork */}
      <div
        className={`absolute top-0 left-0 w-[480px] h-[480px] -rotate-90 flex ${
          DEBUG_MODE ? 'outline outline-green-500' : ''
        }`}
      >
        {song?.thumbnail && (
          <div className="absolute top-0 left-0 w-full h-full">
            <img
              src={song.thumbnail}
              alt="Album Art"
              className={`absolute top-1/2 left-1/2 h-full -translate-x-1/2 -translate-y-1/2 block blur-[10px] opacity-50 ${
                DEBUG_MODE ? 'outline outline-blue-500' : ''
              }`}
            />
            <img
              src={song.thumbnail}
              alt="Album Art"
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 block ${
                DEBUG_MODE ? 'outline outline-blue-500' : ''
              }`}
              onClick={() => pause()}
            />
          </div>
        )}
      </div>

      {/* Text Section */}
      <div
        ref={textRef}
        className={`absolute top-0 left-0 w-[480px] h-[320px] flex flex-col pl-4 pr-4 justify-start items-center origin-top-right -rotate-90 ${
          DEBUG_MODE ? 'outline outline-yellow-500' : ''
        }`}
        style={{
          fontSize, // Dynamically computed font size
        }}
      >
        <div className="italic text-3xl opacity-75 flex-grow-0 overflow-hidden text-ellipsis h-12 flex items-center text-center">
          {song?.artist || 'Unknown Artist'}
        </div>

        <div className="font-bold text-center h-16 overflow-hidden text-ellipsis flex items-center line-clamp-1 justify-center leading-none">
          {song?.track_name?.replace(/\s*\(.*?\)|\s*\[.*?/g, '') || 'Waiting For Track...'}
        </div>

        <div className="text-lg opacity-75 flex-grow-0 overflow-hidden text-ellipsis h-12 flex items-center text-center">
          {song?.album || ''}
        </div>
      </div>
    </div>
  )
}

/**
 * Simple brightness adjustment to ensure text is visible against album-color backgrounds.
 */
function adjustBrightness(rgb?: string) {
  if (!rgb) return 'white'

  const parseColor = (color: string) =>
    color.startsWith('rgb') ? color.match(/\d+/g)?.map(Number) ?? [0, 0, 0] : [0, 0, 0]

  const [r, g, b] = parseColor(rgb)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const threshold = 76

  if (luminance < threshold) {
    const factor = 3 // Brighten factor
    return `rgb(${Math.min(255, r * factor)}, ${Math.min(255, g * factor)}, ${Math.min(
      255,
      b * factor
    )})`
  }
  return rgb
}
