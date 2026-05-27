import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "프롬포트랩";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f4f5f2",
          color: "#171a17",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "58px 68px",
          border: "18px solid #252925",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                background: "#252925",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              P
            </div>
            프롬포트랩
          </div>
          <div
            style={{
              border: "2px solid #252925",
              padding: "12px 18px",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            PROMPT LAB
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: 0,
              maxWidth: 980,
            }}
          >
            결과로 검증된
            <br />
            이미지 프롬포트 모음
          </div>
          <div
            style={{
              color: "#4e574f",
              fontSize: 32,
              lineHeight: 1.35,
              maxWidth: 880,
            }}
          >
            찾고, 복사하고, 바로 활용하는 AI 이미지 프롬프트 커뮤니티
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#4e574f",
            fontSize: 24,
            width: "100%",
          }}
        >
          <div>prompt-lab-drab-xi.vercel.app</div>
          <div style={{ display: "flex", gap: 10 }}>
            <span>#이미지프롬프트</span>
            <span>#AI이미지</span>
            <span>#커뮤니티</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
