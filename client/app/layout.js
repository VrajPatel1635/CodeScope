import "./globals.css";
import { LoaderProvider } from "./components/shared/LoaderContext";

export const metadata = {
  title: "DSA Visualizer",
  description: "Step-by-step execution viewer",
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