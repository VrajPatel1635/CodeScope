import "./globals.css";
import { LoaderProvider } from "./components/shared/LoaderContext";

export const metadata = {
  title: "CodeScope",
  description: "Advanced interactive execution visualizer for algorithmic analysis and debugging",
  icons: [
    {
      media: '(prefers-color-scheme: light)',
      url: '/codescopelogo.png',
      href: '/codescopelogo.png',
    },
    {
      media: '(prefers-color-scheme: dark)',
      url: '/codescopelogo-light.png',
      href: '/codescopelogo-light.png',
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LoaderProvider>
          {children}
        </LoaderProvider>
      </body>
    </html>
  );
}