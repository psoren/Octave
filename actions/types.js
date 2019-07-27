// Authentication Actions
export const SPOTIFY_LOGIN_SUCCESS = 'spotify_login_success';
export const SPOTIFY_LOGIN_FAIL = 'spotify_login_fail';
export const REFRESH_TOKENS = 'refresh_tokens';

// Create Room Actions
export const APPEND_SONG_TO_CREATE_ROOM_QUEUE = 'append_song_to_create_room_queue';
export const PREPEND_SONG_TO_CREATE_ROOM_QUEUE = 'prepend_song_to_create_room_queue';
export const CHANGE_PENDING_ROOM_NAME = 'change_pending_room_name';
export const CREATE_ROOM = 'create_room';

// Room Actions
export const UPDATE_ROOM = 'update_room';
export const LISTENER_JOINED = 'listener_joined';
export const LISTENER_LEFT = 'listener_left';
export const CREATOR_LEFT = 'creator_left';
export const TOGGLE_PLAYBACK = 'toggle_playback';
export const NEXT_SONG = 'next_song';
export const PREVIOUS_SONG = 'previous_song';
export const JOIN_ROOM = 'join_room';
export const LEAVE_ROOM = 'leave_room';
