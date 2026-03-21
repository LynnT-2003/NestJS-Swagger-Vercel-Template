import { DatabaseConfig } from './types/env';

export function buildMongoUri(dbConfig: DatabaseConfig): string {
  const { username, password, clusterUrl, appDatabaseName } = dbConfig;
  const [base, query] = clusterUrl.split('?');
  const cleanBase = base.replace(/\/[^/]*$/, '').replace(/\/$/, '');
  return `mongodb+srv://${username}:${password}@${cleanBase}/${appDatabaseName}${query ? '?' + query : ''}`;
}
