import { Suspense } from 'react';
import { fetchCustomersPages, fetchFilteredCustomers } from '@/app/lib/data';
import CustomersTable from '@/app/ui/customers/table';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import Pagination from '@/app/ui/customers/pagination';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';
import { CreateCustomer } from '@/app/ui/customers/buttons';

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const params = await Promise.resolve(searchParams);
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;

  const totalPages = await fetchCustomersPages(query);
  const customers = await fetchFilteredCustomers(query, currentPage);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Customers</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search customers..." />
        <CreateCustomer />
      </div>
      <Suspense key={query + currentPage} fallback={<CustomersTableSkeleton />}>
        <CustomersTable customers={customers} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}