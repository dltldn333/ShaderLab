// 배경은 SDF 내부만 채움
float fillAlpha = 1.0 - smoothstep(-ctx.antiAlias, 0.0, ctx.d);

// 배경색 + 배경 투명도(rgba의 a) 적용
layer = vec4(uColor, fillAlpha * uBgOpacity);
