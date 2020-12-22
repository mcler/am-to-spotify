export const SPOTIFY_SCOPES = [
    'user-read-private',

    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',

    'user-library-modify',
    'user-library-read',

    'user-follow-read',
    'user-follow-modify',
];

export const PROMISE_POOL_SIZE = 4;

export const NAV_ITEMS = [{
    key: 'tracks',
    text: 'Tracks',
},{
    key: 'liked-tracks',
    text: 'Liked Tracks',
},
{
    key: 'albums',
    text: 'Albums',
},
{
    disabled: true,
    key: 'artists',
    text: 'Artists',
}]
