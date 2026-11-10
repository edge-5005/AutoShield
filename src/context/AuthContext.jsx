import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(() => {
    try {
      const saved = localStorage.getItem('autoshield_active_company');
      return saved ? JSON.parse(saved) : {
        id: 1,
        name: 'Apex Auto Detailing Studio',
        tagline: 'Premium Paint Correction & Ceramic Studio',
        phone: '+91 98765 43210',
        email: 'contact@apexdetailing.com',
        bays_count: 4,
        state_name: 'Karnataka'
      };
    } catch {
      return { id: 1, name: 'Apex Auto Detailing Studio' };
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('autoshield_active_role') || 'admin'; // 'admin' | 'front_office'
  });

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const list = await api.getCompanies();
      if (list && list.length > 0) {
        setCompanies(list);
        // If current company matches one in the list, refresh details
        const found = list.find(c => c.id === currentCompany.id);
        if (found) {
          setCurrentCompany(found);
          localStorage.setItem('autoshield_active_company', JSON.stringify(found));
        }
      }
    } catch (err) {
      console.warn('Could not load companies list:', err);
    }
  };

  const switchCompany = (company) => {
    setCurrentCompany(company);
    localStorage.setItem('autoshield_active_company', JSON.stringify(company));
  };

  const updateCurrentCompany = (updates) => {
    setCurrentCompany(prev => {
      const merged = { ...prev, ...updates };
      localStorage.setItem('autoshield_active_company', JSON.stringify(merged));
      return merged;
    });
  };

  const switchRole = (role) => {
    setCurrentRole(role);
    localStorage.setItem('autoshield_active_role', role);
  };

  const registerNewCompany = async (formData) => {
    const res = await api.registerCompany(formData);
    if (res && res.company) {
      setCurrentCompany(res.company);
      localStorage.setItem('autoshield_active_company', JSON.stringify(res.company));
      setCurrentRole('admin');
      localStorage.setItem('autoshield_active_role', 'admin');
      await loadCompanies();
      return res;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        companies,
        currentCompany,
        currentRole,
        isAdmin: currentRole === 'admin',
        isFrontOffice: currentRole === 'front_office',
        switchCompany,
        updateCurrentCompany,
        switchRole,
        registerNewCompany,
        loadCompanies,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        isRoleModalOpen,
        setIsRoleModalOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
