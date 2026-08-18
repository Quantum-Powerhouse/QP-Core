import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

export function renderOgCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#020617",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(6,182,212,0.18), transparent 45%), radial-gradient(circle at 85% 85%, rgba(124,58,237,0.18), transparent 45%)",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#06b6d4",
            fontSize: 28,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: "#ff5f56" }} />
            <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: "#ffbd2e" }} />
            <div style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: "#27c93f" }} />
          </div>
          <span style={{ marginLeft: 12 }}>{eyebrow}</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 68,
            fontWeight: 700,
            color: "#e6ecff",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "#8b97b8",
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
