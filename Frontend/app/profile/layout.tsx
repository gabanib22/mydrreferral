import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | My Doctor Referral',
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
        {children}
      </body>
    </html>
  )
}
