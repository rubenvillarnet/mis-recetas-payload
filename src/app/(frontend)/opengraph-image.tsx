import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f6f5f1',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 96,
            height: 96,
            borderRadius: 26,
            background: '#3f5d7a',
            marginBottom: 40,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
            <path d="M8 3v7M11 3v7M8 3v18M16 3c-1.5 0-2 2-2 5s.5 5 2 5v8" />
          </svg>
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: '#24271f' }}>
          En mi casa se cocina así
        </div>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: '#6f716a', marginTop: 20 }}>
          Nuestro cuaderno de recetas de familia
        </div>
      </div>
    ),
    { ...size },
  )
}
