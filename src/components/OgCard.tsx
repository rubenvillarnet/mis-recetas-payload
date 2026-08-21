/**
 * Tarjeta de vista previa para compartir. Se renderiza con satori (next/og),
 * así que solo admite estilos en línea y flexbox explícito.
 */
export function OgCard({ title, subtitle }: { title: string; subtitle: string }) {
  const titleSize = title.length > 44 ? 52 : title.length > 26 ? 58 : 64

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 90px',
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
      <div
        style={{
          display: 'flex',
          fontSize: titleSize,
          fontWeight: 700,
          color: '#24271f',
          textAlign: 'center',
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', fontSize: 28, fontWeight: 600, color: '#6f716a', marginTop: 20 }}>
        {subtitle}
      </div>
    </div>
  )
}
