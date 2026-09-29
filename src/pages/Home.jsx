import { useEffect, useState } from 'react'
import CoverImage from '/images/portfolio-cover.jpg'
import Button from '../components/Button'
import { FaMapMarkerAlt } from "react-icons/fa";
import ScrollIndicator from '../components/ScrollIndicator';

const greetings = ["G'Day, it's", "Hello, I am", "哈囉, 我係", "你好, 我是"]
const msgs = ["Frontend Engineer | Graphic Designer | Photographer", "Bridging technical engineering and visual design to build responsive, accessible, and high-impact digital experiences."]

function Home() {
  const [index, setIndex] = useState(0);
  const [index2, setIndex2] = useState(0);

  const height = "w-full h-[100vh] flex items-center justify-center"

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
      <div className={` ${height} bg-gray-100`}>
        <div className={`relative ${height}`}>
          <img
            src={CoverImage}
            alt="homepage cover photo"
            className="absolute inset-0 w-full h-[100vh] object-cover z-0"
          />
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white opacity-85" />
          <div className="absolute container mx-auto px-4 insert-0 z-20 space-y-4">
            <p className="text-2xl font-semibold">{greetings[index]}</p>
            <p className="text-4xl md:text-6xl font-bold text-primary">William Liu</p>
            <p className="text-xl font-semibold w-full md:w-200 h-15">
              {msgs[index2]}
            </p>
            <p className='flex gap-4 items-center text-lg font-semi-bold'><FaMapMarkerAlt />Sydney, Australia</p>
          </div>
          <ScrollIndicator />
        </div>
      </div>
      {/* brief about */}
      <div className={`bg-gray-100 h-[90vh] flex items-center`}>
        <div className={`w-full md:w-[60vw] container mx-auto space-y-4`}>
          <p className="text-4xl md:text-6xl font-bold text-primary">A bit about me</p>
          <p>
            I am multi-disciplinary developer. I specialize in web application development, WCAG accessibility, and digital asset systems - combining code, design, and data integrity.
          </p>
          <div className="font-semibold space-y-4">
            <p>💻 Frontend & Software Engineering</p>
            <p>🎨 Interaction Design & Multimedia</p>
            <p>🗄️ Photography and Creative Documentation</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <Button size='lg' href={"/developer"} content={"View my Developer Portfolio"} />
            <Button size='lg' variant='secondary' href={"/portfolio"} content={"View my Design Portfolio"} />
            <Button size="lg" variant='secondary' href={"/about"} content={"About Me"} />
          </div>

        </div>
      </div>
    </>
  )
}

export default Home
