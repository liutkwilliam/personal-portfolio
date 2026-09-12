import { useEffect, useMemo, useState } from 'react';
import ProjectGrid from '../components/ProjectGrid';
import {
  fetchPortfolio,
  getPortfolioItemType,
  normalizePortfolioItem,
  visibleDeveloperProjects,
  visiblePortfolioProjects,
} from '../services/portfolioServices';
import useSubtitle from '../hooks/useSubtitle';

const pageConfig = {
  portfolio: {
    title: 'Design Portfolio',
    description: 'Creative work across graphic design, publication design, website design, and UI design.',
    items: visiblePortfolioProjects,
    dynamicType: 'portfolio',
  },
  developer: {
    title: 'Developer Portfolio',
    description: 'Frontend, static site, and full-stack web projects.',
    items: visibleDeveloperProjects,
    dynamicType: 'developer',
  },
};

function PortfolioPage({ type = 'portfolio' }) {
  const page = pageConfig[type] || pageConfig.portfolio;
  const [dynamicItems, setDynamicItems] = useState([]);

  useSubtitle({ title: page.title, description: page.description });

  useEffect(() => {
    if (!page.dynamicType) {
      return undefined;
    }

    let ignore = false;

    const loadDynamicItems = async () => {
      try {
        const portfolioItems = await fetchPortfolio();
        const pageItems = portfolioItems
          .filter((item) => item.live === true)
          .filter((item) => getPortfolioItemType(item) === page.dynamicType)
          .map(normalizePortfolioItem)
          .filter((item) => !item.hidden);

        if (!ignore) setDynamicItems(pageItems);
      } catch (error) {
        console.error('Error loading portfolio items:', error);
        if (!ignore) setDynamicItems([]);
      }
    };

    loadDynamicItems();

    return () => {
      ignore = true;
    };
  }, [page.dynamicType]);

  const items = useMemo(
    () =>
      [...page.items, ...(page.dynamicType ? dynamicItems : [])].sort(
        (first, second) => (second.date?.getTime() || 0) - (first.date?.getTime() || 0)
      ),
    [dynamicItems, page.dynamicType, page.items]
  );

  return (
    <>
      <main className="mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <section className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            William Liu
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">{page.description}</p>
        </section>
        <ProjectGrid items={items} />
      </main>
    </>
  )
}

export default PortfolioPage
