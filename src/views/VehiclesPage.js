import React, { useMemo, useState } from 'react';
import { Add, DirectionsCar, Search } from '@mui/icons-material';
import Modal from '../components/Modal';
import { useAppData } from '../context/AppDataContext';
import { getCustomerIdForSession, getVehicle } from '../utils/format';

const emptyVehicle = {
  placa: '',
  ano: String(new Date().getFullYear()),
  idModelo: '',
  idCategoriaVeiculo: '',
  idCor: '',
};

function VehiclesPage({ session }) {
  const { data, createRecord, deleteRecord, updateRecord } = useAppData();
  const customerId = getCustomerIdForSession(data, session);
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [form, setForm] = useState(emptyVehicle);
  const [error, setError] = useState('');

  const vehicles = useMemo(() => data.ClientesVeiculos
    .filter((link) => link.idCliente === customerId)
    .map((link) => getVehicle(data, link.idVeiculo))
    .filter((vehicle) => vehicle?.ativo)
    .filter((vehicle) => {
      const text = `${vehicle.placa} ${vehicle.brand?.nome} ${vehicle.model?.nome} ${vehicle.color?.nome}`.toLowerCase();
      return text.includes(query.toLowerCase());
    }), [data, customerId, query]);

  const openNewVehicle = () => {
    setEditingVehicle(null);
    setForm({ ...emptyVehicle, idModelo: data.Modelos[0]?.id || '', idCategoriaVeiculo: data.CategoriasVeiculo[0]?.id || '', idCor: data.Cores[0]?.id || '' });
    setError('');
    setIsFormOpen(true);
  };

  const openEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      placa: vehicle.placa,
      ano: String(vehicle.ano),
      idModelo: vehicle.idModelo,
      idCategoriaVeiculo: vehicle.idCategoriaVeiculo,
      idCor: vehicle.idCor,
    });
    setError('');
    setIsFormOpen(true);
  };

  const saveVehicle = (event) => {
    event.preventDefault();
    const placa = form.placa.replace(/[^a-z0-9]/gi, '').toUpperCase();
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(placa) && !/^[A-Z]{3}[0-9]{4}$/.test(placa)) {
      setError('Informe uma placa válida (AAA-0000 ou padrão Mercosul AAA0A00).');
      return;
    }
    const values = { ...form, placa, ano: Number(form.ano), ativo: true };
    if (editingVehicle) {
      updateRecord('Veiculos', editingVehicle.id, values);
    } else {
      const vehicle = createRecord('Veiculos', values);
      createRecord('ClientesVeiculos', { idCliente: customerId, idVeiculo: vehicle.id });
    }
    setIsFormOpen(false);
  };

  const confirmDelete = () => {
    if (!vehicleToDelete) return;
    const hasHistory = data.Agendamentos.some((appointment) => appointment.idVeiculo === vehicleToDelete.id);
    if (hasHistory) {
      updateRecord('Veiculos', vehicleToDelete.id, { ativo: false });
    } else {
      deleteRecord('Veiculos', vehicleToDelete.id);
      const link = data.ClientesVeiculos.find((item) => item.idVeiculo === vehicleToDelete.id && item.idCliente === customerId);
      if (link) deleteRecord('ClientesVeiculos', link.id);
    }
    setVehicleToDelete(null);
  };

  const selectedModel = data.Modelos.find((model) => model.id === form.idModelo);
  const selectedBrand = data.Marcas.find((brand) => brand.id === selectedModel?.idMarca);

  return (
    <div className="page-stack">
      <section className="page-intro-row">
        <p className="muted-copy">Mantenha seus veículos atualizados para agilizar os próximos agendamentos.</p>
        <button className="button button-primary" type="button" onClick={openNewVehicle}><Add fontSize="small" /> Cadastrar veículo</button>
      </section>
      <section className="panel filter-panel">
        <label className="search-field"><Search fontSize="small" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por placa, marca ou modelo" /></label>
        <span className="results-count">{vehicles.length} veículo{vehicles.length === 1 ? '' : 's'}</span>
      </section>

      {vehicles.length ? (
        <div className="vehicle-grid">
          {vehicles.map((vehicle) => (
            <article className="vehicle-card" key={vehicle.id}>
              <div className="vehicle-card-art"><DirectionsCar /></div>
              <div className="vehicle-card-content">
                <span className="vehicle-plate">{vehicle.placa}</span>
                <h3>{vehicle.brand?.nome} {vehicle.model?.nome}</h3>
                <p>{vehicle.color?.nome} · {vehicle.category?.nome} · {vehicle.ano}</p>
                <div className="vehicle-card-actions">
                  <button type="button" className="button button-outline button-small" onClick={() => openEditVehicle(vehicle)}>Atualizar</button>
                  <button type="button" className="button button-quiet button-small" onClick={() => setVehicleToDelete(vehicle)}>Excluir</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state panel"><span className="empty-icon"><DirectionsCar /></span><h2>Nenhum veículo encontrado</h2><p>Cadastre um veículo para agilizar seus agendamentos.</p></section>
      )}

      <Modal open={isFormOpen} title={editingVehicle ? 'Atualizar veículo' : 'Cadastrar veículo'} onClose={() => setIsFormOpen(false)}>
        <form className="form-grid" onSubmit={saveVehicle}>
          <div className="field-group field-span-2"><label className="field-label" htmlFor="vehicle-plate">Placa *</label><input id="vehicle-plate" value={form.placa} onChange={(event) => setForm({ ...form, placa: event.target.value.toUpperCase() })} placeholder="ABC1D23" required /></div>
          <div className="field-group"><label className="field-label" htmlFor="vehicle-year">Ano *</label><input id="vehicle-year" type="number" min="1950" max={new Date().getFullYear() + 1} value={form.ano} onChange={(event) => setForm({ ...form, ano: event.target.value })} required /></div>
          <div className="field-group"><label className="field-label" htmlFor="vehicle-model">Modelo *</label><select id="vehicle-model" value={form.idModelo} onChange={(event) => setForm({ ...form, idModelo: event.target.value })} required>{data.Modelos.filter((item) => item.ativo).map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</select></div>
          <div className="field-group"><label className="field-label" htmlFor="vehicle-brand">Marca</label><input id="vehicle-brand" value={selectedBrand?.nome || 'Derivada do modelo'} readOnly /></div>
          <div className="field-group"><label className="field-label" htmlFor="vehicle-category">Categoria *</label><select id="vehicle-category" value={form.idCategoriaVeiculo} onChange={(event) => setForm({ ...form, idCategoriaVeiculo: event.target.value })} required>{data.CategoriasVeiculo.filter((item) => item.ativo).map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</select></div>
          <div className="field-group field-span-2"><label className="field-label" htmlFor="vehicle-color">Cor *</label><select id="vehicle-color" value={form.idCor} onChange={(event) => setForm({ ...form, idCor: event.target.value })} required>{data.Cores.filter((item) => item.ativo).map((item) => <option value={item.id} key={item.id}>{item.nome}</option>)}</select></div>
          {error && <p className="form-error field-span-2" role="alert">{error}</p>}
          <div className="modal-actions field-span-2"><button type="button" className="button button-quiet" onClick={() => setIsFormOpen(false)}>Cancelar</button><button type="submit" className="button button-primary">Salvar veículo</button></div>
        </form>
      </Modal>
      <Modal open={Boolean(vehicleToDelete)} title="Excluir veículo" onClose={() => setVehicleToDelete(null)}>
        <p>Deseja excluir o veículo <strong>{vehicleToDelete?.placa}</strong>? O histórico de atendimentos será preservado.</p>
        <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setVehicleToDelete(null)}>Voltar</button><button type="button" className="button button-danger" onClick={confirmDelete}>Excluir veículo</button></div>
      </Modal>
    </div>
  );
}

export default VehiclesPage;
