import type { SupabaseClient } from '@supabase/supabase-js';

type AppRole = 'admin' | 'team-leader' | 'team-member' | 'user';

type InitOptions = {
  supabase: SupabaseClient;
  getRole: () => AppRole;
  getCurrentUserToken: () => string;
};

/**
 * Avatars service: handles default avatar selection and persistence of user-uploaded avatars.
 * Storage strategy: use Supabase Storage bucket "avatars" (public) if available; otherwise store URL as data URL (fallback).
 * For defaults, use local public files under /avatars/*.
 */
// Default CDN avatars per role
const ADMIN_DEFAULT = 'https://cdn.discordapp.com/attachments/1424455923136467024/1425076074789867552/Group_549_1_1.png?ex=68f02844&is=68eed6c4&hm=d9224452b1537460f872dee35754fcdd2c363704cf27ee11436cd9d24e5a2b13&';
const LEADER_DEFAULT = 'https://cdn.discordapp.com/attachments/1424455923136467024/1425127993398788186/Group_622_2.png?ex=68f0589f&is=68ef071f&hm=2485eeb9d98af767bc463f924a069871aa3013bb1405b35abde34cb9bc3e76b3&';
const MEMBER_DEFAULT = 'https://cdn.discordapp.com/attachments/1424455923136467024/1425150748655882250/Group_622_3.png?ex=68f06dd0&is=68ef1c50&hm=f033c4f153045910e741d7471cbf6beeaaf7f5aedfe1b18af903d4ce4cca08c9&';
const GENERIC_DEFAULT = MEMBER_DEFAULT;

export class Avatars {
  private supabase: SupabaseClient;
  private getRole: () => AppRole;
  private getCurrentUserToken: () => string;

  private constructor(opts: InitOptions) {
    this.supabase = opts.supabase;
    this.getRole = opts.getRole;
    this.getCurrentUserToken = opts.getCurrentUserToken;
  }

  static init(opts: InitOptions) {
    return new Avatars(opts);
  }

  getDefaultForRole(role: AppRole): string {
    if (role === 'admin') return ADMIN_DEFAULT;
    if (role === 'team-leader') return LEADER_DEFAULT;
    if (role === 'team-member') return MEMBER_DEFAULT;
    return GENERIC_DEFAULT;
  }

  /** Ensure the user has an avatar set; if none, assign role default in DB and return URL. */
  async ensureDefault(currentAvatarUrl?: string | null): Promise<string> {
    if (currentAvatarUrl && currentAvatarUrl.trim() !== '') return currentAvatarUrl;
    const role = this.getRole();
    const url = this.getDefaultForRole(role);
    try {
      await this.supabase.from('users')
        .update({ avatar: url, updated_at: new Date().toISOString() })
        .eq('token', this.getCurrentUserToken());
    } catch (_) {}
    return url;
  }

  /** Upload avatar image to Supabase Storage (if configured) and persist URL in users.avatar. */
  async uploadAndSave(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop() || 'png';
    const path = `${this.getCurrentUserToken()}/${Date.now()}.${fileExt}`;

    try {
      // Try storage bucket first
      const { data: uploaded, error: upErr } = await this.supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = this.supabase.storage.from('avatars').getPublicUrl(uploaded.path);
      const publicUrl = pub.publicUrl;

      await this.supabase.from('users')
        .update({ avatar: publicUrl, updated_at: new Date().toISOString() })
        .eq('token', this.getCurrentUserToken());

      return publicUrl;
    } catch (_storageError) {
      // Fallback: convert to data URL and store directly
      const dataUrl = await this.readAsDataUrl(file);
      try {
        await this.supabase.from('users')
          .update({ avatar: dataUrl, updated_at: new Date().toISOString() })
          .eq('token', this.getCurrentUserToken());
      } catch (_) {}
      return dataUrl;
    }
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}


