import { classNames } from '@project/ui-components';
import { useTranslation } from 'react-i18next';

import styles from './styles/app.module.scss';

export function App() {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles, 'c-app')}>
      <h1 className={classNames(styles, 'c-app-title')}>{t('app.title')}</h1>
      <p>{t('app.description')}</p>
    </div>
  );
}
