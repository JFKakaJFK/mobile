import { Link } from "gatsby"
import * as React from "react"
import Seo from "../components/seo"

const NotFoundPage = () => (
  <div className="flex min-h-screen w-full items-center justify-center">
    <Seo title="404: Not found" />
    <div>
      <h1 className="text-baby-blue font-black text-2xl text-center">404: Not Found</h1>
      <p>This page doesn&#39;t exist. Go to the <Link to="/" className="text-baby-blue underline">home page</Link>.</p>

    </div>
  </div>
)

export default NotFoundPage
