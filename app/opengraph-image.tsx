import { ImageResponse } from "next/og";

export const alt = "Remedi - Natural Alternatives to Pharmaceuticals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OGImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1e6b38 0%, #2d8a4e 30%, #3da663 60%, #2a7d5a 100%)",
        fontFamily: "system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle decorative circle */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.06)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          left: "-60px",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.04)",
          display: "flex",
        }}
      />

      {/* Leaf icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path
            d="M36 8C36 8 56 16 56 36C56 56 36 64 36 64C36 64 16 56 16 36C16 16 36 8 36 8Z"
            fill="rgba(255,255,255,0.2)"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2"
          />
          <path d="M36 18V54" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
          <path
            d="M36 30C30 26 24 28 24 28"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M36 38C42 34 48 36 48 36"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* App name */}
      <div
        style={{
          fontSize: "72px",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-1px",
          marginBottom: "12px",
          display: "flex",
        }}
      >
        Remedi
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: "28px",
          fontWeight: 400,
          color: "rgba(255, 255, 255, 0.85)",
          display: "flex",
        }}
      >
        Natural Alternatives to Pharmaceuticals
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "4px",
          background: "rgba(255, 255, 255, 0.2)",
          display: "flex",
        }}
      />
    </div>,
    { ...size },
  );
}
