import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://auoojoyaadwjavkjmwcj.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1b29qb3lhYWR3amF2a2ptd2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODMxNjAsImV4cCI6MjEwMjk1OTE2MH0.-LUmn2-Da_pte-6i15O2xewjlQ-zZ5nqilIJII2dzsI';

export function getStoredCredentials() {
  const storedUrl = localStorage.getItem('supabase_url');
  const storedKey = localStorage.getItem('supabase_anon_key');
  return {
    url: storedUrl || DEFAULT_SUPABASE_URL,
    key: storedKey || DEFAULT_SUPABASE_ANON_KEY
  };
}

export function createCustomClient(url, key) {
  return createClient(url, key);
}

export const supabase = createClient(
  getStoredCredentials().url,
  getStoredCredentials().key
);

/**
 * Fetch all rows from a PostgREST table with automatic pagination
 */
export async function fetchAllFromTable(client, tableName) {
  let allRows = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);
      
    if (error) {
      console.error(`Error fetching table ${tableName}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < pageSize) break;
    page++;
  }
  
  return allRows;
}

/**
 * Fetch all core dashboard datasets in parallel
 */
export async function fetchDashboardData(customUrl, customKey) {
  const client = (customUrl && customKey)
    ? createClient(customUrl, customKey)
    : supabase;

  const [ordersRes, usersRes, productsRes, destsRes] = await Promise.allSettled([
    fetchAllFromTable(client, 'orders'),
    fetchAllFromTable(client, 'users'),
    fetchAllFromTable(client, 'products'),
    fetchAllFromTable(client, 'destinations')
  ]);

  return {
    orders: ordersRes.status === 'fulfilled' ? ordersRes.value : [],
    users: usersRes.status === 'fulfilled' ? usersRes.value : [],
    products: productsRes.status === 'fulfilled' ? productsRes.value : [],
    destinations: destsRes.status === 'fulfilled' ? destsRes.value : [],
    errors: {
      orders: ordersRes.status === 'rejected' ? ordersRes.reason?.message : null,
      users: usersRes.status === 'rejected' ? usersRes.reason?.message : null,
      products: productsRes.status === 'rejected' ? productsRes.reason?.message : null,
      destinations: destsRes.status === 'rejected' ? destsRes.reason?.message : null,
    }
  };
}
