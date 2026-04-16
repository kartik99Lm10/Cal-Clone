"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { motion } from "framer-motion";

type EventType = {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  slug: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = React.useState<EventType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EventType | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [duration, setDuration] = React.useState("30");

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ eventTypes: EventType[] }>("/api/event-types");
      setEventTypes(data.eventTypes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  function openCreate() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setDuration("30");
    setOpen(true);
  }

  function openEdit(et: EventType) {
    setEditing(et);
    setTitle(et.title);
    setDescription(et.description ?? "");
    setDuration(String(et.duration));
    setOpen(true);
  }

  async function onSubmit() {
    setError(null);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      duration: Number(duration),
    };
    if (!Number.isFinite(payload.duration) || payload.duration <= 0) {
      setError("Duration must be a positive number");
      return;
    }

    if (editing) {
      const prev = eventTypes;
      const next: EventType = {
        ...editing,
        title: payload.title,
        description: payload.description ?? null,
        duration: payload.duration,
      };
      setEventTypes((list) => list.map((et) => (et.id === editing.id ? next : et)));

      const promise = api(`/api/event-types/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }).then(async () => {
        setOpen(false);
        await refresh();
      });

      toast.promise(promise, {
        loading: "Saving event type…",
        success: "Event type updated",
        error: (err) => {
          setEventTypes(prev);
          return err instanceof Error ? err.message : "Save failed";
        },
      });
      return;
    }

    const tempId = `optimistic-${Date.now()}`;
    const optimistic: EventType = {
      id: tempId,
      title: payload.title,
      description: payload.description ?? null,
      duration: payload.duration,
      slug: "pending…",
    };
    setEventTypes((list) => [optimistic, ...list]);
    setOpen(false);

    const promise = api<{ eventType: EventType }>("/api/event-types", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then(async () => {
      await refresh();
    });

    toast.promise(promise, {
      loading: "Creating event type…",
      success: "Event type created",
      error: (err) => {
        setEventTypes((list) => list.filter((et) => et.id !== tempId));
        setOpen(true);
        return err instanceof Error ? err.message : "Save failed";
      },
    });
  }

  async function onDelete(id: string) {
    setError(null);
    const snapshot = eventTypes;
    setEventTypes((list) => list.filter((et) => et.id !== id));

    const promise = api(`/api/event-types/${id}`, { method: "DELETE" }).then(() =>
      refresh(),
    );

    toast.promise(promise, {
      loading: "Deleting…",
      success: "Event type deleted",
      error: (err) => {
        setEventTypes(snapshot);
        return err instanceof Error ? err.message : "Delete failed";
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Settings</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Event Types</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Create public booking links for different meeting types.
          </p>
        </div>
        <Button onClick={openCreate}>Create</Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
          ))}
        </div>
      ) : eventTypes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No event types yet</CardTitle>
            <CardDescription>Create your first event type to get a booking link.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {eventTypes.map((et) => (
            <Card key={et.id} className="p-0 hover:-translate-y-0.5 hover:border-zinc-300">
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-base font-semibold text-zinc-900">{et.title}</div>
                  <div className="mt-1 text-sm text-zinc-500">
                    {et.duration} min ·{" "}
                    <span className="font-mono text-xs">{et.slug}</span>
                  </div>
                  {et.description ? (
                    <div className="mt-2 text-sm text-zinc-500">
                      {et.description}
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => openEdit(et)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => onDelete(et.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit event type" : "Create event type"}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-600">
              Title
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-600">
              Description
            </div>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-zinc-600">
              Duration (minutes)
            </div>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>{editing ? "Save" : "Create"}</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

