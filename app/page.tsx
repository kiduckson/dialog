import { cookies } from "next/headers";
import ResizableLayout from "./components/resizable-layout";

export default function Home() {
  const layout = cookies().get("react-resizable-panels:layout");
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <section className="flex flex-col h-screen w-svw">
      <ResizableLayout defaultLayout={defaultLayout} defaultCollapsed={defaultCollapsed} />
    </section>
  );
}
