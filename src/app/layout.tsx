import { cn } from '@/lib/utils'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar'
import Providers from '@/trpc/Providers'
import { Toaster } from '@/components/ui/toaster'
import "react-loading-skeleton/dist/skeleton.css"
import 'simplebar-react/dist/simplebar.min.css';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocuQuery',
  description: 'Read your PDF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" >
      <Providers>
        <body className={cn("min-h-screen font-sans antialiased grainy", inter.className)}>
          <Navbar />
          <Toaster />
          {children}
        </body>
      </Providers>
    </html>
  )
}
