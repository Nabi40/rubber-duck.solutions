const steps = [
  {
    id: "1",
    title: "Take photos",
    description:
      "Take photos against a clear background or download photos from any stock photo sites. Make sure its foreground can be identified from the backdrop.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10 text-[#9e9e9e]"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M5 5l2-2h10l2 2" />
      </svg>
    ),
  },
  {
    id: "2",
    title: "Upload",
    description:
      "Upload photos with the unwanted background to Mac, Windows, or Linux by clicking the drag & drop or pasting the image URL. Delete background like magic!",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10 text-[#9e9e9e]"
      >
        <path d="M12 5v14" />
        <path d="m19 12-7-7-7 7" />
        <path d="M5 19h14" />
      </svg>
    ),
  },
  {
    id: "3",
    title: "Edit and download",
    description:
      "Click Erase & Restore to fine-tune the results. Click Editor to add shadows, change the background color, change background photos, resize photos, and crop photos. Download JPG or PNG results for low-resolution photos or buy credits to download HD photos.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-10 w-10 text-[#9e9e9e]"
      >
        <path d="M12 5v14" />
        <path d="m5 12 7 7 7-7" />
        <path d="M5 5h14" />
      </svg>
    ),
  },
];

export default function Instruction() {
  return (
    <section
      className="w-full bg-blue-100
     px-4 py-16 font-[Poppins] sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <h2 className="text-center text-3xl font-black text-[#111] sm:text-4xl">
          How to remove background from photos for FREE?
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="relative rounded-[28px] border border-[#f1f1f1] bg-white px-6 pb-10 pt-10 text-center shadow-[0_25px_60px_rgba(0,0,0,0.08)]"
            >
              <div className="absolute left-0 top-0 flex items-center rounded-tr-[28px] rounded-bl-[28px] bg-blue-500 px-5 py-2 text-lg font-bold text-white">
                {step.id}
              </div>
              <div className="flex flex-col items-center gap-6">
                {step.icon}
                <div>
                  <h3 className="text-2xl font-bold text-[#111]">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-[#595959]">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
