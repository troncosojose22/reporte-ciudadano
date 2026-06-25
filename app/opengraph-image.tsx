import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Reporte Ciudadano'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative' }}>
        {/* Venezuelan flag */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'absolute', inset: '0' }}>
          <div style={{ flex: 1, background: '#FCD116' }} />
          <div style={{ flex: 1, background: '#003893' }} />
          <div style={{ flex: 1, background: '#CF1020' }} />
        </div>

        {/* Dark overlay + text */}
        <div style={{
          position: 'absolute',
          inset: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)',
        }}>
          <p style={{ color: 'white', fontSize: 80, fontWeight: 700, margin: 0, letterSpacing: '-1px' }}>
            Reporte Ciudadano
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 34, margin: '20px 0 0', fontWeight: 400 }}>
            Ayúdanos a encontrarlos
          </p>
        </div>
      </div>
    ),
    { ...size }
  )
}
