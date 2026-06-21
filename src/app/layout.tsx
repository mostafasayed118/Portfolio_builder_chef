import type { ReactNode } from "react";
import { ConvexClientProvider } from "@/lib/convex-provider";
import "./globals.css";

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
