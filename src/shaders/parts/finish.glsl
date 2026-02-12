    // --- [Post-Process: opacity] ---
    finalColor.a *= uOpacity;
    
    if (finalColor.a < 0.001) discard;
    gl_FragColor = finalColor;
}
