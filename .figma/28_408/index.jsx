import React from 'react';

import styles from './index.module.scss';

const Component = () => {
  return (
    <div className={styles.elementBlockquote}>
      <div className={styles.border} />
      <p className={styles.text}>Quoted text goes here</p>
    </div>
  );
}

export default Component;
