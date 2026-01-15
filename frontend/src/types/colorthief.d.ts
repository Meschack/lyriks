declare module 'colorthief' {
  type Color = [number, number, number]

  export default class ColorThief {
    getColor(img: HTMLImageElement, quality?: number): Color
    getPalette(img: HTMLImageElement, colorCount?: number, quality?: number): Color[]
  }
}
