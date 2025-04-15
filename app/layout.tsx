// /app/layout.tsx
export const metadata = {
  title: "Weight Tracker",
  description: "Track weight, fasting and more with no backend!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-800">{children}</body>
    </html>
  );
}

