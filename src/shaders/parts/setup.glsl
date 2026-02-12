    // 1. 컨텍스트 생성 (비싼 SDF 계산은 여기서 딱 1번만!)
    MirageContext ctx;
    ctx.size = uSize;
    ctx.p = (vUv - 0.5) * uSize;
    ctx.antiAlias = 1.0;
    
    // 기본 SDF 계산
    vec2 halfSize = ctx.size * 0.5;
    ctx.d = sdRoundedBox(ctx.p, halfSize, uRadius);

    // 2. 도화지 준비 (투명)
    vec4 finalColor = vec4(0.0);
    vec4 layer = vec4(0.0); // 각 블록이 사용할 임시 변수
