import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#3f5d7a',
        }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
          <path d="M8 3v7M11 3v7M8 3v18M16 3c-1.5 0-2 2-2 5s.5 5 2 5v8" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
