import type { SupabaseClient } from '@supabase/supabase-js';

type Role = 'admin' | 'team-leader' | 'team-member';

type OrderLike = {
  id: number;
  status: string;
  createdByToken?: string;
};

type InitOptions = {
  supabase: SupabaseClient;
  role: Role;
  currentUserToken: string;
  // Returns tokens considered part of the current team (leader + members).
  // For admin it can return an empty array; it will be ignored.
  getTeamTokens: () => string[];
};

type CreateNotificationOptions = {
  userToken: string;
  orderId?: number;
  message: string;
  type: string; // e.g. 'order_completed'
};

export class Notifications {
  private supabase: SupabaseClient;
  private role: Role;
  private currentUserToken: string;
  private getTeamTokens: () => string[];

  // Track viewed orders for bell state
  private viewedOrderIds: Set<number> = new Set();
  private lastKnownActiveOrderIds: number[] = [];
  private lastKnownTeamCompletedIds: number[] = [];

  // Sound management
  private orderCompletedAudio: HTMLAudioElement;
  private hasPlayedLoginSound = false;

  // Realtime
  private adminChannel: ReturnType<SupabaseClient['channel']> | null = null;

  private constructor(opts: InitOptions) {
    this.supabase = opts.supabase;
    this.role = opts.role;
    this.currentUserToken = opts.currentUserToken;
    this.getTeamTokens = opts.getTeamTokens;

    this.orderCompletedAudio = new Audio('https://www.dropbox.com/scl/fi/g3b8slews1acayylac009/Notification-FP.mp3?rlkey=74dsjn0kujrv2dlli0nfrqcow&st=zhy2pnqn&raw=1');
    this.orderCompletedAudio.preload = 'auto';

    if (this.role === 'admin') {
      this.setupAdminRealtime();
    }
  }

  static init(opts: InitOptions) {
    return new Notifications(opts);
  }

  // --- Public API ---

  onLogin(orders: OrderLike[]) {
    if (this.role === 'admin') return;
    if (this.hasPlayedLoginSound) return;

    const teamTokens = this.getTeamTokens();
    const completed = orders.filter(o => o.status === 'completed' && teamTokens.includes(o.createdByToken || ''));
    const unread = completed.filter(o => !this.viewedOrderIds.has(o.id));
    if (unread.length > 0) {
      this.playAudioSafely(this.orderCompletedAudio, 'login-unread-completed');
    }
    this.hasPlayedLoginSound = true;
  }

  onOrdersChanged(orders: OrderLike[]) {
    if (orders.length === 0) return;

    if (this.role === 'admin') {
      // Track active orders for admin bell state
      const activeIds = orders
        .filter(o => o.status === 'pending' || o.status === 'in-progress' || o.status === 'progress')
        .map(o => o.id);
      this.lastKnownActiveOrderIds = activeIds;
      return;
    }

    const teamTokens = this.getTeamTokens();
    const teamCompleted = orders
      .filter(o => o.status === 'completed' && teamTokens.includes(o.createdByToken || ''))
      .map(o => o.id);

    // Play sound for newly completed orders relevant to team
    const prevSet = new Set(this.lastKnownTeamCompletedIds);
    const newlyCompleted = teamCompleted.filter(id => !prevSet.has(id));
    if (newlyCompleted.length > 0) {
      this.playAudioSafely(this.orderCompletedAudio, 'newly-completed-team-orders');
    }
    this.lastKnownTeamCompletedIds = teamCompleted;
  }

  async hydrateFromDatabase(): Promise<void> {
    if (this.role === 'admin') return;
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('order_id, is_read')
        .eq('user_token', this.currentUserToken);
      if (error) throw error;
      (data || []).forEach((row: any) => {
        const orderId = row.order_id as number | null;
        if (!orderId) return;
        if (row.is_read) {
          this.viewedOrderIds.add(orderId);
        } else {
          this.viewedOrderIds.delete(orderId);
        }
      });
    } catch (e) {
      console.warn('Failed to hydrate notifications from DB:', e);
    }
  }

  isBellRed(orders: OrderLike[]): boolean {
    if (this.role === 'admin') {
      return orders.some(o => {
        const isActive = o.status === 'pending' || o.status === 'in-progress' || o.status === 'progress';
        return isActive && !this.viewedOrderIds.has(o.id);
      });
    }

    const teamTokens = this.getTeamTokens();
    return orders.some(o => {
      const isTeamRelevant = teamTokens.includes(o.createdByToken || '');
      return isTeamRelevant && o.status === 'completed' && !this.viewedOrderIds.has(o.id);
    });
  }

  async openBell(orders: OrderLike[]): Promise<void> {
    if (this.role === 'admin') {
      // Mark all active orders as viewed locally and broadcast clear for other admins
      const activeIds = orders
        .filter(o => o.status === 'pending' || o.status === 'in-progress' || o.status === 'progress')
        .map(o => o.id);
      activeIds.forEach(id => this.viewedOrderIds.add(id));
      await this.broadcastAdminClear();
      return;
    }

    const teamTokens = this.getTeamTokens();
    const completedIds = orders
      .filter(o => o.status === 'completed' && teamTokens.includes(o.createdByToken || ''))
      .map(o => o.id);
    completedIds.forEach(id => this.viewedOrderIds.add(id));

    // Persist: mark notifications as read for this user
    try {
      await this.supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_token', this.currentUserToken)
        .eq('is_read', false);
    } catch (e) {
      console.warn('Failed to mark notifications read:', e);
    }
  }

  getList(orders: OrderLike[]): OrderLike[] {
    if (this.role === 'admin') return orders;
    const teamTokens = this.getTeamTokens();
    return orders.filter(o => o.status === 'completed' && teamTokens.includes(o.createdByToken || ''));
  }

  async createForUser(opts: CreateNotificationOptions): Promise<void> {
    try {
      await this.supabase.from('notifications').insert({
        user_token: opts.userToken,
        message: opts.message,
        type: opts.type,
        order_id: opts.orderId ?? null,
      });
    } catch (e) {
      console.warn('Failed to insert notification:', e);
    }
  }

  // --- Internals ---

  private setupAdminRealtime() {
    try {
      this.adminChannel = this.supabase.channel('admin-bell');
      this.adminChannel.on('broadcast', { event: 'clear' }, (_payload) => {
        // Other admin cleared the bell → mark current active orders as viewed locally
        this.lastKnownActiveOrderIds.forEach(id => this.viewedOrderIds.add(id));
      });
      this.adminChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // no-op
        }
      });
    } catch (e) {
      console.warn('Failed to setup admin realtime:', e);
    }
  }

  private async broadcastAdminClear() {
    if (!this.adminChannel) return;
    try {
      await this.adminChannel.send({ type: 'broadcast', event: 'clear', payload: { t: Date.now() } });
    } catch (e) {
      console.warn('Failed to broadcast admin clear:', e);
    }
  }

  private playAudioSafely(audio: HTMLAudioElement, context: string) {
    try {
      audio.currentTime = 0;
      const p = audio.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {
          setTimeout(() => {
            audio.currentTime = 0;
            audio.play().catch(() => void 0);
          }, 150);
        });
      }
    } catch (e) {
      console.warn(`Audio play failed (${context})`, e);
    }
  }
}


