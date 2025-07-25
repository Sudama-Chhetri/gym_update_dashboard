import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { addMembership, updateMembership } from '@/lib/supabase/membership';

export default function MembershipDrawer({ open, onClose, onSave, editData }) {
  const [duration, setDuration] = useState('');
  const [pricing, setPricing] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
  if (open && !editData) {
    setDuration('');
    setPricing('');
    setCategory('');
  } else if (editData) {
    setDuration(editData.duration.toString());
    setPricing(editData.pricing.toString());
    setCategory(editData.category || '');
  }
}, [open, editData]);


  const handleSubmit = async () => {
    const dur = parseInt(duration);
    const price = parseInt(pricing);
    if (isNaN(dur) || dur < 0 || isNaN(price) || price < 0 || category.trim() === '') return;

    if (editData) {
      await updateMembership(editData.id, dur, price, category);
    } else {
      await addMembership(dur, price, category);
    }

    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit membership plan' : 'Add a new membership plan'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Duration (in months)</label>
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="" disabled>Select a category</option>
            <option value="single">Single</option>
            <option value="couple">Couple</option>
            <option value="group">Group</option>
            <option value="student">Student</option>
            <option value="senior citizen">Senior Citizen</option>
          </select>
        </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pricing (Rs)</label>
            <Input
              type="number"
              placeholder="0"
              min={0}
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            {editData ? 'Update' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
