import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Instruction from "@/components/Instruction";
import Description from "@/components/Description";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      {/* <Instruction /> */}
      <Description />
      <Footer />
    </div>
  );
}
