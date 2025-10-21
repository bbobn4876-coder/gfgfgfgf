import { SupabaseClient } from '@supabase/supabase-js';

type Role = 'admin' | 'team-leader' | 'team-member';

interface AvatarsConfig {
  supabase: SupabaseClient;
  getRole: () => Role;
  getCurrentUserToken: () => string;
}

export class Avatars {
  private supabase: SupabaseClient;
  private getRole: () => Role;
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
    const role = this.getRole();

    if (currentAvatar && currentAvatar !== '👤') {
      return currentAvatar;
    }

    const defaultAvatars = {
      admin: 'https://cdn.discordapp.com/attachments/1424455923136467024/1425076074789867552/Group_549_1_1.png?ex=68e64504&is=68e4f384&hm=b91133555c589c2451ea8d9b6edeec55f4a75fe509edd71c904f6c337c8debf0&',
      'team-leader': 'https://cdn.discordapp.com/attachments/1424455923136467024/1425127993398788186/Group_622_2.png?ex=68f0589f&is=68ef071f&hm=2485eeb9d98af767bc463f924a069871aa3013bb1405b35abde34cb9bc3e76b3&',
      'team-member': 'https://cdn.discordapp.com/attachments/1424455923136467024/1425150748655882250/Group_622_3.png?ex=68f06dd0&is=68ef1c50&hm=f033c4f153045910e741d7471cbf6beeaaf7f5aedfe1b18af903d4ce4cca08c9&'
    };

    return defaultAvatars[role];
  }

  async uploadAndSave(file: File): Promise<string> {
    try {
      const token = this.getCurrentUserToken();
      const fileExt = file.name.split('.').pop();
      const fileName = `${token}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await this.supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return this.ensureDefault('');
      }

      const { data: urlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      await this.supabase
        .from('users')
        .update({ avatar: avatarUrl })
        .eq('token', token);

      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return this.ensureDefault('');
    }
  }
}
