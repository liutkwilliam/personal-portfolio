import { useEffect, useState } from 'react'
import CoverImage from '/images/portfolio-cover.jpg'
import Button from '../components/Button'
import { FaMapMarkerAlt } from "react-icons/fa";
import ScrollIndicator from '../components/ScrollIndicator';
import VerticalProjectSlideshow from '../components/VerticalProjectSlideShow';

const greetings = ["G'Day, it's", "Hello, I am", "哈囉, 我係", "你好, 我是"]
const msgs = ["Frontend Engineer | Graphic Designer | Photographer", "Bridging technical engineering and visual design to build responsive, accessible, and high-impact digital experiences."]

function Home() {
  const [index, setIndex] = useState(0);
  const [index2, setIndex2] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % greetings.length)
      setIndex2((prevIndex) => (prevIndex + 1) % msgs.length)
    }, 2000)

    return () => clearInterval(interval)

  })

  return (
    <>
      {/* cover */}
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gray-100 px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-24">
        <div className="absolute inset-0 -z-10">
          <img
            src={CoverImage}
            alt="homepage cover photo"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-white/85" />
        </div>
        <div className="container relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
            <div>
              <p className="text-2xl font-semibold">{greetings[index]}</p>
              <p className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">William Liu</p>
              <p className="mt-2 min-h-24 text-lg font-semibold sm:text-xl md:min-h-28">
                {msgs[index2]}
              </p>
              <p className="mt-4 flex items-center gap-3 text-lg font-semibold"><FaMapMarkerAlt />Sydney, Australia</p>
            </div>
            <div className="w-full min-w-0">
              <VerticalProjectSlideshow />
            </div>
          <ScrollIndicator />
        </div>
      </section>
      {/* brief about */}
      <section className="flex items-center bg-gray-100 px-4 py-16 sm:px-6 sm:py-20 md:min-h-[90vh] md:px-8 md:py-24">
        <div className="mx-auto w-full max-w-7xl space-y-6 md:w-3/5 md:space-y-8">
          <p className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">A bit about me</p>
          <p>
            I am multi-disciplinary developer. I specialize in web application development, WCAG accessibility, and digital asset systems - combining code, design, and data integrity.
          </p>
          <div className="font-semibold space-y-4">
            <p>💻 Frontend & Software Engineering</p>
            <p>🎨 Interaction Design & Multimedia</p>
            <p>🗄️ Photography and Creative Documentation</p>
          </div>
          <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Button size='lg' className="w-full sm:w-auto" href={"/developer"} content={"View my Developer Portfolio"} />
            <Button size='lg' className="w-full sm:w-auto" variant='secondary' href={"/portfolio"} content={"View my Design Portfolio"} />
            <Button size="lg" className="w-full sm:w-auto" variant='secondary' href={"/about"} content={"About Me"} />
          </div>

        </div>
      </section>
    </>
  )
}

export default Home
