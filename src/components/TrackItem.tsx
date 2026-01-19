import { FaPlus } from "react-icons/fa"
import { Button } from "./Button"
import { useAtom } from "jotai"
import { addModuleModalAtom } from "./Modals/AddModuleModal"

interface TrackItemProps {
  id: string
  modules: []
}

export const TrackItem = ({ _id, modules }: TrackItemProps) => {
  const [_addModuleModal, setAddModuleModal] = useAtom(addModuleModalAtom)

  return (
    <div className="mb-4 pb-4 font-mono">
      <div className="flex flex-col h-full w-full mb-4 relative">
        <div className="relative">
          <div>MODULE SELECTOR</div>
          {modules.length > 0 ? (
            <div className="absolute left-2.75 bottom-0 w-0.5 bg-neutral-800 h-4" />
          ) : null}
        </div>

        <div className="mb-6 relative">
          {modules.length === 0 ? (
            <div className="pl-12 text-neutral-300/30 text-[11px]">
              [NO MODULES ADDED]
            </div>
          ) : (
            <>
              <div className="absolute left-2.75 top-0 w-0.5 bg-neutral-800 h-full" />
              {/** TODO add Sortable list */}
            </>
          )}
        </div>

        <div className="flex items-center gap-6 mb-4">
          <Button onClick={() => setAddModuleModal({ isOpen: true })} icon={<FaPlus />}>
            MODULE
          </Button>
        </div>
      </div>

      {/** TODO add TrackDataModal */}
    </div>
  )
}

