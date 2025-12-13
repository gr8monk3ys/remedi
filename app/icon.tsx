import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e6b38, #2d8a4e)",
        borderRadius: "6px",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 2C11 2 19 5 19 11C19 17 11 20 11 20C11 20 3 17 3 11C3 5 11 2 11 2Z"
          fill="rgba(255,255,255,0.9)"
        />
        <path d="M11 6V16" stroke="#1e6b38" strokeWidth="1.2" />
        <path
          d="M11 9C9 7.5 7 8 7 8"
          stroke="#1e6b38"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M11 12C13 10.5 15 11 15 11"
          stroke="#1e6b38"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    { ...size },
  );
}
