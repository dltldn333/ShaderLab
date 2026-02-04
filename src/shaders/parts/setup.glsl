  vec2 p = (vUv - 0.5) * uSize;
  vec2 halfSize = uSize * 0.5;
  
  float d = 0.0;           // SDF 거리값
  vec3 finalColor = uColor; // 최종 색상
  float finalAlpha = 1.0;  // 최종 투명도
  float fillAlpha = 0.0;   // 내부 채움 알파