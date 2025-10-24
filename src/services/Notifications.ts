import { SupabaseClient } from '@supabase/supabase-js';

interface NotificationsConfig {
  supabase: SupabaseClient;
  role: 'admin' | 'team-leader' | 'team-member';
  currentUserToken: string;
  getTeamTokens: () => string[];
}

export class Notifications {
  private supabase: SupabaseClient;
  private role: 'admin' | 'team-leader' | 'team-member';
  private currentUserToken: string;
  private getTeamTokens: () => string[];
  private viewedOrderIds: Set<number> = new Set();

  private constructor(config: NotificationsConfig) {
    this.supabase = config.supabase;
    this.role = config.role;
    this.currentUserToken = config.currentUserToken;
    this.getTeamTokens = config.getTeamTokens;
  }

  static init(config: NotificationsConfig): Notifications {
    return new Notifications(config);
  }

  async hydrateFromDatabase(): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('user_token', this.currentUserToken);

      if (data) {
        this.viewedOrderIds = new Set(data.map((n: any) => n.order_id));
      }
    } catch (error) {
      console.error('Error hydrating notifications:', error);
    }
  }

  onLogin(): void {
    this.viewedOrderIds.clear();
  }

  hasUnviewedNotifications(orders: any[]): boolean {
    return this.getList(orders).length > 0;
  }

  async openBell(orders: any[]): Promise<void> {
    const unviewedOrders = this.getList(orders);

    for (const order of unviewedOrders) {
      this.viewedOrderIds.add(order.id);

      try {
        await this.supabase
          .from('notifications')
          .upsert({
            user_token: this.currentUserToken,
            order_id: order.id,
            viewed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_token,order_id'
          });
      } catch (error) {
        console.error('Error marking notification as viewed:', error);
      }
    }
  }

  isBellRed(orders: any[]): boolean {
    return this.getList(orders).length > 0;
  }

  getList(orders: any[]): any[] {
    console.log('[Notifications] getList called with orders:', orders);
    console.log('[Notifications] role:', this.role);
    console.log('[Notifications] currentUserToken:', this.currentUserToken);

    const filtered = orders.filter(order => {
      console.log(`[Notifications] Processing order ${order.id}:`, {
        status: order.status,
        createdByToken: order.createdByToken,
        viewedBefore: this.viewedOrderIds.has(order.id)
      });

      if (this.viewedOrderIds.has(order.id)) {
        console.log(`[Notifications] Order ${order.id} already viewed, skipping`);
        return false;
      }

      if (this.role === 'admin') {
        const result = order.status === 'в процессе' || order.status === 'pending' || order.status === 'progress';
        console.log(`[Notifications] Admin check for order ${order.id}:`, result);
        return result;
      }

      const teamTokens = this.getTeamTokens();
      console.log('[Notifications] teamTokens:', teamTokens);

      const isMyTeamOrder = teamTokens.includes(order.createdByToken);
      const isCompleted = order.status === 'отправлен' || order.status === 'sent' || order.status === 'completed';

      console.log(`[Notifications] Team leader check for order ${order.id}:`, {
        isMyTeamOrder,
        isCompleted,
        willShow: isMyTeamOrder && isCompleted
      });

      return isMyTeamOrder && isCompleted;
    });

    console.log('[Notifications] Filtered orders:', filtered);
    return filtered;
  }

  async createForUser(params: {
    orderId: number;
    userToken: string;
  }): Promise<void> {
    try {
      await this.supabase
        .from('notifications')
        .insert({
          user_token: params.userToken,
          order_id: params.orderId,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}
