import { executeQuery } from '../infrastructure/datamart-datasource.ts';

export async function executeDefaultQuery() {
  return await executeQuery('SELECT COUNT(*) FROM public.data_ref_academies');
}
