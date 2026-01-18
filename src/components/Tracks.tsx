type Track = {
  id: string
  active: boolean
}

interface TracksProps {
  tracks?: Track[]
}

export const Tracks = ({tracks = []}: TracksProps) => {
  if (tracks.length === 0) {
    return (
      <div className="text-neutral-300/30 text-[11px]">
        No tracks to display.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 px-8">
      {tracks
        .filter((track) => track.active)
        .map(({id}) => (
          <div key={id}>
            track id: {id}
          </div>
        ))}
    </div>
  )
}