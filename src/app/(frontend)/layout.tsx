import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Bitter, Mulish } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { ConnectionStatus } from '@/components/ConnectionStatus'
import './globals.css'

const bitter = Bitter({ subsets: ['latin'], variable: '--font-heading-family', display: 'swap' })
const mulish = Mulish({ subsets: ['latin'], variable: '--font-body-family', display: 'swap' })

const siteName = 'En mi casa se cocina así'
const description = 'Nuestro cuaderno de recetas de familia. Las de siempre, las que salen bien y las que apetece repetir.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: siteName,
  description,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteName,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: siteName,
    description,
    siteName,
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description,
  },
}

export const viewport: Viewport = {
  themeColor: '#3f5d7a',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bitter.variable} ${mulish.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg">
        <ServiceWorkerRegister />
        <ConnectionStatus />
        <Header />
        <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 pb-16 nav:px-7 nav:pb-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
