import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stablecoin Card Issuer Comparison',
  description: 'Compare stablecoin credit card issuers by region, fees, KYC requirements, and more',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
