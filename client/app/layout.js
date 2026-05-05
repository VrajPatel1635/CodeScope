import "./globals.css";

export const metadata = {
  title: "DSA Visualizer",
  description: "Step-by-step execution viewer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}