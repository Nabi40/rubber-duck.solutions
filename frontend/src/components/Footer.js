export default function Footer() {
  return (
    <footer className="bg-[#efefef] px-5 pb-5 pt-5 font-[Poppins] md:px-7">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#c9cfea] to-[#8b95eb] p-7 md:p-9">
          <div className="grid gap-7 md:grid-cols-[1.05fr_1.15fr] md:items-center">
            <div>
              <h2 className="text-[40px] font-medium leading-none text-[#20222f]">
                Instant Background Removal Made Easy
              </h2>
              <p className="mt-4 max-w-[630px] text-[20px] leading-7 text-[#3f465f]">
                Give your photos a completely fresh and professional look by easily adding custom
                backgrounds of your choice and perfectly resizing them for all official documents,
                passport photos, stamps, and print-ready formats.
              </p>
              <button className="mt-8 rounded-full bg-[#7382ef] px-7 py-2.5 text-base text-white transition hover:bg-[#6575e4]">
                Upload Image
              </button>
            </div>

            <div className="h-[290px] overflow-hidden rounded-t-[16px] rounded-bl-none rounded-br-none border-4 border-[#2d2d30] bg-[#f0f0f0]">
              <img
                src="/images/seo.png"
                alt="Background remover preview"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-serif text-[44px] leading-none text-[#4f67b5]">Background Remover</p>
            <p className="mt-4 text-[18px] text-[#555]">&copy; 2025 Algibyte. All rights reserved.</p>
          </div>

          <div className="flex flex-col items-start gap-5 md:items-end">
            <div className="flex items-center gap-4 text-[#7483eb]">
              <a href="#" aria-label="Facebook" className="text-[22px] font-semibold">f</a>
              <a href="#" aria-label="Instagram" className="text-[22px] font-semibold">o</a>
              <a href="#" aria-label="LinkedIn" className="text-[22px] font-semibold">in</a>
              <a href="#" aria-label="X" className="text-[20px] font-semibold">X</a>
            </div>
            <div className="flex items-center gap-6 text-[18px] text-[#555]">
              <a href="#">Privacy Statement</a>
              <a href="#">Terms &amp; Condition</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
