export interface Coluna {
    /**
     * Nome da coluna.
     */
    nome: string;

    /**
     * Define se a coluna possui dados de previsão ou dados reais.
     */
    previsao: boolean;

    /**
     * Tipo da coluna.
     */
    tipo: string;
}