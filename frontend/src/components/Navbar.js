export default function Navbar() {
  return (
    <header className="w-full bg-[#FFFFFF]">
      <nav className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-3 sm:px-6">
        <h1 className="min-w-0 font-serif leading-none text-[#4c67b3]">
          <span className="block truncate text-xl sm:text-2xl md:text-3xl lg:text-[38px]">
            Rubber-Duck.Solutions
          </span>
        </h1>

        {/* <ul className="flex items-center gap-10 text-[16px] text-[#1f1f1f]">
          <li><a href="#">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">How It&apos;s Work</a></li>
        </ul> */}
      </nav>
    </header>
  );
}
