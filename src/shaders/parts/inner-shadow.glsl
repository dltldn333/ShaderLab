{
    // Inner Shadow
    float innerBlur = 20.0;
    vec2 innerOffset = vec2(5.0, 5.0);
    vec4 innerColor = vec4(0.0, 0.0, 0.0, 0.5);
    
    // 내부 그림자용 SDF
    float innerD = sdRoundedBox(ctx.p - innerOffset, ctx.size * 0.5, uRadius);
    float fillAlpha = 1.0 - smoothstep(-ctx.antiAlias, 0.0, ctx.d);
    
    // 내부에만 그려지도록 fillAlpha로 마스킹
    float innerShadowMask = smoothstep(-innerBlur, 0.0, innerD) * fillAlpha;
    
    layer = vec4(innerColor.rgb, innerShadowMask * innerColor.a);
}
