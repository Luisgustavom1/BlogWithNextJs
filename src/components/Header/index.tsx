import Link from 'next/link';
import styles from './header.module.scss';

interface HeaderProps {
  className: string;
}

export default function Header({ className }: HeaderProps): JSX.Element {
  return (
    <header className={`${styles.container} ${styles[className]}`}>
      <Link href="/">
        <a>
          <img src="/assets/svg/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
