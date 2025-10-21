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

  async ensureDefault(currentAvatar: string): Promise<string> {
    try {
      if (currentAvatar && currentAvatar !== '👤') {
        return currentAvatar;
      }

      const role = this.getRole();
      const defaultAvatars: Record<'admin' | 'team-leader' | 'team-member', string> = {
        admin: '👨‍💼',
        'team-leader': '👤',
        'team-member': '👨‍💻',
      };

      const defaultAvatar = defaultAvatars[role];
      const token = this.getCurrentUserToken();

      if (token) {
        await this.supabase
          .from('users')
          .update({ avatar: defaultAvatar })
          .eq('token', token);
      }

      return defaultAvatar;
    } catch (error) {
      console.error('Error ensuring default avatar:', error);
      return '👤';
    }
  }

  async uploadAndSave(file: File): Promise<string> {
    try {
      const token = this.getCurrentUserToken();
      const fileExt = file.name.split('.').pop();
      const fileName = `${token}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await this.supabase
        .from('users')
        .update({ avatar: publicUrl })
        .eq('token', token);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return '👤';
    }
  }
}
