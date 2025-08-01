import Header from '@/components/Header';
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'My Connections | My Doctor Referral',
  description: 'Datttaa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header/>
        {children}
        </body>
    </html>
  )
}
