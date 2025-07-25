// app/(main)/food/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import FoodDrawer from '@/components/food/FoodDrawer';
import { getFoodItems, deleteFoodItem } from '@/lib/supabase/food';
import { Input } from '@/components/ui/input';

export default function FoodPage() {
  const [foodItems, setFoodItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchFood = async () => {
    const data = await getFoodItems();
    setFoodItems(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchFood();
  }, []);

  useEffect(() => {
    let temp = [...foodItems];
    if (search.trim()) {
      temp = temp.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.food_id.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortKey) {
      temp.sort((a, b) => sortOrder === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]);
    }
    setFiltered(temp);
    setPage(1);
  }, [search, sortKey, sortOrder, foodItems]);

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
        <h1 className="text-2xl font-bold">Food Items</h1>
        <Button onClick={() => { setEditData(null); setOpenDrawer(true); }}>
          <Plus className="mr-2" /> Add Food Item
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
              <th className="p-2 text-left cursor-pointer select-none" onClick={() => handleSort('cost')}>
                Cost <SortIcon column="cost" />
              </th>
              <th className="p-2 text-left">Tax (%)</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((food) => (
              <tr key={food.food_id} className="border-t">
                <td className="p-2">{food.food_id}</td>
                <td className="p-2">{food.name}</td>
                <td className="p-2">Rs. {food.cost}</td>
                <td className="p-2">{food.tax}%</td>
                <td className="p-2">
                  <Button size="sm" onClick={() => { setEditData(food); setOpenDrawer(true); }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    await deleteFoodItem(food.food_id);
                    fetchFood();
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

      <FoodDrawer
        open={openDrawer}
        onClose={() => { setEditData(null); setOpenDrawer(false); }}
        onSave={fetchFood}
        editData={editData}
      />
    </div>
  );
}
