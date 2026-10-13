import { useState } from 'react'

// Sources range from full-resolution photos to small search thumbnails, so the
// frame is fixed while the image is only ever scaled down: upscaling a 200px
// thumbnail to full width just makes it blurry.
export default function StudyImage({ src }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) return null

  return (
    <div className="w-full h-[30svh] sm:h-80 md:h-[26rem] mb-3 sm:mb-5 rounded-xl bg-[var(--feld)] border border-[var(--rand)] overflow-hidden flex items-center justify-center">
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  )
}
