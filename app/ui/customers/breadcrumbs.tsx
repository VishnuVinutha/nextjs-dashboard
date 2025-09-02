import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: {
    label: string;
    href: string;
    active?: boolean;
  }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 block">
      <ol className={`${lusitana.className} flex text-xl md:text-2xl`}>
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={breadcrumb.href}
            aria-current={breadcrumb.active}
            className={`${index === 0 ? 'pl-0' : 'pl-4'} flex items-center`}
          >
            {index > 0 ? <span className="mr-4 text-gray-400">/</span> : null}
            <Link
              href={breadcrumb.href}
              className={
                breadcrumb.active ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }
            >
              {breadcrumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
