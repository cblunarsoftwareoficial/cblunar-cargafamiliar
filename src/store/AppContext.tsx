import { createContext, useContext, useState, useEffect } from 'react';
import type { Trabajador, CargaFamiliar, Empresa } from '../types';

const API_URL = 'http://CBlunar-Carga-env.eba-z2c8rfbr.us-east-1.elasticbeanstalk.com/api';

interface AppContextType {
  empresas: Empresa[];
  addEmpresa: (empresa: Omit<Empresa, 'id'>) => Promise<void>;
  removeEmpresa: (id: string) => Promise<void>;
  trabajadores: Trabajador[];
  addTrabajador: (t: Omit<Trabajador, 'id'>) => Promise<void>;
  removeTrabajador: (id: string) => Promise<void>;
  cargas: CargaFamiliar[];
  addCarga: (c: Omit<CargaFamiliar, 'id'>) => Promise<void>;
  removeCarga: (id: string) => Promise<void>;
  loadData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [cargas, setCargas] = useState<CargaFamiliar[]>([]);

  const getToken = () => localStorage.getItem('cb_lunar_token');

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  });

  const loadData = async () => {
    const token = getToken();
    if (!token) {
      setEmpresas([]);
      setTrabajadores([]);
      setCargas([]);
      return;
    }

    try {
      const [empRes, trabRes, cargRes] = await Promise.all([
        fetch(`${API_URL}/empresas`, { headers: getHeaders() }),
        fetch(`${API_URL}/trabajadores`, { headers: getHeaders() }),
        fetch(`${API_URL}/cargas`, { headers: getHeaders() })
      ]);

      if (empRes.ok) setEmpresas(await empRes.json());
      if (trabRes.ok) setTrabajadores(await trabRes.json());
      if (cargRes.ok) setCargas(await cargRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    // Escuchar cambios de autenticación
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    // Load initial data
    loadData();

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addEmpresa = async (e: Omit<Empresa, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/empresas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(e)
      });
      if (res.ok) {
        const newEmp = await res.json();
        setEmpresas(prev => [newEmp, ...prev]);
      } else {
        let errMsg = 'Error al crear empresa';
        try { const errData = await res.json(); errMsg = errData.error || errMsg; } catch(e){}
        throw new Error(errMsg);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const removeEmpresa = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/empresas/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setEmpresas(prev => prev.filter(e => e.id !== id));
      } else {
        throw new Error('Error al eliminar empresa');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  const addTrabajador = async (t: Omit<Trabajador, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/trabajadores`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(t)
      });
      if (res.ok) {
        const newTrab = await res.json();
        setTrabajadores(prev => [newTrab, ...prev]);
      } else {
        throw new Error('Error al crear trabajador');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const removeTrabajador = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/trabajadores/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setTrabajadores(prev => prev.filter(t => t.id !== id));
      } else {
        throw new Error('Error al eliminar trabajador');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  const addCarga = async (c: Omit<CargaFamiliar, 'id'>) => {
    try {
      const res = await fetch(`${API_URL}/cargas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(c)
      });
      if (res.ok) {
        const newCarga = await res.json();
        setCargas(prev => [newCarga, ...prev]);
      } else {
        throw new Error('Error al crear carga');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const removeCarga = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/cargas/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setCargas(prev => prev.filter(c => c.id !== id));
      } else {
        throw new Error('Error al eliminar carga');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      empresas, addEmpresa, removeEmpresa,
      trabajadores, addTrabajador, removeTrabajador,
      cargas, addCarga, removeCarga,
      loadData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
