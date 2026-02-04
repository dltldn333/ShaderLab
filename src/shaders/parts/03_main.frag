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
  
  if (totalAlpha > 0.001) {
      color = mix(uColor, uBorderColor, borderAlpha / totalAlpha);
  }
  
  float shapeAlpha = borderAlpha + (fillAlpha * uBgOpacity);
  float finalOpacity = shapeAlpha * uOpacity;
  
  if (finalOpacity < 0.001) discard;

  gl_FragColor = vec4(color, finalOpacity);
}