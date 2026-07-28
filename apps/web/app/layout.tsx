import './globals.css'

export const metadata = {
  title: 'BT-Manager | Tactical Command',
  description: 'BattleTech Campaign Logistics & Unit Management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-btDark text-gray-200 min-h-screen p-6">{children}</body>
    </html>
  )
}
