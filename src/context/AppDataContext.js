import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import seedData from '../db/db.json';

const STORAGE_KEY = 'glv-mock-data';
const AppDataContext = createContext(null);

function loadInitialData() {
  try {
    const savedData = window.localStorage.getItem(STORAGE_KEY);
    return savedData ? { ...seedData, ...JSON.parse(savedData) } : seedData;
  } catch (error) {
    console.error('Não foi possível carregar os dados locais salvos.', error);
    return seedData;
  }
}

export function AppDataProvider({ children }) {
  const [data, setData] = useState(loadInitialData);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Não foi possível salvar os dados locais.', error);
    }
  }, [data]);

  const updateCollection = useCallback((collection, updater) => {
    setData((current) => ({
      ...current,
      [collection]: updater(current[collection] || []),
    }));
  }, []);

  const createRecord = useCallback((collection, values) => {
    const record = {
      id: `${collection.toLowerCase()}-${Date.now()}`,
      ...values,
    };
    updateCollection(collection, (items) => [...items, record]);
    return record;
  }, [updateCollection]);

  const updateRecord = useCallback((collection, id, values) => {
    updateCollection(collection, (items) =>
      items.map((item) => (item.id === id ? { ...item, ...values } : item))
    );
  }, [updateCollection]);

  const deleteRecord = useCallback((collection, id) => {
    updateCollection(collection, (items) => items.filter((item) => item.id !== id));
  }, [updateCollection]);

  const value = useMemo(
    () => ({ data, updateCollection, createRecord, updateRecord, deleteRecord }),
    [data, updateCollection, createRecord, updateRecord, deleteRecord]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData deve ser usado dentro de AppDataProvider.');
  }
  return context;
}

export function findProfile(data, role) {
  const linkByRole = {
    cliente: {
      profile: data.Clientes[0],
      userId: data.Clientes[0]?.idUsuario,
      profileId: data.Clientes[0]?.id,
    },
    funcionario: {
      profile: data.Funcionarios[0],
      userId: data.Funcionarios[0]?.idUsuario,
      profileId: data.Funcionarios[0]?.id,
    },
    administrador: {
      profile: data.Administradores[0],
      userId: data.Funcionarios.find(
        (employee) => employee.id === data.Administradores[0]?.idFuncionario
      )?.idUsuario,
      profileId: data.Administradores[0]?.id,
    },
  };
  const profile = linkByRole[role];
  const user = data.Usuarios.find((item) => item.id === profile?.userId);
  if (!user || !profile?.profileId) {
    throw new Error(`Não há um usuário de demonstração configurado para ${role}.`);
  }
  return { role, userId: user.id, profileId: profile.profileId, user };
}
