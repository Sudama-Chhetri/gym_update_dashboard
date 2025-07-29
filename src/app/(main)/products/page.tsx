// app/(main)/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import ProductDrawer from '@/components/products/ProductDrawer';
import { getProducts } from '@/lib/supabase/product';
import { Input } from '@/components/ui/input';

interface Product {
  product_id: string;
  name: string;
  cost_price: number;
  selling_price: number;
  mrp: number;
  stock: number;
  tax: number;
  [key: string]: string | number; // Add index signature
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editData, setEditData] = useState<Product | null>(null);

  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let temp = [...products];
    if (search.trim()) {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.product_id.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortKey) {
      temp.sort((a, b) => sortOrder === 'asc' ? (a[sortKey] as number) - (b[sortKey] as number) : (b[sortKey] as number) - (a[sortKey] as number));
    }
    setFiltered(temp);
    setPage(1);
  }, [search, sortKey, sortOrder, products]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => (
    sortKey === column ? (
      sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
    ) : null
  );

  const paginated = filtered.slice((page - 1) * 10, page * 10);
  const totalPages = Math.ceil(filtered.length / 10);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => { setEditData(null); setOpenDrawer(true); }}>
          <Plus className="mr-2" /> Add Product
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search by ID or Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => handleSort('cost_price')}>
                Cost Price <SortIcon column="cost_price" />
              </th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => handleSort('selling_price')}>
                Selling Price <SortIcon column="selling_price" />
              </th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => handleSort('mrp')}>
                MRP <SortIcon column="mrp" />
              </th>
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => handleSort('stock')}>
                Stock <SortIcon column="stock" />
              </th>
              <th className="p-2 text-left">Tax</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((product) => (
              <tr key={product.product_id} className="border-t">
                <td className="p-2">{product.product_id}</td>
                <td className="p-2">{product.name}</td>
                <td className="p-2">Rs. {product.cost_price}</td>
                <td className="p-2">Rs. {product.selling_price}</td>
                <td className="p-2">Rs. {product.mrp}</td>
                <td className="p-2">{product.stock}</td>
                <td className="p-2">{product.tax}%</td>
                <td className="p-2">
                  <Button size="sm" onClick={() => { setEditData(product); setOpenDrawer(true); }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    await import('@/lib/supabase/product').then(({ deleteProduct }) => deleteProduct(product.product_id));
                    fetchProducts();
                  }}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
          <Button size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
        </div>
      </div>

      <ProductDrawer
        open={openDrawer}
        onClose={() => { setEditData(null); setOpenDrawer(false); }}
        onSave={fetchProducts}
        editData={editData}
      />
    </div>
  );
}
