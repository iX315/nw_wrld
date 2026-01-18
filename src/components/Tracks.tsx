import { PropsWithChildren } from "react"

type Track = {
  id: string
  active: boolean
}

interface TracksProps {
  tracks?: Track[]
}

const Container = ({children}: PropsWithChildren) => (
  <div className="flex-1 overflow-y-auto pt-12 pb-32">
    <div className="bg-[#101010] p-6 font-mono">
      {children}
    </div>
  </div>
)

export const Tracks = ({tracks = []}: TracksProps) => {
  if (tracks.length === 0) {
    return (
      <Container>
        <div className="text-neutral-300/30 text-[11px]">
          No tracks to display.
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex flex-col gap-8 px-8">
        {tracks
          .filter((track) => track.active)
          .map(({id}) => (
            <div key={id}>
              track id: {id}
            </div>
          ))}
      </div>
    </Container>
  )
}