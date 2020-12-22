import { createStoreon } from 'storeon'

import { albums } from './albums';
import { musickit } from './musickit';
import { nav } from './nav';
import { progress } from './progress';
import { spotify } from './spotify';
import { tracks } from './tracks';
import { tracksLiked } from './tracksLiked';
import { selectedAlbums } from './selectedAlbums';
import { selectedTracks } from './selectedTracks';

export const store = createStoreon([
    albums, musickit, nav, progress, spotify, tracks, tracksLiked, selectedAlbums, selectedTracks,
])
