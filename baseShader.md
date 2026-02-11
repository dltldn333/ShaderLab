# base shader

```
  varying vec2 vUv;
  
  uniform vec2 uSize;
  uniform float uRadius;
  uniform float uBorderWidth;
  uniform vec3 uColor;
  uniform vec3 uBorderColor;
  uniform float uOpacity;
  uniform float uBgOpacity;

  // SDF 박스 함수
  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    vec2 halfSize = uSize * 0.5;
    
    float d = sdRoundedBox(p, halfSize, uRadius);
    
    float smoothEdge = 1.0; 

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
```