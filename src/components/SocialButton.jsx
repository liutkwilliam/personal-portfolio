import React from 'react'

export default function SocialButton({ href, Icon, name }) {
    return (
        <>
            <a href={href} className="flex gap-2 items-center hover:text-primary" target="_blank">
                <span>{Icon}</span>
                <span>{name}</span>
            </a>
        </>
    )
}
