// app/(main)/trainers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TrainerCard from '@/components/trainers/TrainerCard';
import TrainerDrawer from '@/components/trainers/TrainerDrawer';
import { getTrainers, deleteTrainer } from '@/lib/supabase/trainer';
import { Input } from '@/components/ui/input';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');

  const fetchTrainers = async () => {
    const data = await getTrainers();
    setTrainers(data);
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const filteredTrainers = trainers.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Trainers</h1>
        <Button onClick={() => { setEditData(null); setOpenDrawer(true); }}>
          <Plus className="mr-2" /> Add Trainer
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {filteredTrainers.map((trainer) => (
          <TrainerCard
            key={trainer.trainer_id}
            trainer={trainer}
            onEdit={(t) => { setEditData(t); setOpenDrawer(true); }}
            onDelete={async (id) => {
              await deleteTrainer(id);
              fetchTrainers();
            }}
          />
        ))}
      </div>

      <TrainerDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onSave={fetchTrainers}
        editData={editData}
      />
    </div>
  );
}
