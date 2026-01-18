import { PropsWithChildren } from "react"

export const Header = ({children}: PropsWithChildren) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#101010] border-b border-neutral-800 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          {children}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="opacity-50 text-[11px] text-neutral-300">
              nw_wrld
            </div>
            {/* add update button */}
          </div>
        </div>
      </div>
    </div>
  )
}
