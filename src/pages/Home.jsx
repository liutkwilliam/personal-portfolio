import { useRef } from 'react';
import CoverImage from '/images/background.png'
import Button from '../components/Button'
import { FaMapMarkerAlt } from "react-icons/fa";
import FeaturedProject from '../components/FeaturedProject';

function Home() {
  const featuredRef = useRef(null);

  const scrollToFeatured = () => {
    featuredRef.current?.scrollIntoView({
      behavior: 'smooth', // Enables smooth scrolling
      block: 'start'      // Aligns the top of the element to the top of the viewport
    });
  };
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
        <div className="container relative z-10 text-center w-full">
          <div>
            <p className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">William Liu</p>
            <p className="mt-2 text-lg font-semibold sm:text-xl">
              Frontend Developer | Creative Technologist | Graphic Designer | Photographer
            </p>
            <p className="mt-2 text-md font-semibold sm:text-xl">
              Bridging technical engineering and visual design to build <span className="text-primary font-bold">responsive, accessible, and high-impact digital experiences</span>.
            </p>
            <p className="mt-4 flex justify-center items-center gap-3 text-lg font-semibold"><FaMapMarkerAlt className='text-red-500' />Sydney, Australia</p>
            <Button size='lg' className="w-full sm:w-2xl mt-8" onClick={scrollToFeatured} content={"View Featured Project"} />
          </div>
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
      <section className="flex items-center bg-gray-100 px-4 py-16 sm:px-6 sm:py-20 md:min-h-[90vh] md:px-8 md:py-24"
        ref={featuredRef}
        id="featured-project">
        <div className="mx-auto w-full max-w-7xl space-y-6 md:w-3/5 md:space-y-8">
          <p className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">Featured Project</p>
          <FeaturedProject />
        </div>
      </section>
    </>
  )
}

export default Home
