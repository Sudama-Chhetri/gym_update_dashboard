import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteMembership } from '@/lib/supabase/membership';

import { Membership } from "@/types"

interface MembershipCardProps {
  membership: Membership;
  onEdit: (membership: Membership) => void;
  onDelete: () => void;
}

export default function MembershipCard({ membership, onEdit, onDelete }: MembershipCardProps) {
  const handleDelete = async () => {
    await deleteMembership(membership.id);
    onDelete();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <Card className="p-4 flex flex-col justify-between">
      <CardContent className="space-y-2">
        <p className="text-lg font-semibold">
          {membership.duration} {Number(membership.duration) === 1 ? 'month' : 'months'}
        </p>
        <p className="text-gray-500 italic">Category: {membership.category}</p>
        <p className="text-gray-700">₹ {formatPrice(membership.pricing)}</p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={() => onEdit(membership)}><Pencil size={16} /></Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}><Trash2 size={16} /></Button>
        </div>
      </CardContent>
    </Card>
  );
}