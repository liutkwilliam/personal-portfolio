import { FaAngleDoubleDown } from "react-icons/fa";

export default function ScrollIndicator() {
  return (
    <>
      {/* scoll indication */}
      <div className="container mx-auto px-4  absolute bottom-[10%] z-100 opacity-80">
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
