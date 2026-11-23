import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/card';
import { mensagemErro, mensagemSucesso } from '../components/toastr';
import { BASE_URL } from '../config/axios';
import { STATUS_AGENDAMENTO, formatarData, formatarHora, formatarMoeda } from '../config/util';
import { custoResgate } from '../config/agenda';
import { getSession } from '../auth';
import '../custom.css';

function Pagamento() {
  const params = useParams();
  const idAgendamentoParam =
    params.tipo === 'agendamento'
      ? params.id
      : params.idAgendamento;
  const idPagamentoParam =
    params.tipo === 'pagamento' ? params.id : params.idPagamento;
  const navigate = useNavigate();
  const session = getSession();
  const telaDeVolta = session?.role === 'ADMINISTRADOR' ? '/listagem-agendamento' : '/agendamentos';
  const [agendamento, setAgendamento] = useState(null);
  const [veiculo, setVeiculo] = useState(null);
  const [servico, setServico] = useState(null);
  const [lavaJato, setLavaJato] = useState(null);
  const [pagamento, setPagamento] = useState(null);
  const [saldoPontos, setSaldoPontos] = useState(0);
  const [forma, setForma] = useState('PIX');
  const [carregando, setCarregando] = useState(true);

  const custoPontos = custoResgate(servico, lavaJato);
  const semPontosSuficientes = session?.role !== 'CLIENTE' || !custoPontos || saldoPontos < custoPontos;

  useEffect(() => {
    async function carregar() {
      try {
        let pagamentoSelecionado = null;
        if (idPagamentoParam) {
          const pagamentoResponse = await axios.get(
            `${BASE_URL}/Pagamentos/${idPagamentoParam}`
          );
          pagamentoSelecionado = pagamentoResponse.data;
        }

        const idAgendamento =
          pagamentoSelecionado?.idAgendamento || idAgendamentoParam;
        if (!idAgendamento) {
          setCarregando(false);
          return;
        }

        const [
          agendamentoResponse,
          veiculosResponse,
          servicosResponse,
          clientesResponse,
          vinculosResponse,
          pagamentosResponse,
          lotesResponse,
          lavaJatosResponse,
        ] = await Promise.all([
          axios.get(`${BASE_URL}/Agendamentos/${idAgendamento}`),
          axios.get(`${BASE_URL}/Veiculos`),
          axios.get(`${BASE_URL}/Servicos`),
          axios.get(`${BASE_URL}/Clientes`),
          axios.get(`${BASE_URL}/ClientesVeiculos`),
          axios.get(`${BASE_URL}/Pagamentos`),
          axios.get(`${BASE_URL}/LotesPontos`),
          axios.get(`${BASE_URL}/LavaJatos`),
        ]);

        const dado = agendamentoResponse.data;
        if (session?.role === 'CLIENTE') {
          const cliente = clientesResponse.data.find(
            (item) => String(item.idUsuario) === String(session.usuario.id)
          );
          if (!cliente) {
            navigate('/configuracoes', { replace: true });
            return;
          }

          const clienteIds = new Set([
            String(cliente.id),
            String(cliente.id).replace('cliente-', ''),
            String(cliente.id).replace(/^cliente-0*/, ''),
          ]);
          const agendamentoDoCliente =
            clienteIds.has(String(dado.idCliente)) &&
            vinculosResponse.data.some(
              (item) =>
                clienteIds.has(String(item.idCliente)) &&
                String(item.idVeiculo) === String(dado.idVeiculo)
            );

          if (!agendamentoDoCliente) {
            navigate('/configuracoes', { replace: true });
            return;
          }

          setSaldoPontos(
            lotesResponse.data
              .filter(
                (item) =>
                  clienteIds.has(String(item.idCliente)) &&
                  Number(item.saldo) > 0 &&
                  (!item.expiraEm ||
                    item.expiraEm >= new Date().toISOString().slice(0, 10))
              )
              .reduce((total, item) => total + Number(item.saldo), 0)
          );
        }

        setAgendamento(dado);
        setVeiculo(
          veiculosResponse.data.find(
            (item) => String(item.id) === String(dado.idVeiculo)
          ) || null
        );
        const servicoDoAgendamento =
          servicosResponse.data.find(
            (item) => String(item.id) === String(dado.idServico)
          ) || null;
        setServico(servicoDoAgendamento);
        setLavaJato(
          lavaJatosResponse.data.find(
            (item) => item.id === servicoDoAgendamento?.idLavaJato
          ) || null
        );
        setPagamento(
          pagamentoSelecionado ||
            pagamentosResponse.data.find(
              (item) => String(item.idAgendamento) === String(dado.id)
            ) ||
            null
        );
      } catch (error) {
        mensagemErro('Não foi possível carregar os dados do pagamento.');
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [
    idAgendamentoParam,
    idPagamentoParam,
    navigate,
    session?.role,
    session?.usuario?.id,
  ]);

  async function confirmarPagamento() {
    if (!agendamento) return;

    const valor = Number(agendamento.valor || pagamento?.valor || 0);
    if (forma === 'PONTOS' && semPontosSuficientes) {
      mensagemErro('Saldo insuficiente de pontos para este pagamento.');
      return;
    }

    window.alert(
      'Ao confirmar, você será direcionado para um gateway externo para finalizar a compra.'
    );

    try {
      let pagamentoAtual = pagamento;
      const dadosPagamento = {
        forma,
        status: 'APROVADO',
        valor,
        dataHora: new Date().toLocaleString('sv-SE').replace('T', ' '),
        codigoGateway: forma === 'PONTOS' ? null : `GW-${Date.now()}`,
        justificativaEstorno: null,
        idAgendamento: agendamento.id,
        idFuncionario: null,
      };

      if (pagamentoAtual) {
        await axios.patch(
          `${BASE_URL}/Pagamentos/${pagamentoAtual.id}`,
          dadosPagamento
        );
        pagamentoAtual = { ...pagamentoAtual, ...dadosPagamento };
      } else {
        const response = await axios.post(`${BASE_URL}/Pagamentos`, dadosPagamento);
        pagamentoAtual = response.data;
      }

      await axios.patch(`${BASE_URL}/Agendamentos/${agendamento.id}`, {
        status: 'CONFIRMADO',
      });

      if (forma === 'PONTOS') {
        const clientesResponse = await axios.get(`${BASE_URL}/Clientes`);
        const lotesResponse = await axios.get(`${BASE_URL}/LotesPontos`);
        const cliente = clientesResponse.data.find(
          (item) => String(item.idUsuario) === String(session.usuario.id)
        );
        if (!cliente) throw new Error('Cliente não encontrado.');

        const clienteIds = new Set([
          String(cliente.id),
          String(cliente.id).replace('cliente-', ''),
          String(cliente.id).replace(/^cliente-0*/, ''),
        ]);
        let restante = custoPontos;
        const lotes = lotesResponse.data
          .filter(
            (item) =>
              clienteIds.has(String(item.idCliente)) &&
              Number(item.saldo) > 0 &&
              (!item.expiraEm ||
                item.expiraEm >= new Date().toISOString().slice(0, 10))
          )
          .sort((a, b) => String(a.expiraEm).localeCompare(String(b.expiraEm)));

        for (const lote of lotes) {
          if (restante <= 0) break;
          const utilizado = Math.min(restante, Number(lote.saldo));
          await axios.patch(`${BASE_URL}/LotesPontos/${lote.id}`, {
            saldo: Number(lote.saldo) - utilizado,
          });
          await axios.post(`${BASE_URL}/PagamentosLotesPontos`, {
            idPagamento: pagamentoAtual.id,
            idLotePontos: lote.id,
            quantidadeUtilizada: utilizado,
          });
          restante -= utilizado;
        }

        if (restante > 0) {
          throw new Error('Não foi possível consumir todos os pontos.');
        }
      }

      mensagemSucesso('Pagamento realizado com sucesso.');
      navigate(telaDeVolta);
    } catch (error) {
      mensagemErro(error.message || 'Não foi possível realizar o pagamento.');
    }
  }

  if (carregando) return null;
  if (!agendamento) {
    return (
      <div className='container'>
        <Card title='Pagamento'>
          <p>Agendamento não encontrado.</p>
        </Card>
      </div>
    );
  }

  const valor = Number(agendamento.valor || pagamento?.valor || 0);

  return (
    <div className='container'>
      <Card title='Pagamento do agendamento'>
        <div className='row g-4'>
          <div className='col-lg-7'>
            <h5>Resumo do atendimento</h5>
            <dl className='row mb-0'>
              <dt className='col-sm-4'>Veículo</dt>
              <dd className='col-sm-8'>{veiculo?.placa || 'Não informado'}</dd>
              <dt className='col-sm-4'>Serviço</dt>
              <dd className='col-sm-8'>{servico?.nome || 'Não informado'}</dd>
              <dt className='col-sm-4'>Data e hora</dt>
              <dd className='col-sm-8'>{formatarData(agendamento.dataHora)} às {formatarHora(agendamento.dataHora)}</dd>
              <dt className='col-sm-4'>Status</dt>
              <dd className='col-sm-8'>{STATUS_AGENDAMENTO[agendamento.status] || agendamento.status}</dd>
              <dt className='col-sm-4'>Valor</dt>
              <dd className='col-sm-8'>{formatarMoeda(valor)}</dd>
              <dt className='col-sm-4'>Saldo de pontos</dt>
              <dd className='col-sm-8'>{saldoPontos}</dd>
              <dt className='col-sm-4'>Custo em pontos</dt>
              <dd className='col-sm-8'>{custoPontos}</dd>
            </dl>
          </div>
          <div className='col-lg-5'>
            <h5>Forma de pagamento</h5>
            <div className='d-grid gap-2'>
              {[
                { value: 'PIX', label: 'Pix' },
                { value: 'CARTAO', label: 'Cartão de crédito' },
                { value: 'PONTOS', label: 'Pontos' },
              ].map((opcao) => (
                <button
                  key={opcao.value}
                  type='button'
                  className={`btn ${
                    forma === opcao.value ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  disabled={opcao.value === 'PONTOS' && semPontosSuficientes}
                  onClick={() => setForma(opcao.value)}
                >
                  {opcao.label}
                </button>
              ))}
            </div>
            {session?.role === 'CLIENTE' && custoPontos > 0 && saldoPontos < custoPontos && (
              <div className='alert alert-warning mt-3 mb-0'>
                Faltam {custoPontos - saldoPontos} pontos para pagar com pontos.
              </div>
            )}
            <div className='d-flex gap-2 mt-4'>
              <button
                type='button'
                className='btn btn-primary'
                onClick={confirmarPagamento}
                disabled={
                  agendamento.status !== 'AGUARDANDO_PAGAMENTO' ||
                  pagamento?.status === 'APROVADO'
                }
              >
                Confirmar pagamento
              </button>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={() => navigate(telaDeVolta)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Pagamento;
