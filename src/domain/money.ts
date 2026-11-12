/**
 * Dinheiro em ponto flutuante dá erro de arredondamento (0.1 + 0.2 !== 0.3).
 * Por isso os cálculos de valores são feitos em centavos (inteiros) e só
 * convertidos de volta para reais no final.
 */
export const paraCentavos = (valor: number): number => Math.round(valor * 100);

export const paraReais = (centavos: number): number => centavos / 100;
