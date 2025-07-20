import { getAuth } from '@clerk/nextjs/server';
import { getConnection, sql } from '@/lib/db';

export async function GET(req) {
  const { userId } = getAuth(req);
  if (!userId) return new Response('Unauthorized', { status: 401 });

  const pool = await getConnection();
  // Get user DB id
  const userRes = await pool.request()
    .input('clerk_user_id', sql.NVarChar, userId)
    .query('SELECT id FROM users WHERE clerk_user_id = @clerk_user_id');
  if (!userRes.recordset[0]) return new Response(JSON.stringify([]), { status: 200 });
  const dbUserId = userRes.recordset[0].id;

  // Get transactions
  const result = await pool.request()
    .input('user_id', sql.Int, dbUserId)
    .query('SELECT * FROM transactions WHERE user_id = @user_id ORDER BY date DESC');
  return new Response(JSON.stringify(result.recordset), { status: 200 });
}

export async function POST(req) {
  const { userId } = getAuth(req);
  if (!userId) return new Response('Unauthorized', { status: 401 });
  const { amount, category, type, description, date } = await req.json();
  const pool = await getConnection();
  // Ensure user exists in DB
  let userRes = await pool.request()
    .input('clerk_user_id', sql.NVarChar, userId)
    .query('SELECT id FROM users WHERE clerk_user_id = @clerk_user_id');
  let dbUserId;
  if (!userRes.recordset[0]) {
    // Insert user
    const insertUser = await pool.request()
      .input('clerk_user_id', sql.NVarChar, userId)
      .query('INSERT INTO users (clerk_user_id) OUTPUT INSERTED.id VALUES (@clerk_user_id)');
    dbUserId = insertUser.recordset[0].id;
  } else {
    dbUserId = userRes.recordset[0].id;
  }
  // Insert transaction
  await pool.request()
    .input('user_id', sql.Int, dbUserId)
    .input('amount', sql.Decimal(18,2), amount)
    .input('category', sql.NVarChar, category)
    .input('type', sql.NVarChar, type)
    .input('description', sql.NVarChar, description)
    .input('date', sql.DateTime, date ? new Date(date) : new Date())
    .query('INSERT INTO transactions (user_id, amount, category, type, description, date) VALUES (@user_id, @amount, @category, @type, @description, @date)');
  return new Response('Created', { status: 201 });
}

// For PUT and DELETE, you may want to use /api/transactions/[id]/route.js for RESTful design. 