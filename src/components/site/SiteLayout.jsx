import { Outlet } from 'react-router-dom';
import SiteFooter from './SiteFooter';

export default function SiteLayout() {
  return (
    <>
      <Outlet />
      <SiteFooter />
    </>
  );
}