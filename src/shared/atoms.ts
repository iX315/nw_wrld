import { atom } from "jotai"
import { UserData } from "../types/userData"
import { DEFAULT_USER_DATA } from "../constants"

export const userDataAtom = atom<UserData>(DEFAULT_USER_DATA)
export const recordingDataAtom = atom({})
export const activeTrackIdAtom = atom(null)
export const activeSetIdAtom = atom(null)
export const selectedChannelAtom = atom(null)
export const flashingChannelsAtom = atom(new Set())
export const flashingConstructorsAtom = atom(new Set())
export const recordingStateAtom = atom({})
export const helpTextAtom = atom("")