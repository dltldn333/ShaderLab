{
    // Drop Shadow (Outer Shadow)
    float shadowBlur = 30.0;
    vec2 shadowOffset = vec2(10.0, 10.0);
    vec4 shadowColor = vec4(0.0, 0.0, 0.0, 0.4);
    
    // 그림자용 SDF (중심에서 오프셋만큼 이동)
    float shadowD = sdRoundedBox(ctx.p - shadowOffset, ctx.size * 0.5, uRadius);
    float shadowMask = 1.0 - smoothstep(-shadowBlur, shadowBlur, shadowD);
    
    layer = vec4(shadowColor.rgb, shadowMask * shadowColor.a);
}
