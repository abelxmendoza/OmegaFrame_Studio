'use client'

import '../styles/globals.css'
import { ReduxProvider } from './providers'
import Sidebar from '@/components/Sidebar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>OmegaFrame Studio - AI-Powered Video Generation</title>
        <meta name="description" content="Create professional videos from scripts using AI" />
      </head>
      <body className="bg-omega-bg text-omega-text flex min-h-screen">
        <ReduxProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </ReduxProvider>
      </body>
    </html>
  )
}

