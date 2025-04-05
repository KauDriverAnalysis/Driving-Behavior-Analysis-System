// src/app/page.tsx
import { redirect } from 'next/navigation';
import { paths } from '@/paths';

export default function Page(): never {
  redirect(paths.auth.homepage);
}