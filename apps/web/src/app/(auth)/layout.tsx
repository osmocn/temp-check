import type React from "react";
import { inter } from "@/lib/fonts";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md" style={inter.style}>
        {children}
      </div>
    </div>
  );
};

export default layout;
