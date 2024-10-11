declare module '@/utils/svgUtils' {
  export const generateSVGDiagram: (apiKey: string, noteContent: string) => Promise<string>;
}