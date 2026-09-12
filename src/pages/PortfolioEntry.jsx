import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import MarkdownContent from '../components/MarkdownContent';
import {
  developerProjects,
  fetchPortfolioItemBySlug,
  getPortfolioItemType,
  normalizePortfolioItem,
  portfolioProjects,
} from '../services/portfolioServices';
import useSubtitle from '../hooks/useSubtitle';

const collectionMap = {
  portfolio: portfolioProjects,
  developer: developerProjects,
};

const labelMap = {
  portfolio: 'Design Portfolio',
  developer: 'Developer Portfolio',
};

const backMap = {
  portfolio: '/portfolio',
  developer: '/developer',
};

function PortfolioEntry({ type = 'portfolio' }) {
  const { id } = useParams();
  const staticItem = collectionMap[type]?.find((entry) => entry.slug === id);
  const [dynamicItem, setDynamicItem] = useState(null);
  const [loadingDynamicItem, setLoadingDynamicItem] = useState(false);
  const [loadedDynamicKey, setLoadedDynamicKey] = useState('');
  const dynamicKey = `${type}:${id}`;
  const matchingDynamicItem =
    dynamicItem?.slug === id && dynamicItem?.type === type ? dynamicItem : null;
  const item = staticItem || matchingDynamicItem;

  useSubtitle({ title: item?.title, description: item?.description });

  useEffect(() => {
    if (staticItem || type === 'posts') {
      return undefined;
    }

    let ignore = false;

    const loadDynamicItem = async () => {
      setLoadingDynamicItem(true);

      try {
        const portfolioItem = await fetchPortfolioItemBySlug(id);
        const normalizedItem = portfolioItem ? normalizePortfolioItem(portfolioItem) : null;
        const belongsToPage = normalizedItem && getPortfolioItemType(portfolioItem) === type;

        if (!ignore) setDynamicItem(belongsToPage ? normalizedItem : null);
      } catch (error) {
        console.error('Error loading portfolio item:', error);
        if (!ignore) setDynamicItem(null);
      } finally {
        if (!ignore) {
          setLoadedDynamicKey(dynamicKey);
          setLoadingDynamicItem(false);
        }
      }
    };

    loadDynamicItem();

    return () => {
      ignore = true;
    };
  }, [dynamicKey, id, staticItem, type]);

  if (loadingDynamicItem || (!staticItem && type !== 'posts' && loadedDynamicKey !== dynamicKey)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="text-lg text-slate-600">Loading project...</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl font-bold text-slate-950">Project not found</h1>
        <Link className="mt-6 inline-block font-semibold text-primary" to={backMap[type]}>
          Back to {labelMap[type]}
        </Link>
      </main>
    );
  }

  const imageBase = `/images/${item.folder ? `${item.folder}/` : ''}`;

  return (
    <>
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-slate-950 text-center text-white">
        {item.coverImage && (
          <img
            src={item.coverImage}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        )}
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-24">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-primary">
            {labelMap[type]}
          </p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">{item.title}</h1>
          {item.date && <p className="mt-4 text-lg">{item.date.getFullYear()}</p>}
          {item.tags?.length > 0 && (
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em]">
              {item.tags.join(', ')}
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <Link className="mb-8 inline-block font-semibold text-primary hover:text-blue-800" to={backMap[type]}>
          {'<'} Back to {labelMap[type]}
        </Link>
        <article className="mx-auto max-w-3xl">
          <MarkdownContent>{item.content}</MarkdownContent>
        </article>

        {item.images.length > 0 && (
          <section className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {item.images.map((image, index) => (
              <figure key={`${image.image_path}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow">
                <img
                  src={image.isExternal ? image.image_path : `${imageBase}${image.image_path}`}
                  alt={image.title || `${item.title} image ${index + 1}`}
                  className="w-full object-cover"
                  loading="lazy"
                />
                {image.title && <figcaption className="p-3 text-sm text-slate-600">{image.title}</figcaption>}
              </figure>
            ))}
          </section>
        )}
      </main>
    </>
  )
}

export default PortfolioEntry
