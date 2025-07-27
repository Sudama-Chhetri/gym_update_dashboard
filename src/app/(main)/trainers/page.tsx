'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TrainerCard from '@/components/trainers/TrainerCard';
import TrainerDrawer from '@/components/trainers/TrainerDrawer';
import { getTrainers, deleteTrainer, getMembersByTrainer } from '@/lib/supabase/trainer';
import { Input } from '@/components/ui/input';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');

  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [assignedMembers, setAssignedMembers] = useState([]);
  const [showMemberPopup, setShowMemberPopup] = useState(false);

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

  const handleViewMembers = async (trainer) => {
    const members = await getMembersByTrainer(trainer.trainer_id);
    setSelectedTrainer(trainer);
    setAssignedMembers(members);
    setShowMemberPopup(true);
  };

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
            onViewMembers={handleViewMembers} // 👈 added
          />
        ))}
      </div>

      <TrainerDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onSave={fetchTrainers}
        editData={editData}
      />

      {/* 👇 Assigned Members Popup */}
      {showMemberPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Members Assigned to {selectedTrainer?.name}
            </h2>
            {assignedMembers.length === 0 ? (
              <p>No members assigned.</p>
            ) : (
              <ul className="space-y-1 list-disc list-inside">
              {assignedMembers.map((member, idx) => (
                <li key={idx} className="text-sm">{member.name}</li>
              ))}
            </ul>
            )}
            <Button
              className="mt-4"
              onClick={() => setShowMemberPopup(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
