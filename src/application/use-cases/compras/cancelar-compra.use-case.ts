import { Injectable } from '@nestjs/common';
import { Compra } from '../../../domain/entities/compra.entity';
import { CompraService } from '../../services/compra.service';

/** Cancela a compra e devolve os produtos ao estoque. */
@Injectable()
export class CancelarCompraUseCase {
  constructor(private readonly compraService: CompraService) {}

  async executar(id: number): Promise<Compra> {
    const compra = await this.compraService.buscarPorId(id);
    compra.cancelar(); // a entidade valida se já não estava cancelada
    return this.compraService.cancelar(compra);
  }
}
