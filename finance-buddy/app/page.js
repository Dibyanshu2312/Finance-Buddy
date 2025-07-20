import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useUser } from "@clerk/nextjs";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export default function Dashboard() {
  const { isSignedIn } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ amount: "", category: "", type: "expense", description: "" });
  const [loading, setLoading] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [filter, setFilter] = useState({ type: "", category: "", search: "" });

  useEffect(() => {
    if (isSignedIn) fetchTransactions();
  }, [isSignedIn]);

  async function fetchTransactions() {
    setLoading(true);
    const res = await fetch("/api/transactions");
    if (res.ok) {
      setTransactions(await res.json());
    }
    setLoading(false);
  }

  function getBalance() {
    return transactions.reduce((acc, t) => acc + (t.type === "income" ? +t.amount : -t.amount), 0);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ amount: "", category: "", type: "expense", description: "" });
    await fetchTransactions();
    setLoading(false);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/transactions/${editTx.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editTx),
    });
    setEditTx(null);
    await fetchTransactions();
    setLoading(false);
  }

  async function handleDelete(id) {
    setLoading(true);
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeleteTx(null);
    await fetchTransactions();
    setLoading(false);
  }

  function filteredTransactions() {
    return transactions.filter(tx => {
      if (filter.type && tx.type !== filter.type) return false;
      if (filter.category && !tx.category.toLowerCase().includes(filter.category.toLowerCase())) return false;
      if (filter.search && !(
        tx.category.toLowerCase().includes(filter.search.toLowerCase()) ||
        (tx.description || "").toLowerCase().includes(filter.search.toLowerCase())
      )) return false;
      return true;
    });
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">₹{getBalance().toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
            <Input
              type="text"
              placeholder="Category (e.g. Food, Salary)"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              required
            />
            <select
              className="border rounded-md p-2"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <Input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <Button type="submit" disabled={loading}>Add</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            />
            <Input
              placeholder="Category"
              value={filter.category}
              onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
            />
            <select
              className="border rounded-md p-2"
              value={filter.type}
              onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
            >
              <option value="">All</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions().map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{tx.category}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className={tx.type === "income" ? "text-green-600" : "text-red-600"}>
                      {tx.type === "income" ? "+" : "-"}₹{(+tx.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setEditTx(tx)}>Edit</Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>Edit Transaction</DrawerTitle>
                          </DrawerHeader>
                          <form className="flex flex-col gap-4 p-4" onSubmit={handleEditSubmit}>
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={editTx?.amount || ""}
                              onChange={e => setEditTx(f => ({ ...f, amount: e.target.value }))}
                              required
                            />
                            <Input
                              type="text"
                              placeholder="Category"
                              value={editTx?.category || ""}
                              onChange={e => setEditTx(f => ({ ...f, category: e.target.value }))}
                              required
                            />
                            <select
                              className="border rounded-md p-2"
                              value={editTx?.type || "expense"}
                              onChange={e => setEditTx(f => ({ ...f, type: e.target.value }))}
                            >
                              <option value="expense">Expense</option>
                              <option value="income">Income</option>
                            </select>
                            <Input
                              type="text"
                              placeholder="Description"
                              value={editTx?.description || ""}
                              onChange={e => setEditTx(f => ({ ...f, description: e.target.value }))}
                            />
                            <DrawerFooter>
                              <Button type="submit" disabled={loading}>Save</Button>
                              <DrawerClose asChild>
                                <Button type="button" variant="outline" onClick={() => setEditTx(null)}>Cancel</Button>
                              </DrawerClose>
                            </DrawerFooter>
                          </form>
                        </DrawerContent>
                      </Drawer>
                      <Popover open={deleteTx === tx.id} onOpenChange={open => setDeleteTx(open ? tx.id : null)}>
                        <PopoverTrigger asChild>
                          <Button size="sm" variant="destructive">Delete</Button>
                        </PopoverTrigger>
                        <PopoverContent className="flex flex-col gap-2 w-40">
                          <div>Are you sure?</div>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(tx.id)} disabled={loading}>Yes, Delete</Button>
                          <Button size="sm" variant="outline" onClick={() => setDeleteTx(null)}>Cancel</Button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
