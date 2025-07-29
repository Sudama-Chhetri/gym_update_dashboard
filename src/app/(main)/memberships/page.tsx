'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import MembershipDrawer from '@/components/memberships/MembershipDrawer';
import MembershipCard from '@/components/memberships/MembershipCard';
import { getMemberships } from '@/lib/supabase/membership';

import { Membership } from "@/types"

export default function MembershipsPage() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editData, setEditData] = useState<Membership | null>(null);

  const fetchMemberships = async () => {
    const data = await getMemberships();
    setMemberships(data);
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Memberships</h1>
        <Button onClick={() => { setEditData(null); setOpenDrawer(true); }}>
          <Plus className="mr-2" /> Add Membership
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {memberships.map((membership) => (
          <MembershipCard
            key={membership.id}
            membership={membership}
            onEdit={(data: Membership) => { setEditData(data); setOpenDrawer(true); }}
            onDelete={fetchMemberships}
          />
        ))}
      </div>

      <MembershipDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        onSave={fetchMemberships}
        editData={editData}
      />
    </div>
  );
}
