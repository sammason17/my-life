function getEmbedUrl(url) {
  if (!url) return null

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`

  // Vimeo: vimeo.com/ID, player.vimeo.com/video/ID
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
}

export default function VideoEmbed({ url }) {
  const embedUrl = getEmbedUrl(url)

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Exercise video"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-sm text-gray-400">
          {url ? 'Unsupported video URL' : 'No video added'}
        </div>
      )}
    </div>
  )
}
