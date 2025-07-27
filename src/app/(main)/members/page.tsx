"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { differenceInDays, isAfter } from "date-fns"
import { useRouter } from "next/navigation"
import MemberDrawer from "@/components/members/MemberDrawer"

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [trainerStatusFilter, setTrainerStatusFilter] = useState("all")
  const [editMember, setEditMember] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    const { data: membersData, error: membersError } = await supabase.from("members").select("*")
    const { data: trainersData, error: trainersError } = await supabase.from("trainers").select("trainer_id, name")

    if (membersError || trainersError) {
      console.error("Error fetching:", membersError || trainersError)
      return
    }

    const trainerMap = {}
    trainersData.forEach(tr => {
      trainerMap[tr.trainer_id] = tr.name
    })

    const today = new Date()
    const updated = await Promise.all(
      membersData.map(async (member) => {
        const end = new Date(member.membership_end)
        let newStatus = "expired"
        if (isAfter(end, today)) {
          const daysLeft = differenceInDays(end, today)
          newStatus = daysLeft <= 14 ? "expiring soon" : "active"
        }

        let trainerStatus = "unassigned"
        if (member.trainer_assign_end_date) {
          const trainerEnd = new Date(member.trainer_assign_end_date)
          trainerStatus = isAfter(trainerEnd, today) ? "active" : "expired"
        }

        const updatedMember = {
          ...member,
          membership_status: newStatus,
          trainer_status: trainerStatus,
          trainer_name: trainerMap[member.trainer_assigned] || "-"
        }

        if (newStatus !== member.membership_status) {
          await supabase
            .from("members")
            .update({ membership_status: newStatus })
            .eq("member_id", member.member_id)
        }

        return updatedMember
      })
    )

    setMembers(updated)
  }

  const handleDelete = async (id: string) => {
    await supabase.from("members").delete().eq("member_id", id)
    fetchMembers()
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(search.toLowerCase()) ||
      member.member_id.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || member.membership_status === statusFilter

    const matchesTrainerStatus =
      trainerStatusFilter === "all" ||
      member.trainer_status === trainerStatusFilter

    return matchesSearch && matchesStatus && matchesTrainerStatus
  })

  const formatRemaining = (end: string) => {
    const today = new Date()
    const endDate = new Date(end)
    if (!isAfter(endDate, today)) return "Expired"
    const daysLeft = differenceInDays(endDate, today)
    return `${daysLeft} days left`
  }

  const handleEdit = (member) => {
    setEditMember(member)
    setDrawerOpen(true)
  }

  const getTrainerDaysLeft = (start: string, end: string) => {
    const today = new Date()
    const endDate = new Date(end)

    if (!isAfter(endDate, today)) return "Expired"

    const daysLeft = differenceInDays(endDate, today)
    return `${daysLeft} day${daysLeft > 1 ? "s" : ""} left`
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Members</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="all">Memberships</option>
          <option value="active">Active</option>
          <option value="expiring soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
        <select
          value={trainerStatusFilter}
          onChange={(e) => setTrainerStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="all">Trainerships</option>
          <option value="active">Trainer Active</option>
          <option value="expired">Trainer Expired</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const membershipText = formatRemaining(member.membership_end)

          const cardColor =
            member.membership_status === "expired"
              ? "bg-red-100 border-red-400"
              : member.trainer_status === "expired"
              ? "bg-pink-100 border-pink-400"
              : member.membership_status === "expiring soon"
              ? "bg-yellow-100 border-yellow-400"
              : ""

          return (
            <div
              key={member.member_id}
              className={`border p-4 rounded shadow flex flex-col justify-between ${cardColor}`}
            >
              <div>
                <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                <p><strong>ID:</strong> {member.member_id}</p>
                <p><strong>Phone:</strong> {member.phone}</p>
                <p><strong>Address:</strong> {member.address || "—"}</p>
                <p><strong>Join Date:</strong> {new Date(member.join_date).toLocaleDateString()}</p>
                <p><strong>Membership:</strong> {membershipText}</p>
                <p><strong>Status:</strong> {member.membership_status}</p>

                {member.trainer_name !== "-" && (
                  <>
                    <p><strong>Trainer:</strong> {member.trainer_name}</p>
                    <p><strong>Trainer Left:</strong> {
                      member.trainer_assign_start_date && member.trainer_assign_end_date
                        ? getTrainerDaysLeft(member.trainer_assign_start_date, member.trainer_assign_end_date)
                        : "—"
                    }</p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => router.push(`/pos/membership?member_id=${member.member_id}`)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Renew Membership
                </button>

                {member.trainer_assigned && (
                  <button
                    onClick={() => router.push(`/pos/trainers?member_id=${member.member_id}`)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Renew Trainer
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(member.member_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEdit(member)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <MemberDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={fetchMembers}
        editData={editMember}
      />
    </div>
  )
}
