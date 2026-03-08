export default function Description() {
  return (
    <section className="mx-auto w-full bg-[#efefef] px-5 py-14 font-[Poppins] md:px-8 lg:px-7">
      <div className="mx-auto w-full max-w-[1240px]">
        <div className="grid gap-5 md:grid-cols-2 md:items-start">
          <div>
            <span className="inline-flex rounded-full border border-[#1f1f1f] px-4 py-1.5 text-sm text-[#222]">
              Features
            </span>
          </div>
          <p className="max-w-[560px] text-sm leading-7 text-[#5f5f5f] md:justify-self-end">
            All the essential photo tools you need including background removal, resizing, and
            editing built into one seamless experience.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-12">
          <article className="rounded-[24px] bg-[#9da8ec] p-8 md:col-span-7">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#212121]">
              <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M18.2 14.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <h3 className="mt-7 text-3xl font-medium leading-none text-[#181818] md:text-[45px]">Remove Background</h3>
            <p className="mt-4 max-w-[640px] text-sm leading-7 text-[#3b3f53]">
              Instantly erase backgrounds with advanced AI-powered precision and get clean,
              professional-quality cut-outs in just seconds.
            </p>
          </article>

          <article className="rounded-[24px] bg-[#69d8b0] p-8 md:col-span-5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-[#212121]">
              <rect x="4.3" y="6.6" width="14.6" height="11.8" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M6.8 15l3.3-3.3 2.3 2.3 2.1-2.1 2.7 3.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="15.8" cy="9.8" r="1.1" fill="currentColor" />
              <path d="M6.5 3.7v4.5M4.2 5.9h4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <h3 className="mt-7 text-3xl font-medium leading-none text-[#181818] md:text-[45px]">Add Background</h3>
            <p className="mt-4 text-sm leading-7 text-[#245645]">
              Replace your background with solid colors, gradients, or custom images-no design
              skills needed.
            </p>
          </article>

          <article className="rounded-[24px] bg-[#72c3ec] p-8 md:col-span-5">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-[#212121]">
              <path d="M8.5 6.3l7.7-2.2 2.5 2.2-7.7 2.2-2.5-2.2zM8.5 6.3v9.5l2.5 2.1V8.5M11 8.5l7.7-2.2v9.4L11 18" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M5 9.4l-2 .7M3.2 13.3v-2.7M5 15.9l-2-.6M19.6 4l1.2-.4M20.6 7.1V5.7M19.6 8.8l1.2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <h3 className="mt-7 text-3xl font-medium leading-none text-[#181818] md:text-[45px]">Passport Size Photo</h3>
            <p className="mt-4 text-sm leading-7 text-[#1f5068]">
              Create perfectly sized passport photos that meet official standards with proper
              alignment and clarity.
            </p>
          </article>

          <article className="rounded-[24px] bg-[#f17879] p-8 md:col-span-7">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" className="text-[#212121]">
              <path d="M12 4l8 4.5-8 4.5-8-4.5L12 4zM4 12.3l8 4.5 8-4.5M4 16l8 4.5 8-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <h3 className="mt-7 text-3xl font-medium leading-none text-[#181818] md:text-[45px]">Stamp Size Photo</h3>
            <p className="mt-4 text-sm leading-7 text-[#672d2d]">
              Generate perfectly sized stamp photos instantly, ideal for official forms, documents,
              and all formal use cases.
            </p>
          </article>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex rounded-full border border-[#1f1f1f] px-4 py-1.5 text-sm text-[#222]">
              How It&apos;s Work
            </span>
            <p className="mt-16 max-w-[560px] text-sm leading-8 text-[#5f5f5f]">
              Upload your photo and let our AI remove the background instantly with accuracy. Then,
              customize your image by adding a solid color, gradient, or your own background.
              Finally, resize it for official use, creating passport or stamp size images ready for
              documents and printing.
            </p>
          </div>

          <div className="overflow-hidden rounded-[22px] w-full">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-2">
              <div className="flex items-center justify-center bg-[#f3f4f6]">
                <img
                  src="/images/bg-image400.png"
                  alt="Original portrait"
                  className="h-auto w-full max-h-[260px] object-contain"
                />
              </div>
              <div className="flex items-center justify-center bg-[#f3f4f6]">
                <img
                  src="/images/bg-image10.png"
                  alt="Background changed portrait"
                  className="h-auto w-full max-h-[260px] object-contain"
                />
              </div>
              <div className="flex items-center justify-center bg-[#f3f4f6]">
                <img
                  src="/images/bg-image40.png"
                  alt="Final edited image"
                  className="h-auto w-full max-h-[260px] object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
