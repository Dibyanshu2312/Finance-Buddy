import { getAuth } from '@clerk/nextjs/server';
import { getConnection, sql } from '@/lib/db';

export async function PUT(req, { params }) {
  const { userId } = getAuth(req);
  if (!userId) return new Response('Unauthorized', { status: 401 });
  const { id } = params;
  const { amount, category, type, description, date } = await req.json();
  const pool = await getConnection();
  // Get user DB id
  const userRes = await pool.request()
    .input('clerk_user_id', sql.NVarChar, userId)
    .query('SELECT id FROM users WHERE clerk_user_id = @clerk_user_id');
  if (!userRes.recordset[0]) return new Response('Forbidden', { status: 403 });
  const dbUserId = userRes.recordset[0].id;
  // Update transaction (only if it belongs to user)
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('user_id', sql.Int, dbUserId)
    .input('amount', sql.Decimal(18,2), amount)
    .input('category', sql.NVarChar, category)
    .input('type', sql.NVarChar, type)
    .input('description', sql.NVarChar, description)
    .input('date', sql.DateTime, date ? new Date(date) : new Date())
    .query('UPDATE transactions SET amount=@amount, category=@category, type=@type, description=@description, date=@date WHERE id=@id AND user_id=@user_id');
  if (result.rowsAffected[0] === 0) return new Response('Not found or forbidden', { status: 404 });
  return new Response('Updated', { status: 200 });
}

export async function DELETE(req, { params }) {
  const { userId } = getAuth(req);
  if (!userId) return new Response('Unauthorized', { status: 401 });
  const { id } = params;
  const pool = await getConnection();
  // Get user DB id
  const userRes = await pool.request()
    .input('clerk_user_id', sql.NVarChar, userId)
    .query('SELECT id FROM users WHERE clerk_user_id = @clerk_user_id');
  if (!userRes.recordset[0]) return new Response('Forbidden', { status: 403 });
  const dbUserId = userRes.recordset[0].id;
  // Delete transaction (only if it belongs to user)
  const result = await pool.request()
    .input('id', sql.Int, id)
    .input('user_id', sql.Int, dbUserId)
    .query('DELETE FROM transactions WHERE id=@id AND user_id=@user_id');
  if (result.rowsAffected[0] === 0) return new Response('Not found or forbidden', { status: 404 });
  return new Response('Deleted', { status: 200 });
} 