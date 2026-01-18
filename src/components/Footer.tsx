export const Footer = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#101010]">
      <div className="border-t border-neutral-800 py-4 px-6">
        <div className="flex justify-start items-start">
          <div className="text-[10px] text-neutral-600 font-mono leading-tight">
            <span>
              nw_wrld is developed & maintained by{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://daniel.aagentah.tech/"
                className="underline"
              >
                Daniel Aagentah
              </a>{" "}
              [Open-sourced under GPL-3.0 license.]
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-4 px-6">
        <div className="w-full flex justify-start gap-4 items-center">
          {/** TODO add config for sequencerMode */}
        </div>
      </div>
    </div>
  )
}