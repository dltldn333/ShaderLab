  float resultAlpha = finalAlpha * uOpacity;
  if (resultAlpha < 0.001) discard;
  gl_FragColor = vec4(finalColor, resultAlpha);
}