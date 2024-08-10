/**
 * @file MusicStore.ts
 * @description This file contains the MusicStore class which is responsible for managing the music data and actions.
 * @author Riprod
 * @version 0.8.0
 */
import { AUDIO_REQUESTS, SocketData, SongData } from '../types';
import WebSocketService from '../helpers/WebSocketService';

type SongDataUpdateCallback = (data: SongData) => void;

export class MusicStore {
  private static instance: MusicStore;
  private songData: SongData = {} as SongData;
  private songDataUpdateCallbacks: SongDataUpdateCallback[] = [];

  private constructor() {
    this.setupWebSocket();
  }

  private async setupWebSocket() {
    const socket = await WebSocketService; // Ensure WebSocketService is initialized
    socket.on('client', this.handleClientData.bind(this));
    this.requestMusicData()
  }

  static getInstance(): MusicStore {
    if (!MusicStore.instance) {
        MusicStore.instance = new MusicStore();
    }
    return MusicStore.instance;
  }

  private async handleClientData(msg: SocketData): Promise<void> {
    if (msg.type === 'song') {
      const data = msg.data as SongData;
      this.songData = data;
      this.notifySongDataUpdate();
    }
  }

  private async notifySongDataUpdate(): Promise<void> {
    this.songDataUpdateCallbacks.forEach(callback => callback(this.songData));
  }

  subscribeToSongDataUpdate(callback: SongDataUpdateCallback): () => void {
    this.songDataUpdateCallbacks.push(callback);
    return () => {
      this.songDataUpdateCallbacks = this.songDataUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  getSongData(): SongData {
    return this.songData;
  }

  async requestMusicData(): Promise<void> {
    if (WebSocketService.is_ready()) {
      const data = { app: 'utility', type: 'get', request: AUDIO_REQUESTS.SONG };
      WebSocketService.post(data);
    }
  }

  updateSongData(updatedData: Partial<SongData>): void {
    this.songData = { ...this.songData, ...updatedData };
    this.notifySongDataUpdate();
  }

  cleanup(): void {
    this.songDataUpdateCallbacks = [];
  }
}

export default MusicStore.getInstance();