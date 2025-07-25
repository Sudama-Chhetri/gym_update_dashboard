import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { addProduct, updateProduct } from '@/lib/supabase/product';

export default function ProductDrawer({ open, onClose, onSave, editData }) {
  const [form, setForm] = useState({
    name: '',
    cost_price: '',
    selling_price: '',
    mrp: '',
    stock: '',
    tax: '',
    img_url: '',
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        cost_price: editData.cost_price.toString(),
        selling_price: editData.selling_price.toString(),
        mrp: editData.mrp.toString(),
        stock: editData.stock.toString(),
        tax: editData.tax.toString(),
        img_url: editData.img_url || '',
      });
    } else {
      setForm({
        name: '',
        cost_price: '',
        selling_price: '',
        mrp: '',
        stock: '',
        tax: '',
        img_url: '',
      });
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    const data = {
      name: form.name,
      cost_price: parseInt(form.cost_price),
      selling_price: parseInt(form.selling_price),
      mrp: parseInt(form.mrp),
      stock: parseInt(form.stock),
      tax: parseInt(form.tax),
      img_url: form.img_url,
    };

    if (editData) {
      await updateProduct(editData.product_id, data);
    } else {
      await addProduct(data);
    }

    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit product' : 'Add a new product'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {[
            { name: 'name', type: 'text' },
            { name: 'cost_price', type: 'number' },
            { name: 'selling_price', type: 'number' },
            { name: 'mrp', type: 'number' },
            { name: 'stock', type: 'number' },
            { name: 'tax', type: 'number' },
            { name: 'img_url', type: 'text' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1 capitalize">{field.name.replace('_', ' ')}</label>
              <Input
                type={field.type}
                placeholder={field.type === 'number' ? '0' : ' '}
                min={field.type === 'number' ? 0 : undefined}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              />
            </div>
          ))}
          <Button className="w-full" onClick={handleSubmit}>
            {editData ? 'Update' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}