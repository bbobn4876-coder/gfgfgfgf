import { SupabaseClient } from '@supabase/supabase-js';

interface AvatarsConfig {
  supabase: SupabaseClient;
  getRole: () => 'admin' | 'team-leader' | 'team-member';
  getCurrentUserToken: () => string;
}

export class Avatars {
  private supabase: SupabaseClient;
  private getRole: () => 'admin' | 'team-leader' | 'team-member';
  private getCurrentUserToken: () => string;

  private constructor(config: AvatarsConfig) {
    this.supabase = config.supabase;
    this.getRole = config.getRole;
    this.getCurrentUserToken = config.getCurrentUserToken;
  }

  static init(config: AvatarsConfig): Avatars {
    return new Avatars(config);
  }

  async uploadAndSave(file: File): Promise<string> {
    try {
      const userToken = this.getCurrentUserToken();
      const fileExt = file.name.split('.').pop();
      const fileName = `${userToken}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await this.supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('token', userToken);

      return publicUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  }

  async delete(url: string): Promise<void> {
    try {
      const path = url.split('/avatars/')[1];
      if (!path) return;

      await this.supabase.storage
        .from('avatars')
        .remove([`avatars/${path}`]);
    } catch (error) {
      console.error('Failed to delete avatar:', error);
    }
  }

  async getUrl(token: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('avatar')
        .eq('token', token)
        .maybeSingle();

      if (error) throw error;
      return data?.avatar || null;
    } catch (error) {
      console.error('Failed to get avatar URL:', error);
      return null;
    }
  }
}
