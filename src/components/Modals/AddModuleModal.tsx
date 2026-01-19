import { atom } from "jotai"
import { ModalAtom } from "../../types/utils"

export const addModuleModalAtom = atom<ModalAtom>({ isOpen: false })

export const AddModuleModal = () => {
  return <div>Add module ... </div>
}