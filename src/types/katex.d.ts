export as namespace katex;

export interface KatexOptions {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: any;
    colorIsTextColor?: boolean;
    unicodeTextInmathMode?: boolean;
    maxSize?: number
}

export class ParseError implements Error {
    constructor(message: string, lexer: any, position: number);
    name: string;
    message: string;
    position: number;
}

/**
 * Renders a TeX expression into the specified DOM element
 * @param tex A TeX expression
 * @param element The DOM element to render into
 * @param options KaTeX options
 */
export function render(tex: string, element: HTMLElement, options?: KatexOptions): void;
/**
 * Renders a TeX expression into an HTML string
 * @param tex A TeX expression
 * @param options KaTeX options
 */
export function renderToString(tex: string, options?: KatexOptions): string;
