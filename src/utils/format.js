export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR').format(date);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const [date, time = ''] = String(value).split(' ');
  return `${formatDate(date)}${time ? ` às ${time.slice(0, 5)}` : ''}`;
}

export function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toDateTimeValue(date = new Date()) {
  const dateValue = toDateInputValue(date);
  const timeValue = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  return `${dateValue} ${timeValue}`;
}

export function getService(data, id) {
  return data.Servicos.find((service) => service.id === id);
}

export function getVehicle(data, id) {
  const vehicle = data.Veiculos.find((item) => item.id === id);
  if (!vehicle) return null;
  const model = data.Modelos.find((item) => item.id === vehicle.idModelo);
  const brand = data.Marcas.find((item) => item.id === model?.idMarca);
  const color = data.Cores.find((item) => item.id === vehicle.idCor);
  const category = data.CategoriasVeiculo.find((item) => item.id === vehicle.idCategoriaVeiculo);
  return { ...vehicle, model, brand, color, category };
}

export function getCustomerUser(data, customerId) {
  const customer = data.Clientes.find((item) => item.id === customerId);
  return data.Usuarios.find((user) => user.id === customer?.idUsuario);
}

export function getCustomerIdForSession(data, session) {
  if (session.role === 'cliente') return session.profileId;
  const customer = data.Clientes.find((item) => item.idUsuario === session.userId);
  return customer?.id || data.Clientes[0]?.id;
}

export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
