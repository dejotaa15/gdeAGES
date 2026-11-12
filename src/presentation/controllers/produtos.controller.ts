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
  Put,
} from '@nestjs/common';
import {
  AtualizarProdutoDto,
  CriarProdutoDto,
  ProdutoResponseDto,
  SubstituirProdutoDto,
} from '../../application/dtos/produto.dto';
import { ProdutoMapper } from '../../application/mappers/produto.mapper';
import { ProdutoService } from '../../application/services/produto.service';
import { Cargo } from '../../domain/enums/cargo.enum';
import { Roles } from '../decorators/roles.decorator';

/**
 * CRUD simples, sem regra que envolva outros domínios: o controller chama
 * o Service direto, sem UseCase no meio (o "atalho" da aula de Clean).
 */
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Post()
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  async criar(@Body() dto: CriarProdutoDto): Promise<ProdutoResponseDto> {
    return ProdutoMapper.toResponse(await this.produtoService.criar(dto));
  }

  @Get()
  async listar(): Promise<ProdutoResponseDto[]> {
    const produtos = await this.produtoService.listar();
    return produtos.map((p) => ProdutoMapper.toResponse(p));
  }

  @Get(':id')
  async buscar(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProdutoResponseDto> {
    return ProdutoMapper.toResponse(await this.produtoService.buscarPorId(id));
  }

  @Put(':id')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  async substituir(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubstituirProdutoDto,
  ): Promise<ProdutoResponseDto> {
    return ProdutoMapper.toResponse(
      await this.produtoService.substituir(id, dto),
    );
  }

  @Patch(':id')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  async atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarProdutoDto,
  ): Promise<ProdutoResponseDto> {
    return ProdutoMapper.toResponse(
      await this.produtoService.atualizar(id, dto),
    );
  }

  @Delete(':id')
  @Roles(Cargo.ADMIN, Cargo.GERENTE)
  @HttpCode(204)
  remover(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.produtoService.remover(id);
  }
}
