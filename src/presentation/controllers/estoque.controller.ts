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
} from '@nestjs/common';
import {
  AjustarEstoqueDto,
  CriarEstoqueDto,
  EstoqueResponseDto,
  MovimentarEstoqueDto,
} from '../../application/dtos/estoque.dto';
import { EstoqueMapper } from '../../application/mappers/estoque.mapper';
import { EstoqueService } from '../../application/services/estoque.service';
import { MovimentarEstoqueUseCase } from '../../application/use-cases/estoque/movimentar-estoque.use-case';
import { Cargo } from '../../domain/enums/cargo.enum';
import { Roles } from '../decorators/roles.decorator';

@Controller('estoque')
export class EstoqueController {
  constructor(
    private readonly estoqueService: EstoqueService,
    private readonly movimentar: MovimentarEstoqueUseCase,
  ) {}

  @Post()
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  async criar(@Body() dto: CriarEstoqueDto): Promise<EstoqueResponseDto> {
    return EstoqueMapper.toResponse(await this.estoqueService.criar(dto));
  }

  @Get()
  async listar(): Promise<EstoqueResponseDto[]> {
    const estoques = await this.estoqueService.listar();
    return estoques.map((e) => EstoqueMapper.toResponse(e));
  }

  @Get(':id')
  async buscar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<EstoqueResponseDto> {
    return EstoqueMapper.toResponse(await this.estoqueService.buscarPorId(id));
  }

  /** Ajuste de inventário: define a quantidade contada fisicamente. */
  @Patch(':id')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  async ajustar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AjustarEstoqueDto,
  ): Promise<EstoqueResponseDto> {
    return EstoqueMapper.toResponse(
      await this.movimentar.executar(id, 'ajuste', dto.quantidadeAtual),
    );
  }

  /** Chegada de mercadoria do fornecedor. */
  @Post(':id/entrada')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  @HttpCode(200)
  async entrada(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MovimentarEstoqueDto,
  ): Promise<EstoqueResponseDto> {
    return EstoqueMapper.toResponse(
      await this.movimentar.executar(id, 'entrada', dto.quantidade),
    );
  }

  /** Retirada manual: perda, vencimento, avaria. */
  @Post(':id/saida')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  @HttpCode(200)
  async saida(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MovimentarEstoqueDto,
  ): Promise<EstoqueResponseDto> {
    return EstoqueMapper.toResponse(
      await this.movimentar.executar(id, 'saida', dto.quantidade),
    );
  }

  @Delete(':id')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.estoqueService.remover(id);
  }
}
