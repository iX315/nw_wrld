type InputType = 'midi' | 'osc'

export type NoteMatchMode = 'pitchClass' | 'exactNote'

export interface InputConfig {
  type: InputType;
  deviceId?: string;
  deviceName?: string;
  trackSelectionChannel: number;
  methodTriggerChannel: number;
  velocitySensitive: boolean;
  noteMatchMode?: NoteMatchMode | string;
  port: number;
}

export type MidiMapping = {
  pitchClass: Record<number, number>
  exactNote: Record<number, number>
}

export type OscillatorMapping = Record<number, string>

interface Mappings {
  midi: MidiMapping
  osc: OscillatorMapping
}

export interface GlobalMappings {
  trackMappings: Mappings
  channelMappings: Mappings
}

export interface UserData {
  config: {
    activeSetId: string
    activeTrackId: null,
    input: InputConfig,
    trackMappings: Mappings,
    channelMappings: Mappings,
    sequencerMode: boolean,
    sequencerBpm: number,
  },
  sets: { id: string, name: string, tracks: any[] }[]
}