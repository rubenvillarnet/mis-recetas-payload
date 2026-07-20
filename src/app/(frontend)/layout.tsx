import React from 'react'
import type { Metadata } from 'next'
import { Bitter, Mulish } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import './globals.css'

const bitter = Bitter({ subsets: ['latin'], variable: '--font-heading-family', display: 'swap' })
const mulish = Mulish({ subsets: ['latin'], variable: '--font-body-family', display: 'swap' })

const siteName = 'En mi casa se cocina así'
const description = 'Nuestro cuaderno de recetas de familia. Las de siempre, las que salen bien y las que apetece repetir.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: siteName,
  description,
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bitter.variable} ${mulish.variable}`}>
      <body className="flex min-h-screen flex-col bg-bg">
        <Header />
        <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 pb-16 nav:px-7 nav:pb-20">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
