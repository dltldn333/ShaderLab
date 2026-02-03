export const defaultVertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const defaultFragment = `
varying vec2 vUv;

uniform vec2 uSize;
uniform float uRadius;
uniform float uBorderWidth;
uniform vec3 uColor;
uniform vec3 uBorderColor;
uniform float uOpacity;
uniform float uBgOpacity;

// SDF 박스 함수
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  // UV 좌표를 픽셀 단위(uSize) 좌표계로 변환 (중심점 0,0)
  vec2 p = (vUv - 0.5) * uSize;
  vec2 halfSize = uSize * 0.5;
  
  float d = sdRoundedBox(p, halfSize, uRadius);
  
  // 안티앨리어싱을 위한 부드러운 경계 (픽셀 단위)
  float smoothEdge = 1.0; 

  // Border + Fill 영역 계산
  float fillAlpha = 1.0 - smoothstep(-uBorderWidth - smoothEdge, -uBorderWidth, d);
  
  float borderAlpha = 0.0;
  
  if (uBorderWidth > 0.01) {
    borderAlpha = (1.0 - smoothstep(0.0, smoothEdge, d)) - fillAlpha;
  }

  vec3 color = uColor;
  float totalAlpha = borderAlpha + fillAlpha;
  
  // Border가 있을 경우 색상 믹싱
  if (totalAlpha > 0.001) {
      color = mix(uColor, uBorderColor, borderAlpha / totalAlpha);
  }
  
  // 배경 투명도와 전체 투명도 적용
  float shapeAlpha = borderAlpha + (fillAlpha * uBgOpacity);
  float finalOpacity = shapeAlpha * uOpacity;
  
  if (finalOpacity < 0.001) discard;

  gl_FragColor = vec4(color, finalOpacity);
}
`;
