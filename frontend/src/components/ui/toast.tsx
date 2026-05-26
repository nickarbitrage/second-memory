"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      theme="dark"
      toastOptions={{
        style: {
          background: "#0f1117",
          border: "1px solid #1e2230",
          color: "#e2e6ef",
        },
      }}
    />
  );
}
