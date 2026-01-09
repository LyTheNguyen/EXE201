import { Header } from "../components/Header";
import { Scene1Problem } from "../components/Scene1Problem";
import { Scene2Solution } from "../components/Scene2Solution";
import { Scene3Processing } from "../components/Scene3Processing";
import { Scene4SmartMap } from "../components/Scene4SmartMap";
import { Scene5Benefits } from "../components/Scene5Benefits";

export function HomePage() {
  return (
    <div className="size-full overflow-y-auto">
      <Header />
      <Scene4SmartMap />
      <Scene1Problem />
      <Scene2Solution />
      <Scene3Processing />
      <Scene5Benefits />
    </div>
  );
}

