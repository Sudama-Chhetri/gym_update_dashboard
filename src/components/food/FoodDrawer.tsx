// components/food/FoodDrawer.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { addFoodItem, updateFoodItem } from '@/lib/supabase/food';

export default function FoodDrawer({ open, onClose, onSave, editData }) {
  const [form, setForm] = useState({
    name: '',
    cost: '',
    tax: '',
    img_url: '',
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        cost: editData.cost.toString(),
        tax: editData.tax.toString(),
        img_url: editData.img_url || '',
      });
    } else {
      setForm({ name: '', cost: '', tax: '', img_url: '' });
    }
  }, [editData, open]);

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      cost: parseInt(form.cost),
      tax: parseInt(form.tax),
      img_url: form.img_url,
    };
    if (editData) {
      await updateFoodItem(editData.food_id, payload);
    } else {
      await addFoodItem(payload);
    }
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Food Item' : 'Add a New Food Item'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {[{ name: 'name' }, { name: 'cost' }, { name: 'tax' }, { name: 'img_url' }].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1 capitalize">{field.name.replace('_', ' ')}</label>
              <Input
                type={field.name === 'name' || field.name === 'img_url' ? 'text' : 'number'}
                placeholder={field.name === 'img_url' ? 'Optional URL' : ''}
                min={field.name !== 'img_url' ? 0 : undefined}
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
