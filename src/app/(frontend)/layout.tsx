import React from 'react'
import { Bitter, Mulish } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import './globals.css'

const bitter = Bitter({ subsets: ['latin'], variable: '--font-heading-family', display: 'swap' })
const mulish = Mulish({ subsets: ['latin'], variable: '--font-body-family', display: 'swap' })

export const metadata = {
  title: 'En mi casa se cocina así',
  description: 'Nuestro cuaderno de recetas de familia.',
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
