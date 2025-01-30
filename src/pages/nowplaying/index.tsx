import { useMusicStore } from '@src/stores/musicStore'

export default function NowPlaying() {
  const song = useMusicStore((state) => state.song)
  const DEBUG_MODE = false
  const pause = useMusicStore((state) => state.pause)

  return (
    <div
      className={`w-[800px] h-[480px] bg-black overflow-hidden flex flex-row items-center justify-center ${
        DEBUG_MODE ? 'outline outline-red-500' : ''
      }`}
      style={{
        color: adjustBrightness(song?.color?.rgb)
      }}
    >
      {/* LEFT SIDE: Album Art */}
      <div
        className={`absolute top-0 left-0 w-[480px] h-[480px] -rotate-90 flex ${
          DEBUG_MODE ? 'outline outline-green-500' : ''
        }`}
      >
        {song?.thumbnail && (
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Original Album Art */}
            <img
              src={song.thumbnail}
              alt="Album Art"
              className={`absolute top-1/2 left-1/2 h-full -translate-x-1/2 -translate-y-1/2 block blur-[10px] opacity-50 ${
                DEBUG_MODE ? 'outline outline-blue-500' : ''
              }`}
              style={{
                clipPath: 'inset(0%)'
              }}
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

      {/* RIGHT SIDE: Song Details */}
      <div
        className={`absolute top-0 left-0 w-[480px] h-[320px] flex flex-col pl-4 pr-4 justify-start items-center origin-top-right -rotate-90 ${
          DEBUG_MODE ? 'outline outline-yellow-500' : ''
        }`}
      >
        <p className="text-2xl italic opacity-75 flex-grow-0 line-clamp-2">
          {song?.artist || 'Unknown Artist'}
        </p>
        <p
          className={`font-bold text-center whitespace-normal ${
            song?.track_name?.length < 8
              ? 'text-5xl'
              : song?.track_name?.length > 14
                ? 'text-3xl'
                : 'text-4xl'
          }`}
        >
          {song?.track_name?.replace(/\s*\(.*?\)|\s*\[.*?/g, '') || 'Waiting For Track...'}
        </p>
        <h1 className="text-xl line-clamp-1 overflow-auto whitespace-normal flex-grow-0 opacity-75">
          {song?.album || ''}
        </h1>
      </div>
    </div>
  )
}

function adjustBrightness(rgb) {
  if (!rgb) return 'white'

  const parseColor = (color) =>
    color.startsWith('rgb') ? color.match(/\d+/g).map(Number) : [0, 0, 0] // Default black if invalid

  const [r, g, b] = parseColor(rgb)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const threshold = 76

  if (luminance < threshold) {
    // If dark, brighten the color
    const factor = 3 // Brightening factor
    return `rgb(${Math.min(
      255,
      r * factor
    )}, ${Math.min(255, g * factor)}, ${Math.min(255, b * factor)})`
  }
  return rgb
}
