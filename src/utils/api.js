const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Customers
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: data }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: data }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Vehicles
  getVehicles: (search = '') => request(`/vehicles${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getVehicle: (id) => request(`/vehicles/${id}`),
  lookupVehicle: (query) => request('/vehicles/lookup', { method: 'POST', body: { query } }),
  getVehicleCatalog: () => request('/vehicles/catalog'),
  createVehicle: (data) => request('/vehicles', { method: 'POST', body: data }),
  updateVehicle: (id, data) => request(`/vehicles/${id}`, { method: 'PUT', body: data }),
  deleteVehicle: (id) => request(`/vehicles/${id}`, { method: 'DELETE' }),

  // Services
  getServices: () => request('/services'),
  createService: (data) => request('/services', { method: 'POST', body: data }),
  updateService: (id, data) => request(`/services/${id}`, { method: 'PUT', body: data }),
  deleteService: (id) => request(`/services/${id}`, { method: 'DELETE' }),

  // Jobs
  getJobs: (status = 'all') => request(`/jobs?status=${status}`),
  getJob: (id) => request(`/jobs/${id}`),
  createJob: (data) => request('/jobs', { method: 'POST', body: data }),
  updateJob: (id, data) => request(`/jobs/${id}`, { method: 'PUT', body: data }),
  deleteJob: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),

  // Invoices & Estimates
  getInvoices: (type = 'all') => request(`/invoices?type=${type}`),
  getInvoice: (id) => request(`/invoices/${id}`),
  createInvoice: (data) => request('/invoices', { method: 'POST', body: data }),
  payInvoice: (id, data) => request(`/invoices/${id}/pay`, { method: 'POST', body: data }),
  convertToInvoice: (id) => request(`/invoices/${id}/convert-to-invoice`, { method: 'POST' }),
  deleteInvoice: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),

  // Reminders
  getReminders: (status = 'all') => request(`/reminders?status=${status}`),
  updateReminder: (id, data) => request(`/reminders/${id}`, { method: 'PUT', body: data }),
  createReminder: (data) => request('/reminders', { method: 'POST', body: data }),
  deleteReminder: (id) => request(`/reminders/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: data }),

  // Car Accessories
  getAccessories: (category = 'all', search = '') => request(`/accessories?category=${category}&search=${encodeURIComponent(search)}`),
  createAccessory: (data) => request('/accessories', { method: 'POST', body: data }),
  updateAccessory: (id, data) => request(`/accessories/${id}`, { method: 'PUT', body: data }),
  deleteAccessory: (id) => request(`/accessories/${id}`, { method: 'DELETE' }),
  resetDefaultAccessories: () => request('/accessories/reset-defaults', { method: 'POST' }),

  // AD Campaigns
  getAdCampaigns: () => request('/ads'),
  getAdAnalytics: () => request('/ads/analytics'),
  createAdCampaign: (data) => request('/ads', { method: 'POST', body: data }),
  updateAdCampaign: (id, data) => request(`/ads/${id}`, { method: 'PUT', body: data }),
  deleteAdCampaign: (id) => request(`/ads/${id}`, { method: 'DELETE' }),

  // Accounts & Profit/Loss
  getAccountSummary: () => request('/accounts/summary'),
  simulatePnL: (data) => request('/accounts/manual-simulation', { method: 'POST', body: data }),
  getExpenses: () => request('/accounts/expenses'),
  createExpense: (data) => request('/accounts/expenses', { method: 'POST', body: data }),
  updateExpense: (id, data) => request(`/accounts/expenses/${id}`, { method: 'PUT', body: data }),
  deleteExpense: (id) => request(`/accounts/expenses/${id}`, { method: 'DELETE' }),

  // Companies & Multi-Tenant Commercial Profile
  getCompanies: () => request('/companies'),
  getCompany: (id) => request(`/companies/${id}`),
  registerCompany: (data) => request('/companies/register', { method: 'POST', body: data }),
  loginCompany: (data) => request('/companies/login', { method: 'POST', body: data }),
  updateCompany: (id, data) => request(`/companies/${id}`, { method: 'PUT', body: data }),
};
