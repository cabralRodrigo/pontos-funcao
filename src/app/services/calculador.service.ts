import { Injectable } from '@angular/core';
import { Expression, Equation, Fraction, parse as parseEquacao } from 'algebra.js';

@Injectable()
export class CalculadorService {

    public calcularPorEquacaoLinear(pontosFuncaoA: number, valorA: number, pontosFuncaoB: number, valorB: number, pontosFuncao: number): number {

        //Calcula o valor de B que contém a variável A.
        const valorBComVariavel = this.calcularEquacaoPrimeiroGrau(pontosFuncaoA, valorA, 'a', 'b', 'b');

        //Calcula o valor de A.
        const valorEquacaoA = this.calcularEquacaoPrimeiroGrau(pontosFuncaoB, valorB, 'a', valorBComVariavel.toString(), 'a');

        //Calcula o valor de B.
        const valorEquacaoB = this.calcularEquacaoPrimeiroGrau(pontosFuncaoB, valorB, valorEquacaoA.toString(), 'b', 'b');

        //Monta a equação completa para determinar o valor da métrica.
        // (valorA * pontosFuncao) + (valorB)
        const ex = parseEquacao(`(${valorEquacaoA.toString()} * ${pontosFuncao}) + (${valorEquacaoB.toString()})`) as Expression;

        // y = (valorA * pontosFuncao) + valorB
        const eq = new Equation(parseEquacao('y') as Expression, ex);

        //Resolve a equação.
        const valorY = eq.solveFor('y');

        if (valorY instanceof Fraction)
            return this.aredondar(valorY.numer / valorY.denom);
        else
            return null;
    }

    public calcularPorTriangulo(pontosFuncaoAnterior: number, valorAnterior: number, pontosFuncaoProximo: number, valorProximo: number, pontosFuncao: number): number | null {
        const diferenca = ((valorProximo - valorAnterior) * (pontosFuncao - pontosFuncaoAnterior)) / (pontosFuncaoProximo - pontosFuncaoAnterior);
        const valorAtual = valorAnterior + diferenca;

        if (!Number.isNaN(valorAtual))
            return this.aredondar(valorAtual);
        else
            return null;
    }

    private aredondar(valor: number): number {
        return parseFloat(valor.toFixed(2));
    }

    /**
     * Faz o calculo de uma equação linear de primeiro grau dada as variáveis da equação.
     * @param x Valor de 'x' na equação.
     * @param y Valor de 'y' na equação.
     * @param a Valor de 'a' na equação.
     * @param b Valor de 'b' na equação.
     * @param variavelACalcular Informa qual variável da equação deverá ser calculada.
     * @return Valor da variável especificada no parâmetro 'variavelACalcular'.
     */
    private calcularEquacaoPrimeiroGrau(x: number, y: number, a: number | string, b: number | string, variavelACalcular: string): Fraction | Fraction[] | number[] {
        // (a * x) + b
        const [aString, bString] = [a.toString(), b.toString()];
        const ex = parseEquacao(`((${aString}) * ${x}) + (${bString})`) as Expression;

        // y = (a * x) + b
        const eq = new Equation(ex, y);

        return eq.solveFor(variavelACalcular);
    }
}