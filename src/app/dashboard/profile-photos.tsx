"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type PhotoRecord = {
  id: string;
  storage_path: string;
  is_primary: boolean;
  moderation_status: "pending" | "approved" | "rejected";
  created_at: string;
  signedUrl: string;
};

const BUCKET = "profile-photos";
const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfilePhotos({ userId }: { userId: string }) {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadPhotos = useCallback(async () => {
    const supabase = createClient();
    const { data, error: listError } = await supabase
      .from("profile_photos")
      .select("id,storage_path,is_primary,moderation_status,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (listError) throw listError;

    const records = await Promise.all((data ?? []).map(async photo => {
      const { data: signed, error: signedError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(photo.storage_path, 3600);
      if (signedError) throw signedError;
      return { ...photo, signedUrl: signed.signedUrl } as PhotoRecord;
    }));
    setPhotos(records);
  }, [userId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        await loadPhotos();
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "We could not load your photographs.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [loadPhotos]);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setNotice("");
    setError("");

    if (photos.length >= MAX_PHOTOS) {
      setError("You can upload a maximum of five photographs.");
      input.value = "";
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG or WebP image.");
      input.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Each photograph must be 5 MB or smaller.");
      input.value = "";
      return;
    }

    setUploading(true);
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const supabase = createClient();

    try {
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("profile_photos").insert({
        user_id: userId,
        storage_path: path,
        is_primary: photos.length === 0,
        moderation_status: "pending",
      });
      if (insertError) {
        await supabase.storage.from(BUCKET).remove([path]);
        throw insertError;
      }

      await loadPhotos();
      setNotice("Photograph uploaded. It is awaiting moderation and is visible only to you for now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The photograph could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  async function makePrimary(photo: PhotoRecord) {
    setWorkingId(photo.id);
    setNotice("");
    setError("");
    const supabase = createClient();
    try {
      const { error: clearError } = await supabase
        .from("profile_photos")
        .update({ is_primary: false })
        .eq("user_id", userId);
      if (clearError) throw clearError;

      const { error: setErrorResult } = await supabase
        .from("profile_photos")
        .update({ is_primary: true })
        .eq("id", photo.id)
        .eq("user_id", userId);
      if (setErrorResult) throw setErrorResult;

      await loadPhotos();
      setNotice("Main photograph updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not update your main photograph.");
    } finally {
      setWorkingId("");
    }
  }

  async function deletePhoto(photo: PhotoRecord) {
    if (!window.confirm("Delete this photograph from your WANANO profile?")) return;
    setWorkingId(photo.id);
    setNotice("");
    setError("");
    const supabase = createClient();
    try {
      const { error: deleteRecordError } = await supabase
        .from("profile_photos")
        .delete()
        .eq("id", photo.id)
        .eq("user_id", userId);
      if (deleteRecordError) throw deleteRecordError;

      const { error: deleteFileError } = await supabase.storage.from(BUCKET).remove([photo.storage_path]);
      if (deleteFileError) throw deleteFileError;

      if (photo.is_primary) {
        const { data: remaining, error: remainingError } = await supabase
          .from("profile_photos")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(1);
        if (remainingError) throw remainingError;
        if (remaining?.[0]) {
          const { error: primaryError } = await supabase
            .from("profile_photos")
            .update({ is_primary: true })
            .eq("id", remaining[0].id)
            .eq("user_id", userId);
          if (primaryError) throw primaryError;
        }
      }

      await loadPhotos();
      setNotice("Photograph deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not delete this photograph.");
      await loadPhotos().catch(() => undefined);
    } finally {
      setWorkingId("");
    }
  }

  return (
    <section className="member-card member-card-wide photo-manager">
      <div className="profile-editor-heading">
        <div>
          <span className="member-step">01B / YOUR PHOTOGRAPHS</span>
          <h2>Put a face to your introduction</h2>
          <p>Add up to five recent photographs. Your pictures remain private to your account until a WANANO moderator approves them.</p>
        </div>
        <span className="profile-edit-mark" aria-hidden="true">W</span>
      </div>

      <div className="photo-manager-toolbar">
        <div>
          <strong>{photos.length} of {MAX_PHOTOS} photographs</strong>
          <span>JPG, PNG or WebP · Maximum 5 MB each</span>
        </div>
        <label className={`button photo-upload-button ${uploading || photos.length >= MAX_PHOTOS ? "is-disabled" : ""}`}>
          {uploading ? "Uploading…" : "Add photograph"}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={uploading || photos.length >= MAX_PHOTOS} />
        </label>
      </div>

      {error && <p className="form-alert form-error" role="alert">{error}</p>}
      {notice && <p className="form-alert form-success" role="status">{notice}</p>}

      {loading ? <p className="photo-empty">Loading your photographs…</p> :
        photos.length === 0 ? (
          <div className="photo-empty">
            <span className="photo-empty-mark">+</span>
            <strong>Your photo collection starts here</strong>
            <span>Upload a clear, recent photograph of yourself.</span>
          </div>
        ) : (
          <div className="photo-grid">
            {photos.map(photo => (
              <article className="photo-item" key={photo.id}>
                <div className="photo-preview">
                  {/* Private signed URL; refreshed whenever the dashboard loads. */}
                  <img src={photo.signedUrl} alt="Your uploaded profile photograph" loading="lazy" decoding="async" />
                  {photo.is_primary && <span className="photo-primary-tag">Main photo</span>}
                </div>
                <div className="photo-item-meta">
                  <span className={`photo-review-tag photo-review-${photo.moderation_status}`}>
                    {photo.moderation_status === "pending" ? "Awaiting review" : photo.moderation_status === "approved" ? "Approved" : "Not approved"}
                  </span>
                  <div className="photo-actions">
                    {!photo.is_primary && <button type="button" onClick={() => void makePrimary(photo)} disabled={!!workingId}>{workingId === photo.id ? "Saving…" : "Make main"}</button>}
                    <button type="button" className="photo-delete" onClick={() => void deletePhoto(photo)} disabled={!!workingId}>{workingId === photo.id ? "Working…" : "Delete"}</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      }
      <p className="photo-privacy-note">Your photographs are stored in a private account folder. A pending photograph is not shown to other members.</p>
    </section>
  );
}
