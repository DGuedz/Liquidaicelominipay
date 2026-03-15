import { RouterProvider } from "react-router"
import { router } from "./routes"
import { ToastProvider } from "./components/toast-provider"

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex justify-center">
        <div
          className="w-full relative bg-background"
          style={{ maxWidth: "430px", minHeight: "100dvh" }}
        >
          <RouterProvider router={router} />
        </div>
      </div>
      <ToastProvider />
    </>
  )
}

export default App
