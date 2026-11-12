/**
 * Cargos da farmácia (linguagem ubíqua do negócio):
 * - ADMIN: gerencia usuários e tem acesso total.
 * - GERENTE: cuida de produtos, estoque, cancelamentos e faturamento.
 * - ATENDENTE: registra compras e consulta produtos/estoque.
 */
export enum Cargo {
  ADMIN = 'ADMIN',
  GERENTE = 'GERENTE',
  ATENDENTE = 'ATENDENTE',
}
