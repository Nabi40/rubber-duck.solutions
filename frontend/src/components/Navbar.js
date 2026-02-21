export default function Navbar() {
  return (
    <header className="w-full bg-[#FFFFFF]">
      <nav className="mx-auto flex h-[56px] w-full items-center justify-between px-6">
        <h1 className="font-serif text-[38px] leading-none text-[#4c67b3]">
          Background Remover
        </h1>

        <ul className="flex items-center gap-10 text-[16px] text-[#1f1f1f]">
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">How It&apos;s Work</a></li>
        </ul>
      </nav>
    </header>
  );
}
