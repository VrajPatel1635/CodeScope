import "./globals.css";
import { LoaderProvider } from "./components/shared/LoaderContext";

export const metadata = {
  title: "CodeScope",
  description: "Advanced interactive execution visualizer for algorithmic analysis and debugging",
  icons: {
    icon: '/codescopelogo.png',
  },
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