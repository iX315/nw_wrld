import { Footer, Header, Tracks } from "../components"

function Dashboard() {
  return (
    <div className="saturate-150 font-roboto relative bg-[#101010] h-screen flex flex-col">
      <Header />
      <Tracks />
      <Footer />
    </div>
  )
}

export default Dashboard
