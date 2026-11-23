import axios from 'axios';
import { BASE_URL } from './axios';

const cabecalho = { headers: { 'Content-Type': 'application/json' } };

export async function carregar(colecoes) {
  const respostas = await Promise.all(
    colecoes.map((colecao) => axios.get(`${BASE_URL}/${colecao}`))
  );
  const dados = {};
  colecoes.forEach((colecao, i) => {
    dados[colecao] = respostas[i].data;
  });
  return dados;
}

export async function buscarPorId(colecao, id) {
  const resposta = await axios.get(`${BASE_URL}/${colecao}/${id}`);
  return resposta.data;
}

export async function inserir(colecao, dados) {
  const resposta = await axios.post(`${BASE_URL}/${colecao}`, JSON.stringify(dados), cabecalho);
  return resposta.data;
}

export async function alterar(colecao, id, campos) {
  const resposta = await axios.patch(`${BASE_URL}/${colecao}/${id}`, JSON.stringify(campos), cabecalho);
  return resposta.data;
}

export async function remover(colecao, id) {
  await axios.delete(`${BASE_URL}/${colecao}/${id}`);
}

export async function emUso(ligacoes, id) {
  for (const [colecao, campo] of ligacoes) {
    const resposta = await axios.get(`${BASE_URL}/${colecao}`);
    if (resposta.data.some((item) => item[campo] === id)) {
      return true;
    }
  }
  return false;
}

export async function removerLigacoes(colecao, campo, id) {
  const resposta = await axios.get(`${BASE_URL}/${colecao}`);
  for (const item of resposta.data) {
    if (item[campo] === id) {
      await remover(colecao, item.id);
    }
  }
}
