import styles from './header.module.scss';

interface HeaderProps {
  className: string;
}

export default function Header({ className }: HeaderProps): JSX.Element {
  return (
    <header className={`${styles.container} ${styles[className]}`}>
      <img src="/assets/svg/Logo.svg" alt="Img Logo" />
    </header>
  );
}
