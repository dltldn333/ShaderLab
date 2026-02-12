/**
 * 브라우저 엔진에서 지원하는 모든 표준 CSS 속성을 추출합니다.
 */
export const getAllCSSProperties = (): string[] => {
  if (typeof window === "undefined") return [];

  // 1. 브라우저의 모든 계산된 스타일 속성 가져오기
  const props = Array.from(getComputedStyle(document.documentElement));

  // 2. 벤더 프리픽스 제거 및 중복 제거
  const standardProps = Array.from(
    new Set(props.filter((p) => !p.startsWith("-")))
  );

  // 셰이더와 무관한 레이아웃/텍스트 상세 속성 필터링 (블랙리스트)
  const excludeKeywords = [
    "margin", "padding", "flex", "grid", "font", "text", "inline", "block",
    "top", "left", "right", "bottom", "width", "height", "min-", "max-",
    "overflow", "pointer", "cursor", "user-", "scroll", "touch", "transition",
    "animation", "will-change", "contain", "display", "position", "z-index",
    "float", "clear", "caption", "border-spacing", "empty-cells", "order",
    "align", "justify", "place", "row-gap", "column-gap", "gap", "break-",
    "hyphens", "letter-spacing", "line-height", "tab-size", "white-space",
    "word-", "direction", "unicode-", "writing-", "vertical-align"
  ];

  const filtered = standardProps.filter(p => 
    !excludeKeywords.some(keyword => p.includes(keyword))
  ).sort();

  // 3. 셰이더 랩에서 우선적으로 추천할 '시각적 효과' 속성들
  const recommended = [
    "background-color",
    "background-image",
    "background-blend-mode",
    "border",
    "border-radius",
    "box-shadow",
    "filter",
    "backdrop-filter",
    "opacity",
    "mix-blend-mode",
    "mask-image",
    "outline",
    "clip-path",
    "box-reflect"
  ];

  const otherProps = filtered.filter((p) => !recommended.includes(p));
  
  return [...recommended, ...otherProps];
};
