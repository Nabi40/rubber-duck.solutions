"use client";

export default function Footer() {
  const scrollToHero = () => {
    document.getElementById("hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="bg-[#efefef] px-4 pb-5 pt-5 font-[Poppins] sm:px-5 md:px-7">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#c9cfea] to-[#8b95eb] p-5 sm:p-6 md:rounded-[22px] md:p-9">
          <div className="grid gap-6 md:grid-cols-[1.05fr_1.15fr] md:items-center md:gap-7">
            <div>
              <h2 className="text-2xl font-medium leading-tight text-[#20222f] sm:text-3xl md:text-[40px] md:leading-none">
                Instant Passport Size Photo Maker
              </h2>
              <p className="mt-3 max-w-[630px] text-base leading-7 text-[#3f465f] sm:mt-4 sm:text-lg md:text-[20px]">
                Drag, Drop and print passport size photo in seconds.
              </p>
              <button
                onClick={scrollToHero}
                className="mt-6 w-full rounded-full bg-[#7382ef] px-6 py-2.5 text-sm text-white transition hover:bg-[#6575e4] sm:mt-8 sm:w-auto sm:px-7 sm:text-base"
              >
                Try Now
              </button>
            </div>

            <div className="order-first h-[220px] overflow-hidden rounded-t-[12px] border-4 border-[#2d2d30] bg-[#f0f0f0] sm:order-none sm:h-[280px] md:h-[390px] md:rounded-t-[16px] md:rounded-bl-none md:rounded-br-none">
              <img
                src="/images/bg-image10.png"
                alt="Background remover preview"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:mt-7 sm:gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-serif text-2xl leading-tight text-[#4f67b5] sm:text-3xl md:text-[44px] md:leading-none">
              passport size photo maker
            </p>
            <p className="mt-3 text-sm text-[#555] sm:mt-4 sm:text-base md:text-[18px]">
              &copy; 2025 Algibyte. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:gap-5 md:items-end">
            <div className="flex items-center gap-3 text-[#7483eb] sm:gap-4">
              <a href="#" aria-label="Facebook" className="text-lg font-semibold sm:text-[22px]">f</a>
              <a href="#" aria-label="Instagram" className="text-lg font-semibold sm:text-[22px]">o</a>
              <a href="#" aria-label="LinkedIn" className="text-lg font-semibold sm:text-[22px]">in</a>
              <a href="#" aria-label="X" className="text-base font-semibold sm:text-[20px]">X</a>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#555] sm:gap-6 sm:text-base md:text-[18px]">
              <a href="#">Privacy Statement</a>
              <a href="#">Terms &amp; Condition</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
