import { USE_MOCK_DATA } from '../config';
import * as local from './localAlbums';
import * as remote from './remoteAlbums';

const api = USE_MOCK_DATA ? local : remote;

export const fetchAlbums = (...args) => api.fetchAlbums(...args);
export const createAlbum = (...args) => api.createAlbum(...args);
export const updateAlbum = (...args) => api.updateAlbum(...args);
export const deleteAlbum = (...args) => api.deleteAlbum(...args);
