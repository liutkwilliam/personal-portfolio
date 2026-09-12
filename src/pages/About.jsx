import React from 'react'
import MarkdownContent from '../components/MarkdownContent';
import SocialButton from '../components/SocialButton';
import { MdOutlineEmail } from "react-icons/md";
import { FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import useSubtitle from '../hooks/useSubtitle';

function About() {
  useSubtitle({
    title: "About",
    description: "Learn more about William. Discover his creative and coding skills, as well as how to connect with him.",
  });
  const bio = `
## G'Day / Hello I'm William Liu

📍 Living in Gadigal Country / Sydney, Australia.

I am a Frontend Engineer, Graphic Designer and Photographer with background in Computer Science and Media Arts. 
I bridge the gap between techology and art & design. I build modern, responsive, and user-friendly web applications.

I specialize in frontend development (React, Next.js, TypeScript) and web accessibility (WCAG), backed by hands-on experience in database management.

Beyond coding, I wear a few other creative hats:

- 📷 Visual & Media: Artwork documentation, event photography, and digital collection managing and archiving for over 4000 assets
- 🎨 Design & Content: Social media marketing content, multimedia design, and graphic design where I applied on student societies and student community projects.

I’m always keen to chat about creative tech, digital design, and innovative projects.

Open to opportunities in Frontend Engineering, Software Development, Interaction Design, Multimedia Design and Photography.

Let’s connect and build something seamless!

#### Skills

- **Frontend Coding**: HTML / CSS / Javascript / ReactJS / TypeScript / TailwindCSS
- **Backend Coding**: Python / SQL / Node.js / Firebase
- **Design**: Photoshop / Illustrator / InDesign / Figma / Fusion 360 / Photo Editing / UI UX Design
- **Photos and Videos**: Photography / Video recording / Premiere Pro / After Effects

  `;

  return (
    <>
      <div className="flex items-center bg-white">
        <div className="container mx-auto px-3">
          <div className="flex justify-center items-center">
            <div className="w-full md:w-4/5 lg:w-1/2">
              <div className="mb-8">
                <MarkdownContent>{bio}</MarkdownContent>
              </div>
              <div className="mb-6">
                <h4 className="mb-2 mt-6 text-sm font-bold uppercase tracking-widest text-primary">Let's Connect</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <SocialButton icon={<FaInstagram />} href="https://www.instagram.com/liutkwilliam" name="Instagram" />
                  <SocialButton icon={<MdOutlineEmail />} href="mailto:liutk.william@gmail.com" name="liutk.william@gmail.com" />
                  <SocialButton icon={<FaLinkedin />} href="https://www.linkedin.com/in/liutkwilliam/" name="LinkedIn" />
                  <SocialButton icon={<FaGithub />} href="https://www.github.com/liutkwilliam/" name="GitHub" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default About
