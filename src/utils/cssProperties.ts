export interface CSSPropertyMeta {
  name: string;
  uniforms: {
    name: string;
    type: "float" | "vec3" | "vec2" | "color";
    defaultValue: any;
    min?: number;
    max?: number;
    step?: number;
  }[];
}

export const CSS_PROPERTY_METADATA: Record<string, CSSPropertyMeta> = {
  "background-color": {
    name: "background-color",
    uniforms: [{ name: "uBackgroundColor", type: "color", defaultValue: "#3b82f6" }],
  },
  "border": {
    name: "border",
    uniforms: [
      { name: "uBorderWidth", type: "float", defaultValue: 2, min: 0, max: 50, step: 1 },
      { name: "uBorderColor", type: "color", defaultValue: "#1e40af" },
    ],
  },
  "box-shadow": {
    name: "box-shadow",
    uniforms: [
      { name: "uShadowOffset", type: "vec2", defaultValue: [10, 10] },
      { name: "uShadowBlur", type: "float", defaultValue: 20, min: 0, max: 100 },
      { name: "uShadowColor", type: "color", defaultValue: "#000000" },
      { name: "uShadowOpacity", type: "float", defaultValue: 0.5, min: 0, max: 1 },
    ],
  },
  "opacity": {
    name: "opacity",
    uniforms: [{ name: "uElementOpacity", type: "float", defaultValue: 1.0, min: 0, max: 1 }],
  },
  "filter-blur": {
    name: "filter-blur",
    uniforms: [{ name: "uBlurSigma", type: "float", defaultValue: 5.0, min: 0, max: 20 }],
  },
};

export const getAllCSSProperties = (): string[] => {
  const standardProps = Array.from(new Set(getComputedStyle(document.documentElement)));
  const recommended = Object.keys(CSS_PROPERTY_METADATA);
  const otherProps = standardProps.filter((p) => !p.startsWith("-") && !recommended.includes(p));
  return [...recommended, ...otherProps];
};
