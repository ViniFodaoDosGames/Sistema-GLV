import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams, useOutletContext } from 'react-router-dom';

import Stack from '@mui/material/Stack';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';

import { mensagemSucesso, mensagemErro } from '../../components/toastr';

import '../../custom.css';

import axios from 'axios';
import { BASE_URL } from '../../config/axios';
import { getSession } from '../../auth';
import {
    formatarMoeda,
    formatarData,
    hoje,
    somarDias,
    agora,
    mascaraPlaca,
    normalizarPlaca,
    placaValida,
} from '../../config/util';
import { carregar } from '../../config/api';
import { gerarGrade } from '../../config/agenda';

const FORMAS_NO_BALCAO = [
    { valor: 'PIX', nome: 'Pix' },
    { valor: 'CARTAO', nome: 'Cartão' },
    { valor: 'DINHEIRO', nome: 'Dinheiro' },
];

function CadastroAgendamento() {
    const { idParam } = useParams();
    const navigate = useNavigate();
    const { cancelar } = useOutletContext();
    const baseURL = `${BASE_URL}/Agendamentos`;
    const sessao = getSession();
    const ehCliente = sessao?.role === 'CLIENTE';
    const telaDeVolta = sessao?.role === 'ADMINISTRADOR' ? '/listagem-agendamento' : '/agendamentos';

    const [status, setStatus] = useState('');
    const [walkIn, setWalkIn] = useState(false);
    const [idCliente, setIdCliente] = useState('');
    const [idVeiculo, setIdVeiculo] = useState('');
    const [placaWalkIn, setPlacaWalkIn] = useState('');
    const [idServico, setIdServico] = useState('');
    const [dia, setDia] = useState('');
    const [hora, setHora] = useState('');
    const [formaNoBalcao, setFormaNoBalcao] = useState('PIX');
    const [clientes, setClientes] = useState([]);
    const [veiculos, setVeiculos] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [clientesVeiculos, setClientesVeiculos] = useState([]);
    const [agenda, setAgenda] = useState(null);

    const servicoEscolhido = servicos.find((dado) => dado.id === idServico);
    const clienteDoAgendamento = ehCliente ? sessao.idCliente : idCliente;
    const veiculosDoCliente = veiculos.filter(
        (veiculo) =>
            (veiculo.ativo || veiculo.id === idVeiculo) &&
            clientesVeiculos.some(
                (ligacao) => ligacao.idCliente === clienteDoAgendamento && ligacao.idVeiculo === veiculo.id
            )
    );
    const diaEscolhido = walkIn && idParam == null ? hoje() : dia;

    function horariosLivres(diaDaGrade) {
        const db = { ...agenda, Agendamentos: agendamentos };
        const grade = gerarGrade({ servico: servicoEscolhido, data: diaDaGrade, db, ignorarIdAgendamento: idParam });
        return grade.horarios.filter((horario) => horario.disponivel);
    }

    function nomeDoDia(diaDaLista) {
        return new Date(`${diaDaLista}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long' });
    }

    function nomeUsuario(idUsuario) {
        const usuario = usuarios.find((dado) => dado.id === idUsuario);
        return usuario ? usuario.nome : idUsuario;
    }

    const podeMontarAgenda = servicoEscolhido && agenda;
    const proximosDias = Array.from({ length: 30 }, (_, i) => somarDias(hoje(), i));
    const diasDisponiveis = podeMontarAgenda
        ? proximosDias.filter((diaDaLista) => horariosLivres(diaDaLista).length > 0)
        : [];
    const horasDisponiveis = podeMontarAgenda && diaEscolhido ? horariosLivres(diaEscolhido) : [];

    function conferirServicoEHorario() {
        if (idServico === '') {
            mensagemErro('Informe: Serviço');
            return false;
        }
        if (diaEscolhido === '' || hora === '') {
            mensagemErro('Escolha a data e o horário');
            return false;
        }
        return true;
    }

    function pagamentoPendente(valor) {
        return {
            forma: 'PIX',
            status: 'PENDENTE',
            valor,
            dataHora: null,
            codigoGateway: null,
            justificativaEstorno: null,
            idFuncionario: null,
        };
    }

    function pagamentoNoBalcao(valor) {
        return {
            forma: formaNoBalcao,
            status: 'APROVADO',
            valor,
            dataHora: agora(),
            codigoGateway: null,
            justificativaEstorno: null,
            idFuncionario: sessao?.idFuncionario || null,
        };
    }

    async function gravar(dados, pagamentoNovo, mensagemNovo) {
        try {
            if (idParam == null) {
                const resposta = await axios.post(baseURL, dados);
                if (pagamentoNovo) {
                    await axios.post(`${BASE_URL}/Pagamentos`, { ...pagamentoNovo, idAgendamento: resposta.data.id });
                }
                mensagemSucesso(mensagemNovo);
                navigate(ehCliente ? `/pagamento/${resposta.data.id}` : telaDeVolta);
            } else {
                await axios.patch(`${baseURL}/${idParam}`, dados);
                mensagemSucesso('Agendamento alterado com sucesso!');
                navigate(telaDeVolta);
            }
        } catch (erro) {
            mensagemErro('Erro ao salvar o agendamento');
        }
    }

    async function salvarComoCliente() {
        if (idVeiculo === '') {
            mensagemErro('Informe: Veículo');
            return;
        }
        if (!conferirServicoEHorario()) return;

        const dataHora = `${diaEscolhido} ${hora}:00`;
        await gravar(
            {
                dataHora,
                status: 'AGUARDANDO_PAGAMENTO',
                valor: servicoEscolhido.preco,
                walkIn: false,
                idCliente: sessao.idCliente,
                idVeiculo,
                idServico,
            },
            pagamentoPendente(servicoEscolhido.preco),
            'Agendamento feito! Escolha a forma de pagamento.'
        );
    }

    async function buscarOuCriarVeiculo() {
        const existente = veiculos.find((dado) => normalizarPlaca(dado.placa) === normalizarPlaca(placaWalkIn));
        if (existente) return existente.id;

        const resposta = await axios.post(`${BASE_URL}/Veiculos`, {
            placa: normalizarPlaca(placaWalkIn),
            ano: null,
            ativo: true,
            idCor: null,
            idModelo: null,
            idCategoriaVeiculo: null,
        });
        return resposta.data.id;
    }

    async function salvarWalkIn() {
        if (!placaValida(placaWalkIn)) {
            mensagemErro('Placa inválida. Use o formato ABC1234 ou ABC1D23');
            return;
        }
        if (!conferirServicoEHorario()) return;

        let idVeiculoWalkIn;
        try {
            idVeiculoWalkIn = await buscarOuCriarVeiculo();
        } catch (erro) {
            mensagemErro('Erro ao registrar o veículo');
            return;
        }

        const dataHora = `${diaEscolhido} ${hora}:00`;
        await gravar(
            {
                dataHora,
                status: idParam == null ? 'CONFIRMADO' : status,
                valor: servicoEscolhido.preco,
                walkIn: true,
                idCliente: idCliente || null,
                idVeiculo: idVeiculoWalkIn,
                idServico,
            },
            pagamentoNoBalcao(servicoEscolhido.preco),
            'Walk-in registrado e pago! Já pode fazer o check-in.'
        );
    }

    async function salvarComoEquipe() {
        if (idCliente === '') {
            mensagemErro('Informe: Cliente');
            return;
        }
        if (idVeiculo === '') {
            mensagemErro('Informe: Veículo');
            return;
        }
        if (!conferirServicoEHorario()) return;

        const dataHora = `${diaEscolhido} ${hora}:00`;
        await gravar(
            {
                dataHora,
                status: idParam == null ? 'CONFIRMADO' : status,
                valor: servicoEscolhido.preco,
                walkIn: false,
                idCliente,
                idVeiculo,
                idServico,
            },
            pagamentoNoBalcao(servicoEscolhido.preco),
            'Agendamento cadastrado e pago!'
        );
    }

    async function salvar() {
        if (ehCliente) {
            await salvarComoCliente();
        } else if (walkIn) {
            await salvarWalkIn();
        } else {
            await salvarComoEquipe();
        }
    }

    async function buscar() {
        if (idParam == null) return;

        try {
            const response = await axios.get(`${baseURL}/${idParam}`);
            setDia(response.data.dataHora.substring(0, 10));
            setHora(response.data.dataHora.substring(11, 16));
            setStatus(response.data.status ?? '');
            setWalkIn(response.data.walkIn === true);
            setIdCliente(response.data.idCliente ?? '');
            setIdVeiculo(response.data.idVeiculo ?? '');
            setIdServico(response.data.idServico ?? '');
            if (response.data.walkIn && response.data.idVeiculo) {
                const veiculo = await axios.get(`${BASE_URL}/Veiculos/${response.data.idVeiculo}`);
                setPlacaWalkIn(veiculo.data.placa ?? '');
            }
        } catch (erro) {
            mensagemErro('Agendamento não encontrado');
        }
    }

    useEffect(() => {
        buscar();
    }, [idParam]);

    useEffect(() => {
        axios
            .get(`${BASE_URL}/Clientes`)
            .then((response) => {
                setClientes(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Veiculos`)
            .then((response) => {
                setVeiculos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Servicos`)
            .then((response) => {
                setServicos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Usuarios`)
            .then((response) => {
                setUsuarios(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/Agendamentos`)
            .then((response) => {
                setAgendamentos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        axios
            .get(`${BASE_URL}/ClientesVeiculos`)
            .then((response) => {
                setClientesVeiculos(response.data);
            })
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
        carregar(['HorariosFuncionamento', 'Feriados', 'Bloqueios', 'IntervalosAlmoco'])
            .then(setAgenda)
            .catch(function (error) {
                mensagemErro('Erro ao carregar os dados da tela');
            });
    }, []);

    function campoVeiculoDoCliente() {
        const semCliente = !ehCliente && idCliente === '';
        return (
            <FormGroup label='Veículo: *' htmlFor='inputIdVeiculo'>
                <select
                    id='inputIdVeiculo'
                    value={idVeiculo}
                    className='form-select'
                    name='idVeiculo'
                    disabled={semCliente}
                    onChange={(e) => setIdVeiculo(e.target.value)}
                >
                    <option value=''>{semCliente ? 'Escolha o cliente primeiro' : 'Selecione'}</option>
                    {veiculosDoCliente.map((dado) => (
                        <option key={dado.id} value={dado.id}>
                            {dado.placa}
                        </option>
                    ))}
                </select>
            </FormGroup>
        );
    }

    function camposServicoDataHorario() {
        return (
            <>
                <FormGroup label='Serviço: *' htmlFor='inputIdServico'>
                    <select
                        id='inputIdServico'
                        value={idServico}
                        className='form-select'
                        name='idServico'
                        onChange={(e) => {
                            setIdServico(e.target.value);
                            setDia('');
                            setHora('');
                        }}
                    >
                        <option value=''>Selecione</option>
                        {servicos.filter((dado) => dado.ativo || dado.id === idServico).map((dado) => (
                            <option key={dado.id} value={dado.id}>
                                {dado.nome}
                            </option>
                        ))}
                    </select>
                </FormGroup>
                {servicoEscolhido && (
                    <>
                        <p>Valor: {formatarMoeda(servicoEscolhido.preco)}</p>
                        {walkIn ? (
                            <FormGroup label='Data' htmlFor='inputDia'>
                                <input
                                    type='text'
                                    id='inputDia'
                                    className='form-control'
                                    value={`${formatarData(diaEscolhido)} (${idParam == null ? 'hoje' : nomeDoDia(diaEscolhido)})`}
                                    disabled
                                />
                            </FormGroup>
                        ) : (
                            <FormGroup label='Data: *' htmlFor='inputDia'>
                                <select
                                    id='inputDia'
                                    value={dia}
                                    className='form-select'
                                    onChange={(e) => {
                                        setDia(e.target.value);
                                        setHora('');
                                    }}
                                >
                                    <option value=''>Selecione</option>
                                    {diasDisponiveis.map((diaLivre) => (
                                        <option key={diaLivre} value={diaLivre}>
                                            {formatarData(diaLivre)} ({nomeDoDia(diaLivre)})
                                        </option>
                                    ))}
                                </select>
                            </FormGroup>
                        )}
                        <FormGroup label='Horário: *' htmlFor='inputHora'>
                            <select
                                id='inputHora'
                                value={hora}
                                className='form-select'
                                disabled={diaEscolhido === ''}
                                onChange={(e) => setHora(e.target.value)}
                            >
                                <option value=''>{diaEscolhido === '' ? 'Escolha a data primeiro' : 'Selecione'}</option>
                                {horasDisponiveis.map((horario) => (
                                    <option key={horario.hora} value={horario.hora}>
                                        {horario.hora}
                                    </option>
                                ))}
                            </select>
                        </FormGroup>
                        {agenda && walkIn && horasDisponiveis.length === 0 && (
                            <p>Não há mais horário livre hoje para este serviço.</p>
                        )}
                        {agenda && !walkIn && diasDisponiveis.length === 0 && (
                            <p>Nenhum horário livre nos próximos 30 dias para este serviço.</p>
                        )}
                    </>
                )}
            </>
        );
    }

    function campoPagamentoNoBalcao() {
        if (idParam != null) return null;
        return (
            <FormGroup label='Pagamento no balcão: *' htmlFor='inputFormaNoBalcao'>
                <select
                    id='inputFormaNoBalcao'
                    value={formaNoBalcao}
                    className='form-select'
                    onChange={(e) => setFormaNoBalcao(e.target.value)}
                >
                    {FORMAS_NO_BALCAO.map((forma) => (
                        <option key={forma.valor} value={forma.valor}>
                            {forma.nome}
                        </option>
                    ))}
                </select>
            </FormGroup>
        );
    }

    if (ehCliente && idParam != null) {
        return <Navigate to={telaDeVolta} replace />;
    }

    return (
        <div className='container'>
            <Card title={ehCliente ? 'Agendamento' : 'Cadastro de Agendamento'}>
                <div className='row'>
                    <div className='col-lg-12'>
                        <div className='bs-component'>
                            {!ehCliente && (
                                <div className='form-check mb-3'>
                                    <input
                                        type='checkbox'
                                        id='inputWalkIn'
                                        checked={walkIn}
                                        className='form-check-input'
                                        name='walkIn'
                                        disabled={idParam != null}
                                        onChange={(e) => {
                                            setWalkIn(e.target.checked);
                                            setHora('');
                                        }}
                                    />
                                    <label className='form-check-label' htmlFor='inputWalkIn'>
                                        Walk-in (cliente chegou sem agendamento)
                                    </label>
                                </div>
                            )}

                            {ehCliente && (
                                <>
                                    {campoVeiculoDoCliente()}
                                    {camposServicoDataHorario()}
                                </>
                            )}

                            {!ehCliente && walkIn && (
                                <>
                                    <FormGroup label='Placa: *' htmlFor='inputPlacaWalkIn'>
                                        <input
                                            type='text'
                                            id='inputPlacaWalkIn'
                                            value={placaWalkIn}
                                            className='form-control'
                                            placeholder='ABC1D23'
                                            onChange={(e) => setPlacaWalkIn(mascaraPlaca(e.target.value))}
                                        />
                                    </FormGroup>
                                    {camposServicoDataHorario()}
                                    {campoPagamentoNoBalcao()}
                                </>
                            )}

                            {!ehCliente && !walkIn && (
                                <>
                                    <FormGroup label='Cliente: *' htmlFor='inputIdCliente'>
                                        <select
                                            id='inputIdCliente'
                                            value={idCliente}
                                            className='form-select'
                                            name='idCliente'
                                            onChange={(e) => {
                                                setIdCliente(e.target.value);
                                                setIdVeiculo('');
                                            }}
                                        >
                                            <option value=''>Selecione</option>
                                            {clientes.filter((dado) => usuarios.find((usuario) => usuario.id === dado.idUsuario)?.status || dado.id === idCliente).map((dado) => (
                                                <option key={dado.id} value={dado.id}>
                                                    {nomeUsuario(dado.idUsuario)}
                                                </option>
                                            ))}
                                        </select>
                                    </FormGroup>
                                    {campoVeiculoDoCliente()}
                                    {camposServicoDataHorario()}
                                    {campoPagamentoNoBalcao()}
                                </>
                            )}

                            <Stack spacing={1} padding={1} direction='row'>
                                <button
                                    onClick={salvar}
                                    type='button'
                                    className='btn btn-success'
                                >
                                    Salvar
                                </button>
                                <button
                                    onClick={() => cancelar(telaDeVolta)}
                                    type='button'
                                    className='btn btn-danger'
                                >
                                    Cancelar
                                </button>
                            </Stack>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default CadastroAgendamento;
