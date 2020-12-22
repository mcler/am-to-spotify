function formatMuskitArtworkUrl(artwork, sizeLimit = 600) {
    if (!artwork) return null;
    if (!window.MusicKit) return artwork;

    return window.MusicKit.formatArtworkURL(artwork, sizeLimit, sizeLimit);
}

export function musickitTrackToInternal({ id, attributes }) {
    return {
        musickit_track_id: id,
        musickit_album_id: null,
        musickit_track_love: false,
        spotify_track_id: null,
        spotify_album_id: null,
        spotify_track_love: false,

        album: attributes.albumName,
        // artwork: formatMuskitArtworkUrl(attributes.artwork),
        artist: attributes.artistName,
        name: attributes.name,
        number: attributes.trackNumber,
        year: attributes.releaseDate?.substr(0, 4),
    };
}

export function musickitAlbumToInternal({ id, attributes }, love) {
    return {
        musickit_album_id: id,
        musickit_album_love: love,
        spotify_album_id: null,
        spotify_album_love: null,

        album: attributes.name,
        artwork_lg: formatMuskitArtworkUrl(attributes.artwork),
        artwork_md: formatMuskitArtworkUrl(attributes.artwork, 400),
        artwork_sm: formatMuskitArtworkUrl(attributes.artwork, 200),
        artist: attributes.artistName,
        // number: album.track_number,
        year: attributes.releaseDate?.substr(0, 4),
    };
}

export function spotifyTrackToInternal(track, albumArg, trackLiked) {
    const album = track.album || albumArg;

    return {
        musickit_track_id: null,
        musickit_album_id: null,
        musickit_track_love: false,
        spotify_track_id: track.id,
        spotify_album_id: album?.id,
        spotify_track_love: trackLiked,

        album: album?.name,
        album_disc: track.disc_number,
        // artwork: album?.images[0]?.url,
        artist: track.artists[0]?.name,
        name: track.name,
        number: track.track_number,
        year: album?.release_date?.substr(0, 4),
    };
}

export function spotifyAlbumToInternal(album, love = false) {
    return {
        musickit_album_id: null,
        spotify_album_id: album.id,
        spotify_album_love: love,

        album: album.name,
        artwork_lg: album?.images[0]?.url,
        artwork_md: album?.images[1]?.url,
        artwork_sm: album?.images[2]?.url,
        artist: album?.artists[0]?.name,
        tracks: album?.total_tracks,
        year: album.release_date?.substr(0, 4),
    };
}
