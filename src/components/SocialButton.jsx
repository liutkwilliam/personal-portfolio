import React from 'react'

export default function SocialButton({ href, icon, name, ariaLabel }) {
    return (
        <>
            <a href={href} className="flex gap-2 items-center hover:text-primary" target="_blank" ariaLabel={ariaLabel}>
                <span>{icon}</span>
                <span>{name}</span>
            </a>
        </>
    )
}
