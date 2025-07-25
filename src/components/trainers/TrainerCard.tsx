// components/trainers/TrainerCard.tsx

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TrainerCard({ trainer, onEdit, onDelete }) {
  return (
    <Card className="w-full max-w-sm border shadow-sm">
      <CardContent className="p-4 space-y-2">
        <h3 className="text-xl font-semibold">{trainer.name}</h3>
        <p className="text-sm text-muted-foreground">{trainer.email}</p>
        <p className="text-sm">📞 {trainer.contact}</p>
        <p className="text-sm">🎂 Age: {trainer.age}</p>
        <p className="text-sm font-medium">💰 Cost: ₹{trainer.cost}</p>

        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={() => onEdit(trainer)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(trainer.trainer_id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
