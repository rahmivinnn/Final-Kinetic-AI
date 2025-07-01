import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KineticAI - AI-Powered Movement Analysis",
  description: "Advanced pose estimation and movement analysis for rehabilitation and fitness",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* TensorFlow.js */}
        <Script id="tfjs" strategy="beforeInteractive">
          {`
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
            script.onload = () => console.log('TensorFlow.js loaded');
            document.head.appendChild(script);
          `}
        </Script>
        {/* TensorFlow.js Pose Detection */}
        <Script id="pose-detection" strategy="beforeInteractive">
          {`
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.0.0/dist/pose-detection.js';
            script.onload = () => console.log('Pose Detection loaded');
            document.head.appendChild(script);
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
