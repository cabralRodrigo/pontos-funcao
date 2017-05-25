import { Injectable } from '@angular/core';
import { Coluna, Linha } from '../models/models';

@Injectable()
export class ProjetoService {

    private storage: Storage;

    constructor() {
        this.storage = localStorage;
    }

    /**
     * Salva as colunas e linhas atuais do projeto no browser do usuário.
     * @param colunas Colunas a serem salvas.
     * @param linhas Linhas a serem salvas.
     */
    public salvar(colunas: Coluna[], linhas: Linha[]): void {
        const json = JSON.stringify({ colunas: colunas, linhas: linhas });

        this.storage.setItem('projeto', json);
    }


    /**
     * Obtém as informações do projeto (linhas e colunas) no browser do usuário, se existir.
     * @returns Linhas e Colunas do projeto atual se existir.
     */
    public obter(): { colunas: Coluna[]; linhas: Linha[]; } {
        const json = localStorage.getItem('projeto');

        //Só tenta realizar o parse do json se conter valor.
        if (json) {
            //Faz o parte do json e monta o objeto de retorno.
            const obj = JSON.parse(json) as { colunas: Coluna[]; linhas: Linha[]; };

            //Só retorna o objeto se as colunas e linhas realmente existirem.
            if (obj.colunas && obj.linhas)
                return obj;
        }

        //Caso o projeto não esteja salvo, retorna indefinido.
        return undefined;
    }

    /**
     * Limpa o projeto salvo atual.
     */
    public limpar(): void {
        this.storage.removeItem('projeto');
    }
}