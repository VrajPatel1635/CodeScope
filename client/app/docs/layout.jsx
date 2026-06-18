import DocsSidebar from "@/app/components/docs/DocsSidebar";

export const metadata = {
  title: "Documentation - CodeScope",
  description: "Capability reference for CodeScope's execution visualizer",
};

export default function DocsLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Docs Layout Container */}
      <div className="flex flex-col lg:flex-row max-w-[1600px] mx-auto min-h-screen">
        <DocsSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
