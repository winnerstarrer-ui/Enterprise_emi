import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db, Product } from '@/lib/db';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) return;
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    const ownerId = user!.uid;
    setProducts(await db.products.where('ownerId').equals(ownerId).toArray());
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const ownerId = user!.uid;
    await db.products.add({
      ownerId,
      name: newName,
      createdAt: new Date(),
    });
    toast.success('Product added');
    setNewName('');
    loadProducts();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Products</h1>
      <form onSubmit={addProduct} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Product name"
          className="border p-2 flex-1 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="bg-white p-3 rounded shadow">
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}