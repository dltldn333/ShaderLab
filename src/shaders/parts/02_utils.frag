// SDF 박스 함수
float sdRoundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// [Helper] 색상 합성 함수 (Standard Source-Over)
vec4 blend(vec4 backdrop, vec4 source) {
    float outAlpha = source.a + backdrop.a * (1.0 - source.a);
    if (outAlpha == 0.0) return vec4(0.0);
    vec3 outColor = (source.rgb * source.a + backdrop.rgb * backdrop.a * (1.0 - source.a)) / outAlpha;
    return vec4(outColor, outAlpha);
}
