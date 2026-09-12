import { Link } from 'react-router-dom';

const variantClasses = {
    primary: 'bg-primary text-white hover:bg-blue-700 disabled:bg-gray-400',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    neutral: 'bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400',
    ghost: 'bg-transparent text-primary hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50',
};

const sizeClasses = {
    sm: 'px-3 py-1 text-sm rounded-full',
    md: 'px-4 py-2 text-sm rounded-full',
    lg: 'px-6 py-3 font-semibold rounded-full',
};

const getButtonClassName = ({ variant = 'primary', size = 'md', className = '' } = {}) =>
    [
        'inline-flex items-center justify-center rounded font-medium shadow-sm transition cursor-pointer disabled:cursor-not-allowed',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className,
    ]
        .filter(Boolean)
        .join(' ');

function Button({
    children,
    content,
    to,
    href,
    variant = 'primary',
    size = 'md',
    className = '',
    type = 'button',
    ...props
}) {
    const buttonContent = children ?? content;
    const combinedClassName = getButtonClassName({ variant, size, className });

    if (to) {
        return (
            <Link to={to} className={combinedClassName} {...props}>
                {buttonContent}
            </Link>
        );
    }

    if (href) {
        const isExternal = /^https?:\/\//.test(href);

        if (!isExternal) {
            return (
                <Link to={href} className={combinedClassName} {...props}>
                    {buttonContent}
                </Link>
            );
        }

        return (
            <a
                href={href}
                className={combinedClassName}
                target="_blank"
                rel="noreferrer"
                {...props}
            >
                {buttonContent}
            </a>
        );
    }

    return (
        <button type={type} className={combinedClassName} {...props}>
            {buttonContent}
        </button>
    );
}

export default Button;
