precision mediump float;
varying vec2 vUv;

uniform vec2 uSize;
uniform float uRadius;
uniform float uBorderWidth;
uniform vec3 uColor;
uniform vec3 uBorderColor;
uniform float uOpacity;
uniform float uBgOpacity;

struct MirageContext {
    vec2 p;         // 중심 기준 좌표
    vec2 size;      // 요소 크기
    float d;        // SDF 거리값 (음수면 내부, 양수면 외부)
    float antiAlias;// 안티앨리어싱 범위 (1.0 px)
};

float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

vec4 blend(vec4 backdrop, vec4 source) {
    float outAlpha = source.a + backdrop.a * (1.0 - source.a);
    if (outAlpha == 0.0) return vec4(0.0);
    vec3 outColor = (source.rgb * source.a + backdrop.rgb * backdrop.a * (1.0 - source.a)) / outAlpha;
    return vec4(outColor, outAlpha);
}

void main() {
    // 1. 컨텍스트 생성
    MirageContext ctx;
    ctx.size = uSize;
    ctx.p = (vUv - 0.5) * uSize;
    ctx.antiAlias = 1.0;
    
    // 기본 SDF 계산
    vec2 halfSize = ctx.size * 0.5;
    ctx.d = sdRoundedBox(ctx.p, halfSize, uRadius);

    // 2. 도화지 준비
    vec4 finalColor = vec4(0.0);
    vec4 layer = vec4(0.0);

    // --- [Block: background-color] ---
    {
        float fillAlpha = 1.0 - smoothstep(-ctx.antiAlias, 0.0, ctx.d);
        layer = vec4(uColor, fillAlpha * uBgOpacity);
    }
    finalColor = blend(finalColor, layer);

    // --- [Block: border] ---
    {
        if (uBorderWidth > 0.0) {
            float inside = smoothstep(-uBorderWidth - ctx.antiAlias, -uBorderWidth, ctx.d);
            float outside = smoothstep(0.0, ctx.antiAlias, ctx.d);
            float borderMask = 1.0 - inside - outside;
            layer = vec4(uBorderColor, borderMask);
        } else {
            layer = vec4(0.0);
        }
    }
    finalColor = blend(finalColor, layer);

    // --- [Post-Process: opacity] ---
    finalColor.a *= uOpacity;
    if (finalColor.a < 0.001) discard;
    gl_FragColor = finalColor;
}
