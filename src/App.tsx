import { Toaster } from "./components/ui/sonner";
import { Routers } from "./routers";
import { customDateFormat } from "@/utils/dateFormatter"
function App() {
  customDateFormat()
  return (
    <>
      <Routers />
      <Toaster richColors visibleToasts={1} position="bottom-right" swipeDirections={["bottom"]} duration={5000} theme="system"/>
    </>
  );
}

export default App;