import { Footer, Header, Tracks } from "../components"

function Dashboard() {
  return (
    <div className="relative bg-[#101010] font-mono h-screen flex flex-col">
      <Header />
      <Tracks />
      <Footer />
    </div>
  )
}

export default Dashboard
