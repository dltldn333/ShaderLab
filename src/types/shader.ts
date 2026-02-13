// 셰이더 블록 타입 정의
export interface ShaderBlock {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  locked?: boolean;
  type?: "global" | "main";
  filename: string;
  propertyName?: string; // CSS 속성명 저장
}
