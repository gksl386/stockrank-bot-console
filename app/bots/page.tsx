// /bots → / 로 리다이렉트 (대시보드와 동일)
import { redirect } from 'next/navigation';

export default function BotsRedirect() {
  redirect('/');
}
