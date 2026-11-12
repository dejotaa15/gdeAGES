import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CompraResponseDto,
  CriarCompraDto,
  FaturamentoResponseDto,
  ListarComprasQueryDto,
  PeriodoQueryDto,
} from '../../application/dtos/compra.dto';
import { CompraMapper } from '../../application/mappers/compra.mapper';
import { CompraService } from '../../application/services/compra.service';
import { CancelarCompraUseCase } from '../../application/use-cases/compras/cancelar-compra.use-case';
import { ConsultarFaturamentoUseCase } from '../../application/use-cases/compras/consultar-faturamento.use-case';
import { converterPeriodo } from '../../application/use-cases/compras/periodo';
import { RegistrarCompraUseCase } from '../../application/use-cases/compras/registrar-compra.use-case';
import { Cargo } from '../../domain/enums/cargo.enum';
import { Roles } from '../decorators/roles.decorator';
import {
  UsuarioAtual,
  type UsuarioAutenticado,
} from '../decorators/usuario-atual.decorator';

@Controller('compras')
export class ComprasController {
  constructor(
    private readonly compraService: CompraService,
    private readonly registrarCompra: RegistrarCompraUseCase,
    private readonly cancelarCompra: CancelarCompraUseCase,
    private readonly consultarFaturamento: ConsultarFaturamentoUseCase,
  ) {}

  /** Qualquer usuário logado registra compra (é o dia a dia do balcão). */
  @Post()
  async registrar(
    @UsuarioAtual() usuario: UsuarioAutenticado,
    @Body() dto: CriarCompraDto,
  ): Promise<CompraResponseDto> {
    return CompraMapper.toResponse(
      await this.registrarCompra.executar(usuario.sub, dto),
    );
  }

  @Get()
  async listar(
    @Query() query: ListarComprasQueryDto,
  ): Promise<CompraResponseDto[]> {
    const compras = await this.compraService.listar({
      status: query.status,
      ...converterPeriodo(query),
    });
    return compras.map((c) => CompraMapper.toResponse(c));
  }

  /**
   * Precisa vir ANTES de @Get(':id'), senão o Nest tenta interpretar
   * "faturamento" como um id.
   */
  @Get('faturamento')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  faturamento(
    @Query() query: PeriodoQueryDto,
  ): Promise<FaturamentoResponseDto> {
    return this.consultarFaturamento.executar(query);
  }

  @Get(':id')
  async buscar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompraResponseDto> {
    return CompraMapper.toResponse(await this.compraService.buscarPorId(id));
  }

  /** Cancela a compra e devolve os itens ao estoque. */
  @Patch(':id/cancelar')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  async cancelar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CompraResponseDto> {
    return CompraMapper.toResponse(await this.cancelarCompra.executar(id));
  }

  /** Só apaga compras já canceladas (as concluídas fazem parte do faturamento). */
  @Delete(':id')
  @Roles(Cargo.ADMIN)
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.compraService.remover(id);
  }
}
