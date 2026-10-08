import axios from 'axios';

// Adicione o "export" aqui na frente
export const BASE_URL = 'http://localhost:3001'; // ou a URL do my-json-server se voltar ao ar

const api = axios.create({
    baseURL: BASE_URL,
});

export default api;

//'https://my-json-server.typicode.com/marcoaparaujo/jsonfake';
//'https://my-json-server.typicode.com/ViniFodaoDosGames/jsonfake'