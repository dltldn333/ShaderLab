precision mediump float;

varying vec2 vUv;

// System Uniforms (Always provided)
uniform vec2 uSize;
uniform float uRadius;
uniform float uOpacity;
uniform float uBgOpacity;

// [Protocol] 모든 블록이 공유할 데이터
struct MirageContext {
    vec2 p;         // 중심 기준 좌표
    vec2 size;      // 요소 크기
    float d;        // SDF 거리값 (음수면 내부, 양수면 외부)
    float antiAlias;// 안티앨리어싱 범위 (1.0 px)
};
