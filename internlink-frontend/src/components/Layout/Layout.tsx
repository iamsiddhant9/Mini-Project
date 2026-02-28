// src/components/Layout/Layout.tsx
import { ReactElement, ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): ReactElement {
  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
        {children}
      </main>
    </div>
  );
}
