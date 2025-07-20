import sql from 'mssql';

const config = {
  user: 'YOUR_DB_USER',
  password: 'YOUR_DB_PASSWORD',
  server: 'YOUR_DB_SERVER', // e.g., 'localhost'
  database: 'FinanceBuddy',
  options: {
    encrypt: true, // for Azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

let connectionPool = null;

export async function getConnection() {
  if (connectionPool) {
    return connectionPool;
  }
  try {
    connectionPool = await sql.connect(config);
    return connectionPool;
  } catch (err) {
    connectionPool = null;
    throw err;
  }
}

export { sql }; 