import { FaAngleDoubleDown } from "react-icons/fa";

export default function ScrollIndicator() {
  return (
    <>
      {/* scoll indication */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 absolute bottom-[10%] z-100 opacity-80">
        <p className="flex items-center gap-2 font-light text-2xl text-black">
          <span>
            <FaAngleDoubleDown />
          </span>
          scroll down to continue
        </p>
      </div>
    </>
  );
}
