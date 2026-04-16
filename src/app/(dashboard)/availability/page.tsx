"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TimezoneSelect } from "@/components/ui/TimezoneSelect";
import { motion } from "framer-motion";

type Availability = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

const DAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export default function AvailabilityPage() {
  const [availability, setAvailability] = React.useState<Availability[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [dayOfWeek, setDayOfWeek] = React.useState("1");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("17:00");
  const [timezone, setTimezone] = React.useState("Asia/Kolkata");
  const [editing, setEditing] = React.useState<Availability | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editDayOfWeek, setEditDayOfWeek] = React.useState("1");
  const [editStartTime, setEditStartTime] = React.useState("09:00");
  const [editEndTime, setEditEndTime] = React.useState("17:00");
  const [editTimezone, setEditTimezone] = React.useState("Asia/Kolkata");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ availability: Availability[] }>("/api/availability");
      setAvailability(data.availability);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function onAdd() {
    setError(null);
    const tempId = `optimistic-${Date.now()}`;
    const optimistic: Availability = {
      id: tempId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      timezone,
    };
    setAvailability((prev) => [...prev, optimistic]);

    const promise = api<{ availability: Availability }>("/api/availability", {
      method: "POST",
      body: JSON.stringify({
        dayOfWeek: Number(dayOfWeek),
        startTime,
        endTime,
        timezone,
      }),
    }).then(() => refresh());

    toast.promise(promise, {
      loading: "Adding slot…",
      success: "Availability slot added",
      error: (err) => {
        setAvailability((prev) => prev.filter((a) => a.id !== tempId));
        return err instanceof Error ? err.message : "Failed to save";
      },
    });
  }

  function openEdit(a: Availability) {
    setEditing(a);
    setEditDayOfWeek(String(a.dayOfWeek));
    setEditStartTime(a.startTime);
    setEditEndTime(a.endTime);
    setEditTimezone(a.timezone);
    setEditOpen(true);
  }

  async function onSaveEdit() {
    if (!editing) return;
    setError(null);
    const prev = availability;
    const id = editing.id;
    const next: Availability = {
      id,
      dayOfWeek: Number(editDayOfWeek),
      startTime: editStartTime,
      endTime: editEndTime,
      timezone: editTimezone,
    };
    setAvailability((list) => list.map((a) => (a.id === id ? next : a)));

    const promise = api(`/api/availability/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        dayOfWeek: Number(editDayOfWeek),
        startTime: editStartTime,
        endTime: editEndTime,
        timezone: editTimezone,
      }),
    }).then(async () => {
      setEditOpen(false);
      setEditing(null);
      await refresh();
    });

    toast.promise(promise, {
      loading: "Saving…",
      success: "Slot updated",
      error: (err) => {
        setAvailability(prev);
        return err instanceof Error ? err.message : "Failed to save";
      },
    });
  }

  async function onDelete(id: string) {
    setError(null);
    const snapshot = availability;
    setAvailability((list) => list.filter((a) => a.id !== id));

    const promise = api(`/api/availability/${id}`, { method: "DELETE" }).then(() =>
      refresh(),
    );

    toast.promise(promise, {
      loading: "Removing slot…",
      success: "Slot removed",
      error: (err) => {
        setAvailability(snapshot);
        return err instanceof Error ? err.message : "Failed to delete";
      },
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Schedule</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Availability</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Set your weekly schedule and timezone.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add time slot</CardTitle>
          <CardDescription>Choose day, time range, and IANA timezone.</CardDescription>
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-xs font-medium text-zinc-600">
            Day
            <select
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-300"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-zinc-600">
            Start
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </label>
          <label className="space-y-1 text-xs font-medium text-zinc-600">
            End
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </label>
          <label className="space-y-1 text-xs font-medium text-zinc-600">
            Timezone
            <TimezoneSelect value={timezone} onChange={setTimezone} />
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={onAdd}>Add Slot</Button>
        </div>
      </Card>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
          ))}
        </div>
      ) : availability.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No availability set</CardTitle>
            <CardDescription>Add at least one slot to accept bookings.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3">
          {availability.map((a) => (
            <Card key={a.id} className="hover:-translate-y-0.5 hover:border-zinc-300">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-900">
                    {DAY_OPTIONS.find((d) => d.value === a.dayOfWeek)?.label} {a.startTime} -{" "}
                    {a.endTime}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500">{a.timezone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => openEdit(a)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(a.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit availability slot"
      >
        <div className="space-y-3">
          <label className="space-y-1 text-xs font-medium text-zinc-600">
            Day
            <select
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-300"
              value={editDayOfWeek}
              onChange={(e) => setEditDayOfWeek(e.target.value)}
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-zinc-600">
            Start
            <Input
              type="time"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-zinc-600">
            End
            <Input
              type="time"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
            />
          </label>
          <label className="space-y-1 text-xs font-medium text-zinc-600">
            Timezone
            <TimezoneSelect value={editTimezone} onChange={setEditTimezone} />
          </label>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSaveEdit}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
