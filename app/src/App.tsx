import Header from "./components/header"
import { Remote } from "./components/remote"
import { WithMobile } from "./components/with-mobile"

function App() {
  return (
    <WithMobile>
      <Header />
      <Remote />
    </WithMobile>
  )
}

export default App
