import { redirect } from 'next/navigation';

export default function Page(): never {
  redirect('/auth/sign-in');
}
