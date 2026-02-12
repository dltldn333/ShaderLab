if (uBorderWidth > 0.0) {
    // 테두리 영역 계산 (SDF 활용)
    // d가 -width ~ 0 사이인 구간을 1로 만듦
    float inside = smoothstep(-uBorderWidth - ctx.antiAlias, -uBorderWidth, ctx.d);
    float outside = smoothstep(0.0, ctx.antiAlias, ctx.d);
    float borderMask = 1.0 - inside - outside;

    layer = vec4(uBorderColor, borderMask);
} else {
    layer = vec4(0.0);
}
