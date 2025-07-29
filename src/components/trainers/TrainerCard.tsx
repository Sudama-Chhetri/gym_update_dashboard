import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trainer } from "@/types"

interface TrainerCardProps {
  trainer: Trainer;
  onEdit: (trainer: Trainer) => void;
  onDelete: (trainerId: string) => void;
  onViewMembers: (trainer: Trainer) => void;
}

export default function TrainerCard({ trainer, onEdit, onDelete, onViewMembers }: TrainerCardProps) {
  return (
    <Card className="w-full max-w-sm border shadow-sm">
      <CardContent className="p-4 space-y-2">
        <h3 className="text-xl font-semibold">{trainer.name}</h3>
        <p className="text-sm text-muted-foreground">{trainer.email}</p>
        <p className="text-sm">📞 {trainer.contact}</p>
        <p className="text-sm">🎂 Age: {trainer.age}</p>
        <p className="text-sm font-medium">💰 Cost: ₹{trainer.cost}</p>

        <div className="flex gap-2 pt-2 flex-wrap">
          <Button size="sm" onClick={() => onEdit(trainer)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(trainer.trainer_id)}>
            Delete
          </Button>
          {onViewMembers && (
            <Button
              size="sm"
              className="bg-cyan-600 text-white hover:bg-cyan-700"
              onClick={() => onViewMembers(trainer)}
            >
              View Assigned Members
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
