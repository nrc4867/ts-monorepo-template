import { useTranslation } from 'react-i18next';

import styles from './style/app.module.scss';

export function App() {
  const { t } = useTranslation();

  return (
    <div className={styles['c-app']}>
      <h1 className={styles['c-app-title']}>{t('app.title')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
