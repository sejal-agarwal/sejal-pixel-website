import { Navbar } from "@/components/nav/Navbar";
import { LandingScene } from "@/components/landing/LandingScene";

// The name lives in the navbar and the full intro blurb has moved onto
// the billboard next to the house (see Billboard) — no separate cream
// hero section anymore, the navbar sits right on top of the scene.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Navbar />
      <LandingScene />
    </main>
  );
}
