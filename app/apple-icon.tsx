import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "180px",
        height: "180px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e6b38, #2d8a4e)",
        borderRadius: "36px",
      }}
    >
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <path
          d="M60 12C60 12 100 28 100 60C100 92 60 108 60 108C60 108 20 92 20 60C20 28 60 12 60 12Z"
          fill="rgba(255,255,255,0.9)"
        />
        <path d="M60 30V90" stroke="#1e6b38" strokeWidth="4" />
        <path
          d="M60 48C50 40 38 44 38 44"
          stroke="#1e6b38"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M60 64C70 56 82 60 82 60"
          stroke="#1e6b38"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>,
    { ...size },
  );
}
