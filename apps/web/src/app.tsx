import { useTranslation } from 'react-i18next';

import styles from './app.module.css';

export function App() {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t('app.title')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
