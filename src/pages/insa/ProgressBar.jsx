import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ percent }) => {
  return (
    <div className={styles['progress-container']}>
      <div
        className={styles['progress-bar']}
        style={{ width: `${percent}%` }}
      >
        {Math.round(percent)}%
      </div>
    </div>
  );
};

export default ProgressBar;
