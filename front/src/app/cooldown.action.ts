// cooldown.actions.ts
import { createAction } from '@ngrx/store';

export const startFollowCooldown = createAction('[Cooldown] Start Follow Cooldown');
export const endFollowCooldown = createAction('[Cooldown] End Follow Cooldown');
export const startUnfollowCooldown = createAction('[Cooldown] Start Unfollow Cooldown');
export const endUnfollowCooldown = createAction('[Cooldown] End Unfollow Cooldown');
