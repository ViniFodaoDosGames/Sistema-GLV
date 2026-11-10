import React, { useEffect, useMemo, useState } from 'react';
import Modal from './Modal';

const fieldLabels = {
  nome: 'Nome',
  cpf: 'CPF',
  email: 'E-mail',
  celular: 'Celular',
  status: 'Status',
  ativo: 'Ativo',
  placa: 'Placa',
  ano: 'Ano',
  preco: 'Preço (R$)',
  pontosGerados: 'Pontos gerados',
  vagas: 'Vagas',
  descricao: 'Descrição',
  tempoDuracao: 'Duração (min)',
  tempoIntervalo: 'Intervalo (min)',
  notificaConclusao: 'Notificar conclusão',
  idMarca: 'Marca vinculada',
  idModelo: 'Modelo',
  idCor: 'Cor',
  idCategoriaVeiculo: 'Categoria do veículo',
  idUsuario: 'Usuário vinculado',
  idFuncionario: 'Funcionário vinculado',
  idCliente: 'Cliente',
  idVeiculo: 'Veículo',
  idServico: 'Serviço',
  data: 'Data',
  dataHora: 'Data e hora',
  horaAbertura: 'Abertura',
  horaFechamento: 'Fechamento',
  totalPosicoes: 'Total de posições',
  fatorFidelidade: 'Fator de fidelidade',
  validadePontosFidelidade: 'Validade dos pontos de fidelidade (dias)',
  validadePontosCompensacao: 'Validade dos pontos de compensação (dias)',
  quantidade: 'Quantidade',
  saldo: 'Saldo',
  tipo: 'Tipo',
  canal: 'Canal',
  mensagem: 'Mensagem',
  observacao: 'Observação',
  motivo: 'Motivo',
  diaInteiro: 'Dia inteiro',
  aberto: 'Unidade aberta',
};

function CatalogRecordDialog({ open, onClose, collection, record, sample, onSave }) {
  const [values, setValues] = useState({});
  const [error, setError] = useState('');
  const fields = useMemo(
    () => Object.keys(sample || {}).filter((key) => key !== 'id' && key !== 'idLavaJato' && !(record && key === 'senha')),
    [record, sample]
  );

  useEffect(() => {
    if (!open) return;
    const initial = {};
    fields.forEach((key) => {
      if (record) {
        initial[key] = record[key] ?? '';
      } else {
        initial[key] = typeof sample[key] === 'boolean' ? sample[key] : '';
      }
    });
    setValues(initial);
    setError('');
  }, [open, record, sample, fields]);

  const save = (event) => {
    event.preventDefault();
    const updated = {};
    fields.forEach((key) => {
      const current = values[key];
      if (typeof sample[key] === 'boolean') updated[key] = Boolean(current);
      else if (typeof sample[key] === 'number') updated[key] = Number(current || 0);
      else updated[key] = current;
    });
    if (fields.some((key) => values[key] === '')) {
      setError('Preencha os campos obrigatórios antes de salvar.');
      return;
    }
    onSave(updated);
    onClose();
  };

  return (
    <Modal open={open} title={record ? `Editar ${collection}` : `Novo registro · ${collection}`} onClose={onClose} size="large">
      <form className="form-grid" onSubmit={save}>
        {fields.map((key) => {
          const booleanField = typeof sample[key] === 'boolean';
          const inputType = key === 'senha'
            ? 'password'
            : typeof sample[key] === 'number'
              ? 'number'
              : key === 'data'
                ? 'date'
                : 'text';
          return (
            <div className={`field-group${key === 'descricao' || key === 'mensagem' ? ' field-span-2' : ''}`} key={key}>
              {booleanField ? (
                <label className="checkbox-label catalog-checkbox">
                  <input type="checkbox" checked={Boolean(values[key])} onChange={(event) => setValues({ ...values, [key]: event.target.checked })} />
                  <span>{fieldLabels[key] || key}</span>
                </label>
              ) : (
                <>
                  <label className="field-label" htmlFor={`catalog-${key}`}>{fieldLabels[key] || key.replace(/^id/, 'Vínculo: ')} *</label>
                  {key === 'descricao' || key === 'mensagem' || key === 'observacao' ? (
                    <textarea id={`catalog-${key}`} rows="3" value={values[key] || ''} onChange={(event) => setValues({ ...values, [key]: event.target.value })} />
                  ) : (
                    <input id={`catalog-${key}`} type={inputType} min={inputType === 'number' ? 0 : undefined} value={values[key] ?? ''} onChange={(event) => setValues({ ...values, [key]: event.target.value })} />
                  )}
                </>
              )}
            </div>
          );
        })}
        {error && <p className="form-error field-span-2" role="alert">{error}</p>}
        <div className="modal-actions field-span-2">
          <button type="button" className="button button-quiet" onClick={onClose}>Cancelar</button>
          <button type="submit" className="button button-primary">Salvar alterações</button>
        </div>
      </form>
    </Modal>
  );
}

export default CatalogRecordDialog;
