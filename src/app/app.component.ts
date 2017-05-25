import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';

import { Coluna, Linha } from './models/models';
import { ProjetoService, CalculadorService } from './services/services';

@Component({ selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css'] })
export class AppComponent {

    private readonly COLUNA_PADRAO: Coluna = { nome: '', previsao: true, tipo: 'Horas' };

    /**
     * Referência ao modal de adição de colunas.
     */
    @ViewChild('addColunaModal') public addColunaModal: ModalDirective;

    /**
     * Linhas atuais do projeto.
     */
    public linhas: Linha[] = [];

    /**
     * Colunas atuais do projeto.
     */
    public colunas: Coluna[] = [];

    /**
     * Objeto que guarda os valores de uma coluna sendo adicionada.
     */
    public novaColuna: Coluna;

    constructor(private projetoService: ProjetoService, private calculador: CalculadorService) {
        this.novaColuna = Object.assign({}, this.COLUNA_PADRAO);

        const projeto = this.projetoService.obter();
        if (projeto) {
            this.linhas = projeto.linhas;
            this.colunas = projeto.colunas;
        } else
            this.iniciarTabela();
    }

    public adicionarColuna(): void {
        if (this.novaColuna) {
            //Adiciona novo campo nas linhas.
            for (let i = 0; i < this.linhas.length; i++)
                this.linhas[i].valores.push(null);

            //Adiciona coluna.
            this.colunas.push(this.novaColuna);

            this.novaColuna = Object.assign({}, this.COLUNA_PADRAO);
            this.exibirModalAdicionarColuna(false);
        }
    }

    public adicionarLinha(): void {
        let valores = [];
        for (let i = 0; i < this.colunas.length; i++)
            if (this.colunas[i].tipo == 'pf')
                valores.push(0);
            else
                valores.push(null);

        this.linhas.push({ valores: valores, calculada: true });
    }

    public exibirModalAdicionarColuna(exibir: boolean): void {
        if (this.addColunaModal) {
            if (exibir)
                this.addColunaModal.show();
            else
                this.addColunaModal.hide();
        }
    }

    public valorMudou(): void {
        this.linhas.sort((a, b) => a.valores[0] - b.valores[0]);
    }

    public carregarDadosDemonstracao(): void {
        this.novaColuna = { nome: 'Java', tipo: 'Horas', previsao: true };
        this.adicionarColuna();

        this.novaColuna = { nome: 'Java', tipo: 'Horas', previsao: false };
        this.adicionarColuna();

        this.novaColuna = { nome: 'C#', tipo: 'Horas', previsao: true };
        this.adicionarColuna();

        this.novaColuna = { nome: 'C#', tipo: 'Horas', previsao: false };
        this.adicionarColuna();

        this.linhas.push({ calculada: false, valores: [187, 917, 900, 820, 903] });
        this.linhas.push({ calculada: true, valores: [193, null, null, null, null] });
        this.linhas.push({ calculada: false, valores: [215, 1007, 1110, 1100, 1210] });
        this.linhas.push({ calculada: false, valores: [342, 1820, 997, 1870, 2000] });
        this.linhas.push({ calculada: false, valores: [571, 2030, 220, 2040, 2017] });
        this.linhas.push({ calculada: false, valores: [890, 2720, 2617, 2800, 2518] });
        this.linhas.push({ calculada: true, valores: [1217, null, null, null, null] });
    }

    public calcularValores(): void {
        //Atualmente não há formas de calcular os valores sem pelo menos 3 registros na tabela.
        if (this.linhas.length < 3)
            return;

        //Antes de tudo, organiza as linhas pelo valor do ponto de função.
        this.linhas.sort((a, b) => a.valores[0] - b.valores[0]);

        for (let i = 0; i < this.linhas.length; i++) {
            const linha = this.linhas[i];

            //Somente calcula as linhas marcadas como calculadas.
            if (linha.calculada) {
                const pfAtual = parseFloat(linha.valores[0]);

                if ((i == 0 || i == this.linhas.length - 1)) {
                    //Calcular sem média
                    let linhaA: Linha;
                    let linhaB: Linha;

                    if (i == 0) {
                        linhaA = this.linhas[i + 1];
                        linhaB = this.linhas[i + 2];
                    }
                    else {
                        linhaA = this.linhas[i - 1];
                        linhaB = this.linhas[i - 2];
                    }

                    const pfA = parseFloat(linhaA.valores[0]);
                    const pfB = parseFloat(linhaB.valores[0]);

                    for (let j = 1; j < this.colunas.length; j++)
                        if (this.colunas[j].previsao) {
                            const valorA = parseFloat(linhaA.valores[j]);
                            const valorB = parseFloat(linhaB.valores[j]);
                            
                            const valorAtual = this.calculador.calcularPorEquacaoLinear(pfA, valorA, pfB, valorB, pfAtual);
                            if (valorAtual !== null)
                                this.linhas[i].valores[j] = valorAtual.toFixed(2);
                        }
                }
                else {

                    const anterior = this.linhas[i - 1];
                    const proxima = this.linhas[i + 1];
                    const pfAnterior = parseFloat(anterior.valores[0]);
                    const pfProximo = parseFloat(proxima.valores[0]);

                    for (let j = 1; j < this.colunas.length; j++)
                        if (this.colunas[j].previsao) {
                            const valorAnterior = parseFloat(anterior.valores[j]);
                            const valorProximo = parseFloat(proxima.valores[j]);
                            
                            const valorAtual = this.calculador.calcularPorTriangulo(pfAnterior, valorAnterior, pfProximo, valorProximo, pfAtual);
                            if (valorAtual !== null)
                                this.linhas[i].valores[j] = valorAtual.toFixed(2);
                        }
                }
            }
        }
    }

    public salvar(): void {
        this.projetoService.salvar(this.colunas, this.linhas);
    }

    public limpar(): void {
        if (confirm('Deseja realmente limpar a tabela?')) {
            this.projetoService.limpar();
            this.colunas = this.linhas = [];
            this.iniciarTabela();
        }
    }

    private iniciarTabela(): void {
        this.colunas.push({ nome: 'Pontos Função', previsao: true, tipo: 'pf' });
    }
}