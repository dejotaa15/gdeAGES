import { RegraDeNegocioException } from '../../../domain/exceptions/domain.exceptions';
import { PeriodoQueryDto } from '../../dtos/compra.dto';

const SOMENTE_DATA = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Converte ?inicio=2026-11-01&fim=2026-11-30 em um intervalo [inicio, fim).
 * Quando "fim" é só uma data, o dia inteiro entra (vai até 00:00 do dia seguinte).
 * Datas sem horário são interpretadas em UTC.
 */
export function converterPeriodo(periodo: PeriodoQueryDto): {
  inicio?: Date;
  fim?: Date;
} {
  const inicio = periodo.inicio ? new Date(periodo.inicio) : undefined;
  let fim: Date | undefined;

  if (periodo.fim) {
    fim = new Date(periodo.fim);
    if (SOMENTE_DATA.test(periodo.fim)) {
      fim.setUTCDate(fim.getUTCDate() + 1);
    }
  }

  if (inicio && fim && inicio >= fim) {
    throw new RegraDeNegocioException(
      'A data de início deve ser anterior à data de fim',
    );
  }

  return { inicio, fim };
}
