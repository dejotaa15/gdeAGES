import { Inject, Injectable } from '@nestjs/common';
import { Compra } from '../../domain/entities/compra.entity';
import { RecursoNaoEncontradoException } from '../../domain/exceptions/domain.exceptions';
import {
  COMPRA_REPOSITORY,
  FiltroCompras,
  type ICompraRepository,
} from '../interfaces/compra.repository';

@Injectable()
export class CompraService {
  constructor(
    @Inject(COMPRA_REPOSITORY)
    private readonly compras: ICompraRepository,
  ) {}

  registrar(compra: Compra): Promise<Compra> {
    return this.compras.registrar(compra);
  }

  cancelar(compra: Compra): Promise<Compra> {
    return this.compras.cancelar(compra);
  }

  listar(filtro?: FiltroCompras): Promise<Compra[]> {
    return this.compras.listar(filtro);
  }

  async buscarPorId(id: number): Promise<Compra> {
    const compra = await this.compras.buscarPorId(id);
    if (!compra) throw new RecursoNaoEncontradoException('Compra', id);
    return compra;
  }

  async remover(id: number): Promise<void> {
    const compra = await this.buscarPorId(id);
    compra.garantirQuePodeSerRemovida();
    await this.compras.remover(id);
  }
}
