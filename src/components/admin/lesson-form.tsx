"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";
import { Loader2, Upload, X, Plus, CheckCircle2 } from "lucide-react";
import { saveLesson, type ActionState } from "@/lib/actions/curriculum";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { FormToast } from "@/components/form-toast";

type ModuleOption = { id: string; title: string };
type Attachment = { name: string; url: string };

type Props = {
  modules: ModuleOption[];
  lesson?: {
    id: string;
    moduleId: string;
    title: string;
    description: string | null;
    videoId: string | null;
    videoDuration: number | null;
    isFree: boolean;
    attachments: Attachment[];
  };
};

const initial: ActionState = {};

export function LessonForm({ modules, lesson }: Props) {
  const [state, action] = useFormState(saveLesson, initial);
  const [videoId, setVideoId] = useState(lesson?.videoId ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>(
    lesson?.attachments ?? []
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", lesson?.title ?? file.name);
      const res = await fetch("/api/admin/videos/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setVideoId(data.videoId);
      toast.success("Video uploaded.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="space-y-6">
      <FormToast state={state} />
      {lesson && <input type="hidden" name="id" value={lesson.id} />}

      {state.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="moduleId">Module</Label>
        <select
          id="moduleId"
          name="moduleId"
          defaultValue={lesson?.moduleId ?? modules[0]?.id ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={lesson?.title} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={lesson?.description ?? ""}
          rows={4}
        />
      </div>

      {/* Video */}
      <div className="space-y-2">
        <Label>Video</Label>
        <input type="hidden" name="videoId" value={videoId} />
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload video"}
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            {videoId && (
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Video set
              </span>
            )}
          </div>
          {uploadError && (
            <p className="mt-2 text-sm text-destructive">{uploadError}</p>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <Label htmlFor="videoIdManual" className="text-xs text-muted-foreground">
                Or paste a Bunny video ID
              </Label>
              <Input
                id="videoIdManual"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="guid-from-bunny"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="videoDuration" className="text-xs text-muted-foreground">
                Duration (seconds)
              </Label>
              <Input
                id="videoDuration"
                name="videoDuration"
                type="number"
                min={0}
                defaultValue={lesson?.videoDuration ?? ""}
                placeholder="600"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Free toggle */}
      <div className="flex items-center gap-2">
        <input
          id="isFree"
          name="isFree"
          type="checkbox"
          defaultChecked={lesson?.isFree}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="isFree" className="font-normal">
          Free preview lesson (max 2 per course)
        </Label>
      </div>

      {/* Attachments */}
      <div className="space-y-2">
        <Label>Attachments</Label>
        <div className="space-y-2">
          {attachments.map((a, i) => (
            <div key={i} className="flex gap-2">
              <Input
                name="attachmentName"
                value={a.name}
                placeholder="File name"
                onChange={(e) => {
                  const next = [...attachments];
                  next[i] = { ...next[i], name: e.target.value };
                  setAttachments(next);
                }}
              />
              <Input
                name="attachmentUrl"
                value={a.url}
                placeholder="https://…"
                onChange={(e) => {
                  const next = [...attachments];
                  next[i] = { ...next[i], url: e.target.value };
                  setAttachments(next);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setAttachments(attachments.filter((_, j) => j !== i))
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setAttachments([...attachments, { name: "", url: "" }])
            }
          >
            <Plus className="mr-2 h-4 w-4" /> Add attachment
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <SubmitButton variant="brand">Save lesson</SubmitButton>
      </div>
    </form>
  );
}
